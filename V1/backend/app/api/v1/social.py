from typing import List, Optional, Dict, Any
from urllib.parse import quote_plus
import base64
import hashlib
import secrets
import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.content import Content
from app.models.social import SocialAccount

router = APIRouter(prefix="/social", tags=["Social Publishing"])

SUPPORTED_PLATFORMS = {"instagram", "facebook", "twitter", "linkedin", "tiktok"}
OAUTH_SUPPORTED_PLATFORMS = {"instagram", "facebook", "twitter", "linkedin", "tiktok"}

# state -> {"platform": str, "user_id": int, "code_verifier": Optional[str], "expires_at": float}
OAUTH_STATE_CACHE: Dict[str, Dict[str, Any]] = {}


class ConnectAccountRequest(BaseModel):
    platform: str
    account_handle: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

    @field_validator("platform")
    @classmethod
    def validate_platform(cls, value: str) -> str:
        platform = value.lower().strip()
        if platform not in SUPPORTED_PLATFORMS:
            raise ValueError(f"Unsupported platform: {platform}")
        return platform


class SocialAccountResponse(BaseModel):
    id: int
    platform: str
    account_handle: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class SharePostRequest(BaseModel):
    platforms: Optional[List[str]] = None


class ShareBulkRequest(BaseModel):
    content_ids: Optional[List[int]] = None
    platforms: Optional[List[str]] = None


class PublishPostRequest(BaseModel):
    platforms: Optional[List[str]] = None


class PublishBulkRequest(BaseModel):
    content_ids: Optional[List[int]] = None
    platforms: Optional[List[str]] = None


@router.get("/platforms")
async def get_supported_platforms():
    return {
        "platforms": sorted(list(SUPPORTED_PLATFORMS)),
        "oauth_supported_platforms": sorted(list(OAUTH_SUPPORTED_PLATFORMS)),
    }


@router.get("/accounts", response_model=List[SocialAccountResponse])
async def get_connected_accounts(
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.user_id == user_id,
            SocialAccount.is_active == True,  # noqa: E712
            SocialAccount.access_token.is_not(None),
            SocialAccount.platform.in_(list(OAUTH_SUPPORTED_PLATFORMS)),
        )
        .order_by(SocialAccount.platform.asc())
        .all()
    )
    return accounts


