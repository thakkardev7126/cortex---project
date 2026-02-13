# Cortex One-Click Start Script
Write-Host "--- Cortex Security Platform ---" -ForegroundColor Cyan

# Check if node_modules exists in root
if (!(Test-Path "node_modules")) {
    Write-Host "[WAIT] Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if concurrently is installed
if (!(Test-Path "node_modules\concurrently")) {
    Write-Host "[WAIT] Installing concurrently..." -ForegroundColor Yellow
    npm install concurrently --save-dev
}

# Cleanup orphaned processes on common ports to prevent EADDRINUSE / EPERM
Write-Host "[CLEAN] Checking for orphaned processes on ports 5001, 5173..." -ForegroundColor Gray
$ports = 5001, 5173
foreach ($port in $ports) {
    try {
        $procId = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
        if ($procId) {
            Write-Host "[KILL] Found process $procId on port $port. Terminating..." -ForegroundColor Gray
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
    catch {
        # Port might be in use by a system process we can't touch, common in some environments
    }
}

Write-Host "[START] Launching Backend, Frontend, and Simulator..." -ForegroundColor Green
Write-Host "Tip: Press Ctrl+C to stop all services." -ForegroundColor Gray

npm run dev
