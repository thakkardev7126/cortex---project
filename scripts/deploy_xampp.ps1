$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting DevSentinel XAMPP Deployment..." -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "📦 Building Frontend..." -ForegroundColor Yellow
Set-Location -Path "..\frontend"
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
} catch {
    Write-Error "Frontend build failed. Ensure npm install was run."
    exit 1
}

# 2. Deploy to XAMPP
$Dest = "C:\xampp\htdocs\DevSentinel"
Write-Host "📂 Deploying to $Dest..." -ForegroundColor Yellow

if (!(Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

Copy-Item -Path "dist\*" -Destination $Dest -Recurse -Force

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌍 Access at: http://localhost/DevSentinel/" -ForegroundColor Cyan
