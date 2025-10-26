$base = 'http://localhost:3000'
Write-Output '=== Server check ==='
try {
    Invoke-WebRequest -Uri $base -UseBasicParsing -Method Get -TimeoutSec 5 | Out-Null
    Write-Output 'Server: UP'
} catch {
    Write-Output ('Server: DOWN - ' + $_.Exception.Message)
}

Write-Output ""
Write-Output '=== Audio files in public/audio ==='
try {
    Get-ChildItem 'C:\Users\Yanni\Sumaku Podcast\public\audio\*.mp3' | ForEach-Object {
        Write-Output ($_.Name + ' | ' + $_.Length + ' bytes | LastWrite: ' + $_.LastWriteTime)
    }
} catch {
    Write-Output ('Could not list audio files: ' + $_.Exception.Message)
}

Write-Output ""
Write-Output '=== Calling /api/mixAudio ==='
try {
    $mix = Invoke-RestMethod -Uri ($base + '/api/mixAudio') -Method Post -TimeoutSec 120
    Write-Output 'mixAudio response:'
    $mix | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output ('mixAudio error: ' + $_.Exception.Message)
}
