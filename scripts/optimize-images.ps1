Add-Type -AssemblyName System.Drawing

$photosDir = "C:\Users\User\.gemini\antigravity\scratch\birthday-surprise\app\public\photos"
$backupDir = "C:\Users\User\.gemini\antigravity\scratch\birthday-surprise\app\public\photos_backup"

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageDecoders() | Where-Object { $_.FormatDescription -eq 'JPEG' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)

$files = Get-ChildItem -Path "$photosDir\photo*.jpg"
Write-Host "Found $($files.Count) photos to optimize."

$totalBefore = 0
$totalAfter = 0

foreach ($file in $files) {
    $totalBefore += $file.Length
    $backupPath = Join-Path $backupDir $file.Name
    if (!(Test-Path $backupPath)) {
        Copy-Item $file.FullName $backupPath
    }

    $img = [System.Drawing.Image]::FromFile($backupPath)
    
    # Calculate target dimensions: maximum 960px on longest edge for crisp retina displays
    $maxDim = 960
    $w = $img.Width
    $h = $img.Height
    
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -gt $h) {
            $newW = $maxDim
            $newH = [int](($h * $maxDim) / $w)
        } else {
            $newH = $maxDim
            $newW = [int](($w * $maxDim) / $h)
        }
        $newBmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $g = [System.Drawing.Graphics]::FromImage($newBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.DrawImage($img, 0, 0, $newW, $newH)
        $g.Dispose()
        
        $tempOut = "$photosDir\temp_$($file.Name)"
        $newBmp.Save($tempOut, $codec, $encoderParams)
        $newBmp.Dispose()
    } else {
        $tempOut = "$photosDir\temp_$($file.Name)"
        $img.Save($tempOut, $codec, $encoderParams)
    }
    
    $img.Dispose()
    
    $targetFile = $file.FullName
    Move-Item -Path $tempOut -Destination $targetFile -Force
    $afterFile = Get-Item $targetFile
    $totalAfter += $afterFile.Length
    Write-Host "$($file.Name): $([math]::Round($file.Length/1024, 1)) KB -> $([math]::Round($afterFile.Length/1024, 1)) KB"
}

Write-Host "Total before: $([math]::Round($totalBefore/1024/1024, 2)) MB"
Write-Host "Total after: $([math]::Round($totalAfter/1024/1024, 2)) MB"

# Optimize calendar image as well
$calPath = "C:\Users\User\.gemini\antigravity\scratch\birthday-surprise\app\src\assets\november-2007-calendar.jpg"
if (Test-Path $calPath) {
    $img = [System.Drawing.Image]::FromFile($calPath)
    $maxDim = 720
    $w = $img.Width
    $h = $img.Height
    if ($w -gt $h) {
        $newW = $maxDim
        $newH = [int](($h * $maxDim) / $w)
    } else {
        $newH = $maxDim
        $newW = [int](($w * $maxDim) / $h)
    }
    $newBmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()
    $img.Dispose()

    $tmp = "C:\Users\User\.gemini\antigravity\scratch\birthday-surprise\app\src\assets\temp_cal.jpg"
    $newBmp.Save($tmp, $codec, $encoderParams)
    $newBmp.Dispose()

    Move-Item $tmp $calPath -Force
    Copy-Item $calPath "C:\Users\User\.gemini\antigravity\scratch\birthday-surprise\app\public\images\november-2007-calendar.jpg" -Force
    $calFile = Get-Item $calPath
    Write-Host "Calendar optimized: $([math]::Round($calFile.Length/1024, 1)) KB"
}
