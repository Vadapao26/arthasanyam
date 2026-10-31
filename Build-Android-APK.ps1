$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "============================================================"
Write-Host "  Arthasanyam - 100% Offline Android Build Script"
Write-Host "============================================================"

Write-Host "[1/3] Compiling web bundle..."
npm run build

Write-Host "[2/3] Syncing to Android platform..."
npx cap sync android

Write-Host "[3/3] Checking Android Project and Manifest..."
$manifestPath = Join-Path $PSScriptRoot "android\app\src\main\AndroidManifest.xml"
$manifestContent = Get-Content $manifestPath -Raw

if ($manifestContent.Contains('android.permission.INTERNET') -and $manifestContent.Contains('tools:node="remove"')) {
    Write-Host "SUCCESS: INTERNET permission removed in AndroidManifest.xml"
}

Write-Host "Android native project is synchronized at .\android"
Write-Host "To open in Android Studio: npm run android:open"
