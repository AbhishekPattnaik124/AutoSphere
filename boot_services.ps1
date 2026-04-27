# best-cars-boot.ps1
# AutoSphere Elite Clean-Bootstrapper [DEBUG MODE]

Write-Host "[RESET] Cleaning up existing microservice processes..." -ForegroundColor Cyan

# Load Environment Variables from server/djangoapp/.env
if (Test-Path "server/djangoapp/.env") {
    Write-Host "[CONFIG] Loading environment variables..." -ForegroundColor Gray
    Get-Content "server/djangoapp/.env" | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
    }
}

function Stop-PortProcess($port) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($proc) {
        $procId = $proc.OwningProcess[0]
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Write-Host "  - Terminated process on port $port" -ForegroundColor Gray
    }
}

Stop-PortProcess 3030
Stop-PortProcess 3050
Stop-PortProcess 5050

Write-Host "[INIT] Launching Cluster with Live Logging..." -ForegroundColor Cyan

# 1. Dealer API
Write-Host "[1/3] Starting Dealer API..." -ForegroundColor Yellow
Start-Process node -ArgumentList "server/database/app.js" -RedirectStandardOutput "server/logs/dealer.log" -RedirectStandardError "server/logs/dealer_err.log" -NoNewWindow -PassThru

# 2. Inventory API
Write-Host "[2/3] Starting Inventory API..." -ForegroundColor Yellow
Start-Process node -ArgumentList "server/carsInventory/app.js" -RedirectStandardOutput "server/logs/inventory.log" -RedirectStandardError "server/logs/inventory_err.log" -NoNewWindow -PassThru

# 3. Sentiment NLP
Write-Host "[3/3] Starting Sentiment NLP..." -ForegroundColor Yellow
Start-Process python -ArgumentList "server/djangoapp/microservices/app.py" -RedirectStandardOutput "server/logs/sentiment.log" -RedirectStandardError "server/logs/sentiment_err.log" -NoNewWindow -PassThru

Write-Host "[SUCCESS] AutoSphere cluster is synchronized. Logs are available in server/logs/." -ForegroundColor Green
