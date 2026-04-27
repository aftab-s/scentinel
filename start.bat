@echo off
echo ========================================
echo   Scent-inel - Blind Buy Intelligence
echo ========================================
echo.

echo [1/3] Starting Backend...
cd backend
start cmd /k "venv\Scripts\activate && uvicorn main:app --reload"
cd ..

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo [3/3] Done!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul
