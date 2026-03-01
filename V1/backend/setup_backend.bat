@echo off
echo ========================================
echo Backend Setup Script
echo ========================================
echo.

echo Step 1: Checking if virtual environment exists...
if exist "venv\Scripts\activate.bat" (
    echo Virtual environment found!
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo No virtual environment found.
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
)

echo.
echo Step 2: Installing dependencies...
echo This may take a few minutes...
pip install -r requirements.txt

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend server, run:
echo   venv\Scripts\activate.bat
echo   python -m uvicorn app.main:app --reload
echo.
pause
