# Backend Dependency Installation Fix

## Error You're Seeing

```
ModuleNotFoundError: No module named 'pydantic_settings'
```

This means the Python packages required by the backend are not installed.

## Solution

You need to install the backend dependencies. Here are two ways to do it:

### Method 1: Using the Setup Script (Easiest - Windows)

1. Open Command Prompt or PowerShell
2. Navigate to the backend directory:
   ```bash
   cd D:\Amr\Ai\opensource\content-generation\V1\backend
   ```
3. Run the setup script:
   ```bash
   setup_backend.bat
   ```

This will automatically:
- Create a virtual environment
- Activate it
- Install all required packages

### Method 2: Manual Installation

1. Open Command Prompt or PowerShell
2. Navigate to the backend directory:
   ```bash
   cd D:\Amr\Ai\opensource\content-generation\V1\backend
   ```

3. Check if you have a virtual environment:
   ```bash
   # If venv folder exists, activate it:
   venv\Scripts\activate
   
   # If venv folder doesn't exist, create it first:
   python -m venv venv
   venv\Scripts\activate
   ```

4. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   This will install all packages including:
   - FastAPI
   - Uvicorn
   - SQLAlchemy
   - Pydantic Settings
   - PostgreSQL driver
   - OpenAI
   - And many more...

5. Wait for installation to complete (may take 2-5 minutes)

### Method 3: Quick Install (If you're not using venv)

If you're not using a virtual environment and want to install globally:

```bash
cd D:\Amr\Ai\opensource\content-generation\V1\backend
pip install -r requirements.txt
```

**Note:** Using a virtual environment is recommended to avoid conflicts with other Python projects.

## After Installation

Once the installation is complete, you can start the backend:

```bash
# Make sure you're in the backend directory
cd D:\Amr\Ai\opensource\content-generation\V1\backend

# If using venv, activate it first
venv\Scripts\activate

# Start the server
python -m uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Verify Installation

To verify all packages are installed correctly:

```bash
# Activate venv if using it
venv\Scripts\activate

# Check installed packages
pip list

# You should see packages like:
# fastapi, uvicorn, sqlalchemy, pydantic-settings, etc.
```

## Common Issues

### Issue: "pip is not recognized"

**Solution:** Make sure Python is installed and added to PATH. Try:
```bash
python -m pip install -r requirements.txt
```

### Issue: "Permission denied"

**Solution:** Run Command Prompt as Administrator, or use:
```bash
pip install --user -r requirements.txt
```

### Issue: Installation fails for some packages

**Solution:** Make sure you have:
- Python 3.11 installed
- Microsoft Visual C++ Build Tools (for some packages)
- Internet connection

### Issue: "Cannot find requirements.txt"

**Solution:** Make sure you're in the backend directory:
```bash
cd D:\Amr\Ai\opensource\content-generation\V1\backend
dir requirements.txt  # Should show the file
```

## Next Steps

After successful installation:

1. ✅ Start the backend server
2. ✅ Verify it's running at http://localhost:8000/docs
3. ✅ Start the frontend server
4. ✅ Test registration at http://localhost:3000/signup

See `QUICK_START.md` for the complete testing guide.