@router.post("/accounts/connect", response_model=SocialAccountResponse)
async def connect_account_manual(
    payload: ConnectAccountRequest,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    raise HTTPException(
        status_code=403,
        detail="Manual account linking is disabled for security. Use OAuth connection."
    )


@router.get("/oauth/{platform}/start")
async def oauth_start(
    platform: str,
    user_id: int = 1,  # TODO: Get from auth token
):
    platform = platform.lower().strip()
    if platform not in OAUTH_SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"OAuth not supported yet for {platform}")

    state = secrets.token_urlsafe(24)
    OAUTH_STATE_CACHE[state] = {
        "platform": platform,
        "user_id": user_id,
        "expires_at": time.time() + 600,
    }

    if platform == "twitter":
        if not settings.TWITTER_CLIENT_ID or not settings.TWITTER_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="Twitter OAuth is not configured. Set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET in backend/.env")

        code_verifier = secrets.token_urlsafe(64)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode("utf-8")).digest()
        ).decode("utf-8").rstrip("=")
        OAUTH_STATE_CACHE[state]["code_verifier"] = code_verifier

        scopes = "tweet.read tweet.write users.read offline.access"
        auth_url = (
            "https://twitter.com/i/oauth2/authorize"
            f"?response_type=code&client_id={quote_plus(settings.TWITTER_CLIENT_ID)}"
            f"&redirect_uri={quote_plus(settings.TWITTER_REDIRECT_URI)}"
            f"&scope={quote_plus(scopes)}"
            f"&state={quote_plus(state)}"
            f"&code_challenge={quote_plus(code_challenge)}"
            "&code_challenge_method=S256"
        )
        return {"platform": platform, "auth_url": auth_url}

    if platform == "linkedin":
        if not settings.LINKEDIN_CLIENT_ID or not settings.LINKEDIN_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in backend/.env")

        scopes = "openid profile email w_member_social"
        auth_url = (
            "https://www.linkedin.com/oauth/v2/authorization"
            f"?response_type=code&client_id={quote_plus(settings.LINKEDIN_CLIENT_ID)}"
            f"&redirect_uri={quote_plus(settings.LINKEDIN_REDIRECT_URI)}"
            f"&scope={quote_plus(scopes)}"
            f"&state={quote_plus(state)}"
        )
        return {"platform": platform, "auth_url": auth_url}

    if platform == "facebook":
        if not settings.FACEBOOK_APP_ID or not settings.FACEBOOK_APP_SECRET:
            raise HTTPException(status_code=400, detail="Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in backend/.env")

        scopes = "pages_show_list,pages_manage_posts,pages_read_engagement,public_profile"
        auth_url = (
            "https://www.facebook.com/v19.0/dialog/oauth"
            f"?client_id={quote_plus(settings.FACEBOOK_APP_ID)}"
            f"&redirect_uri={quote_plus(settings.FACEBOOK_REDIRECT_URI)}"
            f"&scope={quote_plus(scopes)}"
            f"&state={quote_plus(state)}"
        )
        return {"platform": platform, "auth_url": auth_url}

    if platform == "instagram":
        if not settings.INSTAGRAM_APP_ID or not settings.INSTAGRAM_APP_SECRET:
            raise HTTPException(status_code=400, detail="Instagram OAuth is not configured. Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in backend/.env")

        scopes = "instagram_basic,instagram_content_publish,pages_show_list,business_management"
        auth_url = (
            "https://www.facebook.com/v19.0/dialog/oauth"
            f"?client_id={quote_plus(settings.INSTAGRAM_APP_ID)}"
            f"&redirect_uri={quote_plus(settings.INSTAGRAM_REDIRECT_URI)}"
            f"&scope={quote_plus(scopes)}"
            f"&state={quote_plus(state)}"
        )
        return {"platform": platform, "auth_url": auth_url}

    if platform == "tiktok":
        if not settings.TIKTOK_CLIENT_KEY or not settings.TIKTOK_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="TikTok OAuth is not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in backend/.env")

        code_verifier = secrets.token_urlsafe(64)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode("utf-8")).digest()
        ).decode("utf-8").rstrip("=")
        OAUTH_STATE_CACHE[state]["code_verifier"] = code_verifier

        scopes = "user.info.basic,video.publish"
        auth_url = (
            "https://www.tiktok.com/v2/auth/authorize/"
            f"?client_key={quote_plus(settings.TIKTOK_CLIENT_KEY)}"
            "&response_type=code"
            f"&scope={quote_plus(scopes)}"
            f"&redirect_uri={quote_plus(settings.TIKTOK_REDIRECT_URI)}"
            f"&state={quote_plus(state)}"
            f"&code_challenge={quote_plus(code_challenge)}"
            "&code_challenge_method=S256"
        )
        return {"platform": platform, "auth_url": auth_url}

    raise HTTPException(status_code=400, detail=f"Unsupported OAuth platform: {platform}")


@router.get("/oauth/twitter/callback")
async def oauth_twitter_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return await _oauth_callback_common(
        platform="twitter",
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        db=db,
    )


@router.get("/oauth/linkedin/callback")
async def oauth_linkedin_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return await _oauth_callback_common(
        platform="linkedin",
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        db=db,
    )


@router.get("/oauth/facebook/callback")
async def oauth_facebook_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return await _oauth_callback_common(
        platform="facebook",
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        db=db,
    )


@router.get("/oauth/instagram/callback")
async def oauth_instagram_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return await _oauth_callback_common(
        platform="instagram",
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        db=db,
    )


