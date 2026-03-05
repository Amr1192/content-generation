# Quick Start Guide - Testing Registration

## Step 0: Install Backend Dependencies (First Time Only)

**IMPORTANT:** Before starting the backend for the first time, you need to install the dependencies.

### Option A: Using the Setup Script (Recommended for Windows)

```bash
cd backend
setup_backend.bat
```

This will:
- Create a virtual environment (if it doesn't exist)
- Activate it
- Install all required packages

### Option B: Manual Installation

```bash
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**You only need to do this once!** After installation, you can skip to Step 2 next time.

---

## Step 1: Start PostgreSQL Database

Make sure PostgreSQL is running with the database `contentking_db`.

If you need to create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE contentking_db;

# Exit
\q
```

## Step 2: Start Backend Server

Open a terminal in the `backend` directory:

```bash
cd backend

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Start the server
python -m uvicorn app.main:app --reload
```

If you are in the project root (`V1`) and do not want to change directories, run:
```bash
backend\venv\Scripts\python -m uvicorn --app-dir backend app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test it:** Open http://localhost:8000/docs in your browser to see the API documentation.

## Step 3: Test Backend (Optional but Recommended)

In another terminal, run the test script:

```bash
cd backend
python test_backend.py
```

This will verify:
- ✅ Backend is running
- ✅ Database is connected
- ✅ Registration endpoint works

## Step 4: Start Frontend Server

Open a terminal in the `frontend` directory:

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

## Step 5: Test Registration

1. Open your browser to: http://localhost:3000/signup

2. Fill in the registration form:
   - **Full Name:** John Doe
   - **Email:** john@example.com
   - **Password:** password123
   - **Confirm Password:** password123
   - ✅ Check "I agree to the Terms"

3. Click **"Create Account"**

4. **Expected Result:**
   - You should be redirected to `/dashboard`
   - Check browser console (F12) for any errors
   - Check backend terminal for the API request log

## Step 6: Verify in Database

```bash
# Connect to database
psql -U postgres -d contentking_db

# Check if user was created
SELECT * FROM users;

# You should see your user with:
# - email: john@example.com
# - username: john
# - full_name: John Doe
# - subscription_tier: free
# - is_active: true
```

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify `.env` file exists in `backend/` directory
- Check PostgreSQL credentials in `.env`

### Frontend won't start
- Run `npm install` in the frontend directory
- Check if port 3000 is already in use
- Verify `.env.local` exists in `frontend/` directory

### Registration shows "Network Error"
- Make sure backend is running on http://localhost:8000
- Check browser console (F12) for detailed error
- Verify `.env.local` has correct API URL

### "Email already registered" error
- The email is already in the database
- Try a different email
- Or delete the user from database and try again

### Database connection error
- Make sure PostgreSQL is running
- Verify database `contentking_db` exists
- Check credentials in `backend/.env`

## Quick Commands Reference

### Backend
```bash
# Start backend
cd backend
python -m uvicorn app.main:app --reload

# Start backend from project root (alternative)
backend\venv\Scripts\python -m uvicorn --app-dir backend app.main:app --reload

# Test backend
python test_backend.py

# View API docs
# Open: http://localhost:8000/docs
```

### Frontend
```bash
# Start frontend
cd frontend
npm run dev

# Open app
# Open: http://localhost:3000
```

### Database
```bash
# Connect to database
psql -U postgres -d contentking_db

# View users
SELECT * FROM users;

# Delete a user (for testing)
DELETE FROM users WHERE email = 'john@example.com';
```

## What's Next?

After successful registration:
1. Test the login page at http://localhost:3000/login
2. Explore the dashboard
3. Try generating content
4. Check out the API documentation at http://localhost:8000/docs

## Need Help?

Check the detailed documentation in `REGISTRATION_FIX.md` for:
- Complete list of changes made
- Detailed API endpoint information
- Common issues and solutions
- Architecture overview
