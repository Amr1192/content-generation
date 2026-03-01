# ContentKing - AI Social Media Content Engine

Transform 1 idea into 30+ posts and 10 reels with AI-powered content generation, design, and optimization.

## Features

### Core Features (MVP)
- AI content generation from a single idea
- Reel script generation
- AI hashtag suggestions
- Auto-generated post designs
- Multi-platform support (Instagram, TikTok, Facebook, LinkedIn, Twitter)
- Brand profile management

### Coming Soon
- Social media publishing integration
- Analytics dashboard
- AI image generation
- Team collaboration
- Content calendar

## Tech Stack

### Backend
- Framework: FastAPI (Python)
- Database: MySQL
- Cache: Redis
- AI: OpenAI, Anthropic
- Image Processing: Pillow, OpenCV
- Task Queue: Celery

### Frontend
- Framework: Next.js 14 (React)
- Styling: Tailwind CSS
- State Management: Zustand
- Data Fetching: TanStack Query
- HTTP Client: Axios

## Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8+
- Redis (optional for some background tasks)

## First-Time Setup (Do Once)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/contentking_db
```

Create the database (if it does not exist):

```bash
venv\Scripts\python -c "from sqlalchemy.engine.url import make_url; from dotenv import dotenv_values; import pymysql; u=make_url(dotenv_values('.env')['DATABASE_URL']); c=pymysql.connect(host=u.host or 'localhost', port=u.port or 3306, user=u.username, password=u.password or '', autocommit=True); cur=c.cursor(); cur.execute(f\"CREATE DATABASE IF NOT EXISTS `{u.database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci\"); c.close(); print('DB ready')"
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Start Again After Closing Servers (Daily Flow)

Use two terminals from project root (`V1`).

### Terminal 1 - Backend

```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

## Verify It Is Running
- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

## Troubleshooting

### Port 8000 already in use

```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Port 3000 already in use

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Traceback mentions `importlib\__init__.py`
That line is usually a loader frame, not the real error. Check the final lines of the traceback for the actual cause.

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/contentking_db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=optional
REDIS_URL=redis://localhost:6379/0
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