@router.get("/oauth/tiktok/callback")
async def oauth_tiktok_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return await _oauth_callback_common(
        platform="tiktok",
        code=code,
        state=state,
        error=error,
        error_description=error_description,
        db=db,
    )


async def _oauth_callback_common(
    platform: str,
    code: Optional[str],
    state: Optional[str],
    error: Optional[str],
    error_description: Optional[str],
    db: Session,
):
    if error:
        message = f"OAuth failed: {error} {error_description or ''}".strip()
        return HTMLResponse(_oauth_result_html(False, message))

    if not code or not state:
        return HTMLResponse(_oauth_result_html(False, "Missing code/state in OAuth callback."))

    cached = OAUTH_STATE_CACHE.get(state)
    if not cached or cached.get("platform") != platform or cached.get("expires_at", 0) < time.time():
        return HTMLResponse(_oauth_result_html(False, "OAuth session expired or invalid. Please try again."))

    user_id = cached["user_id"]
    try:
        if platform == "twitter":
            token_data = await _twitter_exchange_code_for_token(code, cached.get("code_verifier", ""))
            me = await _twitter_get_me(token_data["access_token"])
            handle = me.get("username")
            refresh_meta = token_data.get("refresh_token")

        elif platform == "linkedin":
            token_data = await _linkedin_exchange_code_for_token(code)
            me = await _linkedin_get_me(token_data["access_token"])
            handle = me.get("name") or me.get("email") or "linkedin-account"
            refresh_meta = f"urn:li:person:{me.get('sub', '')}"

        elif platform == "facebook":
            token_data = await _facebook_exchange_code_for_token(code, settings.FACEBOOK_REDIRECT_URI, settings.FACEBOOK_APP_ID, settings.FACEBOOK_APP_SECRET)
            page = await _facebook_get_first_page(token_data["access_token"])
            handle = page.get("name") if page else "facebook-account"
            access_token = page.get("access_token") if page else token_data["access_token"]
            refresh_meta = f"page:{page.get('id')}" if page else None
            token_data["access_token"] = access_token

        elif platform == "instagram":
            token_data = await _facebook_exchange_code_for_token(code, settings.INSTAGRAM_REDIRECT_URI, settings.INSTAGRAM_APP_ID, settings.INSTAGRAM_APP_SECRET)
            me = await _facebook_get_me(token_data["access_token"])
            handle = me.get("name") or "instagram-account"
            refresh_meta = None

        elif platform == "tiktok":
            token_data = await _tiktok_exchange_code_for_token(code, cached.get("code_verifier", ""))
            me = await _tiktok_get_me(token_data.get("access_token", ""))
            handle = me.get("display_name") or me.get("open_id") or "tiktok-account"
            refresh_meta = token_data.get("refresh_token")

        else:
            raise RuntimeError(f"Unsupported OAuth platform: {platform}")

        existing = (
            db.query(SocialAccount)
            .filter(SocialAccount.user_id == user_id, SocialAccount.platform == platform)
            .first()
        )
        if existing:
            existing.account_handle = handle
            existing.access_token = token_data.get("access_token")
            existing.refresh_token = refresh_meta
            existing.is_active = True
        else:
            existing = SocialAccount(
                user_id=user_id,
                platform=platform,
                account_handle=handle,
                access_token=token_data.get("access_token"),
                refresh_token=refresh_meta,
                is_active=True,
            )
            db.add(existing)
        db.commit()
        return HTMLResponse(_oauth_result_html(True, f"{platform.title()} connected as {handle}"))
    except Exception as exc:
        return HTMLResponse(_oauth_result_html(False, f"{platform.title()} OAuth failed: {exc}"))
    finally:
        OAUTH_STATE_CACHE.pop(state, None)


@router.delete("/accounts/{platform}")
async def disconnect_account(
    platform: str,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    platform = platform.lower().strip()
    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.user_id == user_id, SocialAccount.platform == platform)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Connected account not found")

    account.is_active = False
    db.commit()
    return {"success": True, "message": f"{platform} disconnected"}


