# ContentKing Backend

AI-powered social media content creation platform backend built with FastAPI.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
copy .env.example .env
# Edit .env with your API keys
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
app/
├── api/v1/          # API endpoints
├── core/            # Core configuration
├── models/          # Database models
├── services/        # Business logic
├── workers/         # Background tasks
└── utils/           # Utilities
```
