Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(100,100)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::SteelBlue)
$g.FillRectangle([System.Drawing.Brushes]::White, 20, 20, 60, 60)
$g.Dispose()
$bmp.Save("g:\learning projects\Project@Backend\test_image.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
Write-Host "Test image created"
