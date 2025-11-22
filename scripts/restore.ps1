# PocketBase Yedekten Geri Yükleme Scripti
# Belirli bir yedek dosyasından verileri geri yükler

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

$backupRoot = "C:\CRMData\backups"
$targetFolder = "C:\CRMData\pb_data"
$tempFolder = "C:\CRMData\temp_restore"

Write-Host "🔄 PocketBase Geri Yükleme" -ForegroundColor Cyan
Write-Host "===========================`n" -ForegroundColor Cyan

# Mevcut yedekleri listele
if (-not $BackupFile) {
    Write-Host "📦 Mevcut Yedekler:" -ForegroundColor Cyan
    $backups = Get-ChildItem -Path $backupRoot -Filter "backup_*.zip" | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "❌ Hiç yedek dosyası bulunamadı!" -ForegroundColor Red
        exit 1
    }

    $index = 1
    $backups | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   [$index] $($_.Name) - $size MB - $($_.LastWriteTime)" -ForegroundColor Gray
        $index++
    }

    Write-Host "`n"
    $selection = Read-Host "Hangi yedeği geri yüklemek istersiniz? (1-$($backups.Count))"
    
    try {
        $selectedIndex = [int]$selection - 1
        $BackupFile = $backups[$selectedIndex].FullName
    } catch {
        Write-Host "❌ Geçersiz seçim!" -ForegroundColor Red
        exit 1
    }
}

# Yedek dosyasını kontrol et
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Yedek dosyası bulunamadı: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Seçilen yedek: $BackupFile" -ForegroundColor Cyan

# Onay al
Write-Host "`n⚠️  UYARI: Bu işlem mevcut verilerin üzerine yazacak!" -ForegroundColor Yellow
$confirm = Read-Host "Devam etmek istediğinize emin misiniz? (EVET yazın)"

if ($confirm -ne "EVET") {
    Write-Host "❌ İşlem iptal edildi." -ForegroundColor Yellow
    exit 0
}

try {
    # PocketBase'in kapalı olduğundan emin ol
    $pbProcess = Get-Process -Name "pocketbase" -ErrorAction SilentlyContinue
    if ($pbProcess) {
        Write-Host "⚠️  PocketBase çalışıyor, kapatılıyor..." -ForegroundColor Yellow
        Stop-Process -Name "pocketbase" -Force
        Start-Sleep -Seconds 2
    }

    # Mevcut pb_data'yı yedekle (güvenlik için)
    if (Test-Path $targetFolder) {
        $safetyBackup = "C:\CRMData\backups\safety_backup_before_restore_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').zip"
        Write-Host "🛡️  Güvenlik yedeği alınıyor..." -ForegroundColor Cyan
        Compress-Archive -Path $targetFolder -DestinationPath $safetyBackup -Force
        Write-Host "✅ Güvenlik yedeği: $safetyBackup" -ForegroundColor Green
    }

    # Temp klasörü temizle
    if (Test-Path $tempFolder) {
        Remove-Item -Path $tempFolder -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null

    # ZIP'i aç
    Write-Host "📦 Yedek açılıyor..." -ForegroundColor Cyan
    Expand-Archive -Path $BackupFile -DestinationPath $tempFolder -Force

    # pb_data klasörünü bul (ZIP içinde doğrudan dosyalar varsa veya klasör varsa)
    $extractedContent = Get-ChildItem -Path $tempFolder
    if ($extractedContent.Count -eq 1 -and $extractedContent[0].PSIsContainer) {
        $sourceData = $extractedContent[0].FullName
    } else {
        $sourceData = $tempFolder
    }

    # Eski pb_data'yı sil
    if (Test-Path $targetFolder) {
        Write-Host "🗑️  Eski veriler siliniyor..." -ForegroundColor Cyan
        Remove-Item -Path $targetFolder -Recurse -Force
    }

    # Yeni verileri kopyala
    Write-Host "📥 Yeni veriler kopyalanıyor..." -ForegroundColor Cyan
    Copy-Item -Path $sourceData -Destination $targetFolder -Recurse -Force

    # Temp klasörünü temizle
    Remove-Item -Path $tempFolder -Recurse -Force

    Write-Host "`n✅ Geri yükleme tamamlandı!" -ForegroundColor Green
    Write-Host "📁 Veriler şu konuma geri yüklendi: $targetFolder" -ForegroundColor Gray
    Write-Host "`n🚀 PocketBase'i tekrar başlatabilirsiniz:" -ForegroundColor Cyan
    Write-Host "   C:\CRMData\pocketbase.exe" -ForegroundColor Gray

} catch {
    Write-Host "`n❌ HATA: Geri yükleme başarısız!" -ForegroundColor Red
    Write-Host "   Detay: $_" -ForegroundColor Yellow
    
    if (Test-Path $safetyBackup) {
        Write-Host "`n🛡️  Güvenlik yedeğinden geri yükleyebilirsiniz:" -ForegroundColor Yellow
        Write-Host "   $safetyBackup" -ForegroundColor Cyan
    }
    
    exit 1
}
