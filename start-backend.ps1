# Start Backend Server Script
# Run this in PowerShell: powershell -File start-backend.ps1

Write-Host "🚀 Starting TBM-DeepIn Backend Server..."
Write-Host "Port: 5000"

# Check if backend is already running
$healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue

if ($healthResponse) {
    Write-Host "✅ Backend is already running on port 5000"
    Write-Host "Health: $($healthResponse | ConvertTo-Json)"
} else {
    Write-Host "📦 Starting backend server..."
    
    # Start backend
    $backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "backend" -PassThru
    
    # Wait for server to start
    Start-Sleep -Seconds 3
    
    # Verify backend started
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
    
    if ($healthResponse) {
        Write-Host "✅ Backend started successfully!"
        Write-Host "Health: $($healthResponse | ConvertTo-Json)"
        Write-Host "Process ID: $($backendProcess.Id)"
        
        # Save process info to file
        $backendProcess | ConvertTo-Json | Out-File -FilePath "backend-process.json"
        
        Write-Host "💡 Backend is ready at: http://localhost:5000"
    } else {
        Write-Host "❌ Failed to start backend. Check for errors above."
        # Try to kill the process if it started but failed
        if ($backendProcess) {
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "Backend setup complete!"
