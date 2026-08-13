$ports = @(3000, 8080)
$listener = New-Object System.Net.HttpListener

foreach ($port in $ports) {
    try {
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
    } catch {}
}

try {
    $listener.Start()
    Write-Host "Server running successfully with Video Streaming support!"
    Write-Host "  http://localhost:3000/"
    Write-Host "  http://127.0.0.1:3000/"
} catch {
    Write-Error "Failed to start listener: $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json"
    ".mp4"  = "video/mp4"
    ".mov"  = "video/quicktime"
    ".webm" = "video/webm"
}

$rootPath = Get-Location

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        $localPath = Join-Path $rootPath ($urlPath.TrimStart("/").Replace("/", "\"))

        if (Test-Path -Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $response.Headers.Add("Accept-Ranges", "bytes")
            $response.Headers.Add("Cache-Control", "public, max-age=3600")

            $fileInfo = New-Object System.IO.FileInfo($localPath)
            $totalLength = $fileInfo.Length

            $rangeHeader = $request.Headers["Range"]
            if ($rangeHeader -and ($ext -eq ".mp4" -or $ext -eq ".mov" -or $ext -eq ".webm")) {
                $range = $rangeHeader.Replace("bytes=", "").Split("-")
                $start = [int64]$range[0]
                $end = if ($range[1]) { [int64]$range[1] } else { $totalLength - 1 }
                if ($end -ge $totalLength) { $end = $totalLength - 1 }

                $length = $end - $start + 1
                $response.StatusCode = 206
                $response.Headers.Add("Content-Range", "bytes $start-$end/$totalLength")
                $response.ContentLength64 = $length

                $stream = [System.IO.File]::OpenRead($localPath)
                $stream.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null

                $buffer = New-Object byte[] 65536
                $bytesRemaining = $length
                while ($bytesRemaining -gt 0) {
                    $bytesToRead = [Math]::Min($buffer.Length, $bytesRemaining)
                    $bytesRead = $stream.Read($buffer, 0, $bytesToRead)
                    if ($bytesRead -le 0) { break }
                    $response.OutputStream.Write($buffer, 0, $bytesRead)
                    $bytesRemaining -= $bytesRead
                }
                $stream.Close()
            } else {
                $response.ContentLength64 = $totalLength
                $stream = [System.IO.File]::OpenRead($localPath)
                $stream.CopyTo($response.OutputStream)
                $stream.Close()
            }
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # client disconnected or write error
    }
}
