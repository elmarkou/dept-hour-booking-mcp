@echo off
REM Auto-build script for MCP Docker image (Windows)
REM This script ensures the Docker image exists before running

set IMAGE_NAME=depthourbooking-dept-hour-booking:latest

REM Check if Docker image exists
docker image inspect %IMAGE_NAME% >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker image not found. Building...
    
    REM Try docker-compose first
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using docker-compose to build...
        docker-compose build
    ) else (
        echo Using docker build...
        docker build -t %IMAGE_NAME% .
    )
    
    if %errorlevel% neq 0 (
        echo Failed to build Docker image
        exit /b 1
    )
    echo Docker image built successfully!
) else (
    echo Docker image exists, skipping build
)

REM Run the container
docker run -i --rm ^
    -e "DEPT_CLIENT_ID=%DEPT_CLIENT_ID%" ^
    -e "DEPT_CLIENT_SECRET=%DEPT_CLIENT_SECRET%" ^
    -e "DEPT_GOOGLE_ID_TOKEN=%DEPT_GOOGLE_ID_TOKEN%" ^
    -e "DEPT_EMPLOYEE_ID=%DEPT_EMPLOYEE_ID%" ^
    -e "DEPT_CORPORATION_ID=%DEPT_CORPORATION_ID%" ^
    -e "DEPT_DEFAULT_ACTIVITY_ID=%DEPT_DEFAULT_ACTIVITY_ID%" ^
    -e "DEPT_DEFAULT_PROJECT_ID=%DEPT_DEFAULT_PROJECT_ID%" ^
    -e "DEPT_DEFAULT_COMPANY_ID=%DEPT_DEFAULT_COMPANY_ID%" ^
    -e "DEPT_DEFAULT_BUDGET_ID=%DEPT_DEFAULT_BUDGET_ID%" ^
    %IMAGE_NAME%
