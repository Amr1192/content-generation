# ContentKing - AI Social Media Content Engine

Transform **1 idea** into **30+ posts + 10 reels** with AI-powered content generation, design, and optimization.

![ContentKing Platform](https://img.shields.io/badge/Status-MVP-green) ![Python](https://img.shields.io/badge/Python-3.11+-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black)

## 🚀 Features

### Core Features (MVP)
- ✅ **AI Content Generation**: Generate 30+ unique posts from a single idea
- ✅ **Reel Scripts**: Create 10 viral-ready short-form video scripts
- ✅ **Smart Hashtags**: AI-powered hashtag recommendations with competition analysis
- ✅ **Auto Design**: Generate beautiful post designs with customizable templates
- ✅ **Multi-Platform**: Optimized for Instagram, TikTok, Facebook, LinkedIn, Twitter
- ✅ **Brand Management**: Multiple brand profiles with custom voice and style

### Coming Soon
- 🔜 Social media publishing integration
- 🔜 Analytics dashboard
- 🔜 AI image generation
- 🔜 Team collaboration
- 🔜 Content calendar

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Cache**: Redis
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Image Processing**: Pillow, OpenCV
- **Task Queue**: Celery

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **UI Components**: Custom + Radix UI

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env with your API keys and database credentials

# Create database
createdb contentking_db

# Run migrations (create tables)
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start development server
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔑 Environment Variables

### Backend (.env)
```env
# Required
DATABASE_URL=postgresql://postgres:password@localhost:5432/contentking_db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
OPENAI_API_KEY=your-openai-api-key

# Optional
ANTHROPIC_API_KEY=your-anthropic-api-key
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📖 Usage

### 1. Generate Content

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "5 tips for productivity",
    "platform": "instagram",
    "count": 30,
    "tone": "professional",
    "generate_designs": true
  }'
```

### 2. Generate Reel Scripts

```bash
curl -X POST http://localhost:8000/api/v1/content/reels/scripts \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Morning routine for success",
    "count": 10,
    "duration": "30s"
  }'
```

### 3. Generate Hashtags

```bash
curl -X POST http://localhost:8000/api/v1/content/hashtags \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your post content here",
    "platform": "instagram",
    "count": 30
  }'
```

## 🎨 Project Structure

```
content-King/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Configuration
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Deploy from GitHub
3. Run migrations

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL`
3. Deploy

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- FastAPI for the amazing framework
- Next.js team for the excellent React framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using AI-powered tools**