@router.post("/share/{content_id}")
async def share_post(
    content_id: int,
    payload: SharePostRequest,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    content = _get_user_content(db, user_id, content_id)
    platforms = _resolve_target_platforms(db, user_id, payload.platforms)
    share_text = _build_share_text(content.generated_text, content.caption, content.hashtags or [])
    links = _build_share_links(platforms, share_text)

    return {
        "success": True,
        "content_id": content_id,
        "platforms": platforms,
        "share_links": links,
    }


@router.post("/share/bulk")
async def share_bulk(
    payload: ShareBulkRequest,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    contents = _get_user_contents(db, user_id, payload.content_ids)
    platforms = _resolve_target_platforms(db, user_id, payload.platforms)
    result = []
    for item in contents:
        share_text = _build_share_text(item.generated_text, item.caption, item.hashtags or [])
        result.append(
            {
                "content_id": item.id,
                "platforms": platforms,
                "share_links": _build_share_links(platforms, share_text),
            }
        )

    return {"success": True, "count": len(result), "items": result}


@router.post("/publish/{content_id}")
async def publish_post(
    content_id: int,
    payload: PublishPostRequest,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    content = _get_user_content(db, user_id, content_id)
    platforms = _resolve_target_platforms(db, user_id, payload.platforms)
    result = await _publish_content_to_platforms(db, user_id, content, platforms)
    return {"success": True, "content_id": content_id, "results": result}


@router.post("/publish/bulk")
async def publish_bulk(
    payload: PublishBulkRequest,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    contents = _get_user_contents(db, user_id, payload.content_ids)
    platforms = _resolve_target_platforms(db, user_id, payload.platforms)
    items = []
    for content in contents:
        item_result = await _publish_content_to_platforms(db, user_id, content, platforms)
        items.append({"content_id": content.id, "results": item_result})
    return {"success": True, "count": len(items), "items": items}


def _get_user_content(db: Session, user_id: int, content_id: int) -> Content:
    content = (
        db.query(Content)
        .filter(Content.id == content_id, Content.user_id == user_id)
        .first()
    )
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


def _get_user_contents(db: Session, user_id: int, content_ids: Optional[List[int]]) -> List[Content]:
    query = db.query(Content).filter(Content.user_id == user_id)
    if content_ids:
        query = query.filter(Content.id.in_(content_ids))
    contents = query.order_by(Content.created_at.desc()).all()
    if not contents:
        raise HTTPException(status_code=404, detail="No content found for operation")
    return contents


def _resolve_target_platforms(db: Session, user_id: int, requested: Optional[List[str]]) -> List[str]:
    connected_rows = (
        db.query(SocialAccount.platform)
        .filter(
            SocialAccount.user_id == user_id,
            SocialAccount.is_active == True,  # noqa: E712
            SocialAccount.access_token.is_not(None),
            SocialAccount.platform.in_(list(OAUTH_SUPPORTED_PLATFORMS)),
        )
        .all()
    )
    connected = {row[0] for row in connected_rows}

    if requested:
        platforms = [p.lower().strip() for p in requested if p]
        invalid = [p for p in platforms if p not in SUPPORTED_PLATFORMS]
        if invalid:
            raise HTTPException(status_code=400, detail=f"Unsupported platforms: {', '.join(invalid)}")
        missing = [p for p in platforms if p not in connected]
        if missing:
            raise HTTPException(status_code=400, detail=f"These platforms are not connected via OAuth: {', '.join(missing)}")
        return platforms

    platforms = list(connected)
    if not platforms:
        raise HTTPException(status_code=400, detail="No OAuth-connected social platforms found. Connect at least one platform first.")
    return platforms


def _build_share_text(generated_text: str, caption: Optional[str], hashtags: List[str]) -> str:
    pieces = [generated_text.strip()]
    if caption:
        pieces.append(caption.strip())
    if hashtags:
        pieces.append(" ".join([f"#{tag}" for tag in hashtags]))
    return "\n\n".join([p for p in pieces if p])


def _build_share_links(platforms: List[str], share_text: str) -> Dict[str, Dict[str, str]]:
    text = quote_plus(share_text[:2800])
    links: Dict[str, Dict[str, str]] = {}
    for platform in platforms:
        if platform == "twitter":
            links[platform] = {"type": "web_intent", "url": f"https://twitter.com/intent/tweet?text={text}"}
        elif platform == "facebook":
            links[platform] = {"type": "web_intent", "url": f"https://www.facebook.com/sharer/sharer.php?quote={text}"}
        elif platform == "linkedin":
            links[platform] = {"type": "web_intent", "url": f"https://www.linkedin.com/sharing/share-offsite/?mini=true&summary={text}"}
        elif platform in {"instagram", "tiktok"}:
            links[platform] = {"type": "manual", "message": "Direct web share is not available. Use Publish after OAuth connection."}
    return links


async def _publish_content_to_platforms(db: Session, user_id: int, content: Content, platforms: List[str]) -> Dict[str, Any]:
    output: Dict[str, Any] = {}
    share_text = _build_share_text(content.generated_text, content.caption, content.hashtags or [])
    for platform in platforms:
        account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id == user_id,
                SocialAccount.platform == platform,
                SocialAccount.is_active == True,  # noqa: E712
            )
            .first()
        )
        if not account:
            output[platform] = {"status": "failed", "reason": "not_connected"}
            continue

        try:
            if platform == "twitter":
                result = await _twitter_publish_tweet(account.access_token or "", share_text)
                output[platform] = {"status": "published", "result": result}
            elif platform == "linkedin":
                result = await _linkedin_publish(account, share_text)
                output[platform] = {"status": "published", "result": result}
            elif platform == "facebook":
                result = await _facebook_publish(account, share_text)
                output[platform] = {"status": "published", "result": result}
            elif platform in {"instagram", "tiktok"}:
                output[platform] = {"status": "failed", "reason": "direct_publish_not_implemented_for_platform_yet"}
            else:
                output[platform] = {"status": "failed", "reason": "unsupported_platform"}
        except Exception as exc:
            output[platform] = {"status": "failed", "reason": str(exc)}
    return output


async def _twitter_exchange_code_for_token(code: str, code_verifier: str) -> Dict[str, Any]:
    token_url = "https://api.twitter.com/2/oauth2/token"
    data = {
        "code": code,
        "grant_type": "authorization_code",
        "client_id": settings.TWITTER_CLIENT_ID,
        "redirect_uri": settings.TWITTER_REDIRECT_URI,
        "code_verifier": code_verifier,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            token_url,
            data=data,
            auth=(settings.TWITTER_CLIENT_ID, settings.TWITTER_CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Twitter token exchange failed: {resp.text}")
        return resp.json()


async def _twitter_get_me(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            "https://api.twitter.com/2/users/me?user.fields=username,name",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Twitter profile fetch failed: {resp.text}")
        body = resp.json()
        return body.get("data", {})


async def _twitter_publish_tweet(access_token: str, text: str) -> Dict[str, Any]:
    if not access_token:
        raise RuntimeError("missing_access_token")
    payload = {"text": text[:280]}
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.twitter.com/2/tweets",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=payload,
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Twitter publish failed: {resp.text}")
        return resp.json()


async def _linkedin_exchange_code_for_token(code: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
                "client_id": settings.LINKEDIN_CLIENT_ID,
                "client_secret": settings.LINKEDIN_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"LinkedIn token exchange failed: {resp.text}")
        return resp.json()


async def _linkedin_get_me(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            "https://api.linkedin.com/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"LinkedIn profile fetch failed: {resp.text}")
        return resp.json()


async def _linkedin_publish(account: SocialAccount, text: str) -> Dict[str, Any]:
    author_urn = account.refresh_token or ""
    if not author_urn.startswith("urn:li:person:"):
        me = await _linkedin_get_me(account.access_token or "")
        author_urn = f"urn:li:person:{me.get('sub', '')}"
    payload = {
        "author": author_urn,
        "commentary": text[:3000],
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }
    versions_to_try: List[str] = []
    if settings.LINKEDIN_API_VERSION:
        versions_to_try.append(settings.LINKEDIN_API_VERSION.strip())
    versions_to_try.append(datetime.now(timezone.utc).strftime("%Y%m"))
    versions_to_try.extend(["202601", "202510", "202507", "202504", "202501"])

    dedup_versions: List[str] = []
    seen = set()
    for version in versions_to_try:
        if version and version not in seen:
            dedup_versions.append(version)
            seen.add(version)

    last_error = ""
    async with httpx.AsyncClient(timeout=30.0) as client:
        for version in dedup_versions:
            resp = await client.post(
                "https://api.linkedin.com/rest/posts",
                headers={
                    "Authorization": f"Bearer {account.access_token}",
                    "Content-Type": "application/json",
                    "LinkedIn-Version": version,
                    "X-Restli-Protocol-Version": "2.0.0",
                },
                json=payload,
            )
            if resp.status_code < 400:
                return resp.json() if resp.text else {"status": "ok", "linkedin_version": version}

            body = resp.text or ""
            last_error = f"LinkedIn publish failed (version {version}): {body}"
            if "NONEXISTENT_VERSION" not in body:
                break

    raise RuntimeError(last_error or "LinkedIn publish failed")


async def _facebook_exchange_code_for_token(code: str, redirect_uri: str, app_id: str, app_secret: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            "https://graph.facebook.com/v19.0/oauth/access_token",
            params={
                "client_id": app_id,
                "client_secret": app_secret,
                "redirect_uri": redirect_uri,
                "code": code,
            },
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Facebook token exchange failed: {resp.text}")
        return resp.json()


async def _facebook_get_me(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            "https://graph.facebook.com/v19.0/me",
            params={"fields": "id,name", "access_token": access_token},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Facebook profile fetch failed: {resp.text}")
        return resp.json()


async def _facebook_get_first_page(user_access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            "https://graph.facebook.com/v19.0/me/accounts",
            params={"access_token": user_access_token},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Facebook pages fetch failed: {resp.text}")
        pages = resp.json().get("data", [])
        return pages[0] if pages else {}


async def _facebook_publish(account: SocialAccount, text: str) -> Dict[str, Any]:
    page_id = ""
    if account.refresh_token and account.refresh_token.startswith("page:"):
        page_id = account.refresh_token.split("page:", 1)[1]
    if not page_id:
        raise RuntimeError("facebook_page_not_found_in_connection")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"https://graph.facebook.com/v19.0/{page_id}/feed",
            data={"message": text[:5000], "access_token": account.access_token or ""},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Facebook publish failed: {resp.text}")
        return resp.json()


async def _tiktok_exchange_code_for_token(code: str, code_verifier: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://open.tiktokapis.com/v2/oauth/token/",
            data={
                "client_key": settings.TIKTOK_CLIENT_KEY,
                "client_secret": settings.TIKTOK_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.TIKTOK_REDIRECT_URI,
                "code_verifier": code_verifier,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"TikTok token exchange failed: {resp.text}")
        return resp.json()


async def _tiktok_get_me(access_token: str) -> Dict[str, Any]:
    if not access_token:
        return {}
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            "https://open.tiktokapis.com/v2/user/info/",
            params={"fields": "open_id,display_name"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"TikTok profile fetch failed: {resp.text}")
        return (resp.json().get("data") or {}).get("user", {})


def _oauth_result_html(success: bool, message: str) -> str:
    color = "#14532d" if success else "#7f1d1d"
    bg = "#dcfce7" if success else "#fee2e2"
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px; background: {bg}; color: {color};">
        <h3>{'Connected' if success else 'Connection Failed'}</h3>
        <p>{message}</p>
        <p>You can close this window and return to the app.</p>
        <script>setTimeout(() => window.close(), 1500);</script>
      </body>
    </html>
    """
