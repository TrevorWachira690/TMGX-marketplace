# Start Backend Server
# Run this script from the backend directory

# Log the start
Write-Host "🚀 Starting TBM-DeepIn Backend Server..."
Write-Host "Port: 5000"

# Wait for MongoDB to be ready (might take a few seconds)
$maxRetries = 10
$retryCount = 0
$connected = $false

Write-Host "⏳ Waiting for MongoDB connection..."

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
        if ($response) {
            $connected = $true
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "Attempt $retryCount/$maxRetries... waiting 2 seconds"
            Start-Sleep -Seconds 2
        }
    }
}

if ($connected) {
    Write-Host "✅ Backend is already running on port 5000"
    Write-Host "Health: $($response | ConvertTo-Json)"
} else {
    Write-Host "📦 Starting backend server..."
    
    # Start the backend process
    $process = Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow -PassThru
    
    # Wait a bit more for server to initialize
    Start-Sleep -Seconds 3
    
    # Check if server is running
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
        Write-Host "✅ Backend started successfully!"
        Write-Host "Health: $($response | ConvertTo-Json)"
        Write-Host "Process ID: $($process.Id)"
        
        # Save process info
        $process | ConvertTo-Json | Out-File -FilePath "backend-process.json"
        
        Write-Host "💡 Backend is ready at: http://localhost:5000"
        Write-Host "🔍 Health check: http://localhost:5000/api/health"
    }
    catch {
        Write-Host "❌ Failed to start backend. Error: $($_.Exception.Message)"
        # Try to stop the process if it started but failed
        if ($process) {
            try {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Write-Host "🛑 Stopped failed backend process"
            } catch {
                Write-Host "⚠️  Could not stop process automatically"
            }
        }
    }
}

Write-Host ""
Write-Host "Backend setup complete!"
