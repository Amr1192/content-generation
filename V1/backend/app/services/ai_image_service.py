from datetime import datetime
from pathlib import Path
from typing import Optional
import base64

import httpx
from openai import OpenAI

from app.core.config import settings


class AIImageService:
    """Context-aware AI image generation service."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_IMAGE_MODEL
        self.output_dir = Path("uploads/designs")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_image(self, prompt: str, size: str = "1024x1024") -> str:
        """
        Generate an AI image and save it locally.

        Returns:
            Relative image path, e.g. uploads/designs/ai_*.png
        """
        last_error: Optional[Exception] = None
        models_to_try = [self.model]
        if self.model != "dall-e-3":
            models_to_try.append("dall-e-3")

        for model_name in models_to_try:
            try:
                response = self.client.images.generate(
                    model=model_name,
                    prompt=prompt,
                    size=size,
                )

                data = response.data[0]
                b64_json = getattr(data, "b64_json", None)
                image_url = getattr(data, "url", None)

                filename = f"ai_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.png"
                output_path = self.output_dir / filename

                if b64_json:
                    output_path.write_bytes(base64.b64decode(b64_json))
                    return str(output_path).replace("\\", "/")

                if image_url:
                    with httpx.Client(timeout=30.0) as client:
                        resp = client.get(image_url)
                        resp.raise_for_status()
                        output_path.write_bytes(resp.content)
                    return str(output_path).replace("\\", "/")

                raise ValueError("Image API response did not include image bytes or URL.")
            except Exception as exc:
                last_error = exc

        raise RuntimeError(f"AI image generation failed: {last_error}")


ai_image_service = AIImageService()
