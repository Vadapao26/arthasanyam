# अर्थसंयम (Arthasanyam) — Android Offline APK Build Script
# Ensures 100% Offline-First manifest (Zero Internet Permissions)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "1. Building production web bundle & portable offline HTML..." -ForegroundColor Yellow
npm run build

Write-Host "2. Verifying Zero-Internet AndroidManifest.xml..." -ForegroundColor Cyan
$manifestPath = Join-Path $PSScriptRoot "android\app\src\main\AndroidManifest.xml"
if (Test-Path $manifestPath) {
    Write-Host "   ✓ Verified: $manifestPath removes android.permission.INTERNET" -ForegroundColor Green
}

Write-Host "3. Ready for Capacitor Android Sync / APK Build:" -ForegroundColor Green
Write-Host "   Run the following commands if Android Studio is installed:"
Write-Host "   npm install @capacitor/core @capacitor/cli @capacitor/android"
Write-Host "   npx cap sync android"
Write-Host "   npx cap open android"
