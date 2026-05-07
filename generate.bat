@echo off
setlocal enabledelayedexpansion
:: ════════════════════════════════════════════
::  Media Gallery - Generate media.json
::  Double-click this file before pushing to GitHub
:: ════════════════════════════════════════════

echo.
echo  Scanning media folder...
echo.

:: Check if media folder exists
if not exist "media\" (
    echo  [ERROR] "media" folder not found!
    echo  Make sure this file is in the same folder as your media folder.
    echo.
    pause
    exit /b
)

:: Start JSON array
set "output=["

:: Flag to handle commas
set "first=1"

:: Loop through all supported image and video files
for %%F in (
    media\*.jpg media\*.jpeg media\*.png media\*.gif
    media\*.webp media\*.avif media\*.svg
    media\*.mp4 media\*.webm media\*.mov media\*.ogg
) do (
    if "!first!"=="1" (
        set "output=!output!"%%~nxF""
        set "first=0"
    ) else (
        set "output=!output!,"%%~nxF""
    )
)

:: Close JSON array
set "output=!output!]"

:: Write to media.json
echo !output! > media.json

:: Count files
set count=0
for %%F in (
    media\*.jpg media\*.jpeg media\*.png media\*.gif
    media\*.webp media\*.avif media\*.svg
    media\*.mp4 media\*.webm media\*.mov media\*.ogg
) do set /a count+=1

echo  Done! Found %count% media files.
echo  media.json has been updated.
echo.
echo  You can now push to GitHub!
echo.
pause
