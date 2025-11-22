# 📦 PocketBase İndirme Scripti
# PocketBase'in son sürümünü otomatik olarak indirir

param(
    [string]$InstallPath = "C:\CRMData"
)

Write-Host "📥 PocketBase İndirme Aracı" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Hedef klasörü oluştur
if (-not (Test-Path $InstallPath)) {
    Write-Host "📁 Klasör oluşturuluyor: $InstallPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

try {
    # GitHub API'den son sürümü al
    Write-Host "🔍 Son sürüm kontrol ediliyor..." -ForegroundColor Cyan
    $apiUrl = "https://api.github.com/repos/pocketbase/pocketbase/releases/latest"
    $release = Invoke-RestMethod -Uri $apiUrl
    
    $version = $release.tag_name
    Write-Host "✅ Son sürüm: $version" -ForegroundColor Green

    # Windows AMD64 sürümünü bul
    $asset = $release.assets | Where-Object { $_.name -like "*windows_amd64.zip" } | Select-Object -First 1
    
    if (-not $asset) {
        Write-Host "❌ Windows sürümü bulunamadı!" -ForegroundColor Red
        exit 1
    }

    $downloadUrl = $asset.browser_download_url
    $zipPath = Join-Path $env:TEMP "pocketbase_windows.zip"

    Write-Host "📥 İndiriliyor: $($asset.name)" -ForegroundColor Cyan
    Write-Host "   URL: $downloadUrl" -ForegroundColor Gray
    Write-Host "   Boyut: $([math]::Round($asset.size / 1MB, 2)) MB" -ForegroundColor Gray

    # İndir
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing

    Write-Host "✅ İndirme tamamlandı!" -ForegroundColor Green

    # ZIP'i aç
    Write-Host "📦 Çıkartılıyor..." -ForegroundColor Cyan
    $tempExtract = Join-Path $env:TEMP "pocketbase_extract"
    if (Test-Path $tempExtract) {
        Remove-Item -Path $tempExtract -Recurse -Force
    }
    Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force

    # pocketbase.exe'yi hedef klasöre kopyala
    $exePath = Join-Path $tempExtract "pocketbase.exe"
    $targetPath = Join-Path $InstallPath "pocketbase.exe"
    
    Copy-Item -Path $exePath -Destination $targetPath -Force

    # Temizlik
    Remove-Item -Path $zipPath -Force
    Remove-Item -Path $tempExtract -Recurse -Force

    Write-Host "`n✅ PocketBase kuruldu!" -ForegroundColor Green
    Write-Host "📂 Konum: $targetPath" -ForegroundColor Gray
    Write-Host "🔢 Sürüm: $version" -ForegroundColor Gray

    Write-Host "`n🚀 Başlatmak için:" -ForegroundColor Cyan
    Write-Host "   1. Çift tıklayın: $targetPath" -ForegroundColor Gray
    Write-Host "   2. Veya PowerShell'de: cd $InstallPath; .\pocketbase.exe serve" -ForegroundColor Gray

    # Gerekli alt klasörleri oluştur
    Write-Host "`n📁 Klasör yapısı hazırlanıyor..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path (Join-Path $InstallPath "backups") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $InstallPath "scripts") -Force | Out-Null
    
    Write-Host "✅ Kurulum tamamlandı!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ HATA: İndirme başarısız!" -ForegroundColor Red
    Write-Host "   Detay: $_" -ForegroundColor Yellow
    Write-Host "`n💡 Manuel indirme:" -ForegroundColor Cyan
    Write-Host "   https://pocketbase.io/docs/" -ForegroundColor Gray
    exit 1
}
