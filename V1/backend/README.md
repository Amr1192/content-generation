# ContentKing Backend

FastAPI backend for ContentKing.

## First-Time Setup (Do Once)

From project root (`V1`):

```bash
cd backend
python -m venv venv
venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and confirm:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/contentking_db
```

Make sure MySQL is running, then create DB once (if it does not exist):

```bash
venv\Scripts\python -c "from sqlalchemy.engine.url import make_url; from dotenv import dotenv_values; import pymysql; u=make_url(dotenv_values('.env')['DATABASE_URL']); c=pymysql.connect(host=u.host or 'localhost', port=u.port or 3306, user=u.username, password=u.password or '', autocommit=True); cur=c.cursor(); cur.execute(f\"CREATE DATABASE IF NOT EXISTS `{u.database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci\"); c.close(); print('DB ready')"
```

## Start Again After Closing Servers (Daily Flow)

Use two terminals from project root (`V1`).

### Terminal 1: Backend

```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

## Social OAuth Setup (Required Before Connecting Platforms)

If Settings -> Social shows:
`<Platform> OAuth is not configured. Set ... in backend/.env`
it means the app credentials are still empty.

In `backend/.env`, set these values from each platform developer portal:

```env
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=http://localhost:8000/api/v1/social/oauth/twitter/callback

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/v1/social/oauth/linkedin/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/v1/social/oauth/facebook/callback

INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=http://localhost:8000/api/v1/social/oauth/instagram/callback

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=http://localhost:8000/api/v1/social/oauth/tiktok/callback
```

Then restart backend:

```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Notes:
- Instagram publishing uses Meta Graph APIs and usually requires a Meta app + Facebook Page + Instagram Business account.
- LinkedIn/Facebook/TikTok apps may require extra permission review before production publishing.
- If you only want to test quickly, configure one platform first (Twitter/X is usually fastest).

### LinkedIn First (Step-by-Step)

If you want to start with LinkedIn only, do this:

1. Go to LinkedIn Developer Portal and create an app.
2. In app settings, add redirect URL:
   `http://localhost:8000/api/v1/social/oauth/linkedin/callback`
3. Enable products/permissions required for sign-in and posting (at minimum: Sign In with LinkedIn and Share on LinkedIn).
4. Copy your LinkedIn app credentials into `backend/.env`:

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/v1/social/oauth/linkedin/callback
LINKEDIN_API_VERSION=202601
```

5. Restart backend:

```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

6. Open frontend -> Settings -> Social -> click `Continue with LinkedIn`.
7. Sign in on LinkedIn and approve access. You should then see LinkedIn under connected accounts.

## If Start Fails

### Port 8000 already in use

```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Then run backend start command again.

### Port 3000 already in use

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Then run frontend start command again.

### `importlib` traceback line appears

That line is usually not the real error. Read the last lines of the traceback for the actual cause (for example missing driver, DB not found, wrong credentials).

### Frontend says "Cannot reach backend API" but backend is running

Most common causes:

1. Backend not restarted after `.env` changes
2. Frontend opened on `127.0.0.1` while CORS only allows `localhost` (or the reverse)

Fix:

```bash
# backend/.env should include both localhost and 127.0.0.1 origins
# then restart backend
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
