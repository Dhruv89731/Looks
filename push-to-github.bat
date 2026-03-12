@echo off
set "GIT_CMD=C:\Users\DhruvVaghasiya\AppData\Local\Programs\Git\cmd\git.exe"

echo =========================================
...
echo 🚀 Pushing Looks Salon to GitHub
echo =========================================
echo.

echo 1. Initializing Git repository...
"%GIT_CMD%" init

echo 2. Adding all files...
"%GIT_CMD%" add .

echo 3. Saving the initial commit...
"%GIT_CMD%" commit -m "Initial commit with full stack React & PostgreSQL backend"

echo 4. Adding your GitHub remote...
"%GIT_CMD%" remote add origin https://github.com/Dhruv89731/Looks.git

echo 5. Setting branch to main...
"%GIT_CMD%" branch -M main

echo 6. Pushing to GitHub...
echo (A browser window might pop up asking you to log into GitHub to authorize this push)
"%GIT_CMD%" push -u origin main

echo.
echo =========================================
echo ✅ All done! Press any key to close this window.
pause
