# PocketBase Otomatik Yedekleme Scripti
# Bu script pb_data klasörünü yedekler ve eski yedekleri temizler

# Parametreler
$sourceFolder = "C:\CRMData\pb_data"
$backupRoot = "C:\CRMData\backups"
$daysToKeep = 30

# Klasörler mevcut değilse oluştur
if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
}

# Timestamp oluştur
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "backup_$timestamp"
$backupPath = Join-Path $backupRoot $backupName

try {
    Write-Host "🔄 Yedekleme başlatılıyor..." -ForegroundColor Cyan
    Write-Host "📁 Kaynak: $sourceFolder" -ForegroundColor Gray
    Write-Host "💾 Hedef: $backupPath" -ForegroundColor Gray

    # pb_data klasörünü kontrol et
    if (-not (Test-Path $sourceFolder)) {
        Write-Host "❌ HATA: pb_data klasörü bulunamadı!" -ForegroundColor Red
        Write-Host "   PocketBase'in çalıştığından emin olun." -ForegroundColor Yellow
        exit 1
    }

    # Yedekleme klasörünü oluştur
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

    # pb_data içeriğini kopyala
    Copy-Item -Path "$sourceFolder\*" -Destination $backupPath -Recurse -Force

    # Yedeklenen dosya sayısını hesapla
    $fileCount = (Get-ChildItem -Path $backupPath -Recurse -File).Count
    $folderSize = (Get-ChildItem -Path $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

    Write-Host "✅ Yedekleme tamamlandı!" -ForegroundColor Green
    Write-Host "   📊 $fileCount dosya yedeklendi" -ForegroundColor Gray
    Write-Host "   💾 Toplam boyut: $([math]::Round($folderSize, 2)) MB" -ForegroundColor Gray
    Write-Host "   📂 Konum: $backupPath" -ForegroundColor Gray

    # ZIP oluştur (isteğe bağlı)
    $zipPath = "$backupPath.zip"
    Compress-Archive -Path $backupPath -DestinationPath $zipPath -Force
    
    # Orijinal klasörü sil (ZIP var)
    Remove-Item -Path $backupPath -Recurse -Force
    
    Write-Host "📦 ZIP arşivi oluşturuldu: $zipPath" -ForegroundColor Green

    # Eski yedekleri temizle
    Write-Host "`n🗑️  Eski yedekler kontrol ediliyor..." -ForegroundColor Cyan
    $cutoffDate = (Get-Date).AddDays(-$daysToKeep)
    $oldBackups = Get-ChildItem -Path $backupRoot -Filter "backup_*.zip" | 
                  Where-Object { $_.LastWriteTime -lt $cutoffDate }

    if ($oldBackups.Count -gt 0) {
        $oldBackups | ForEach-Object {
            Write-Host "   ❌ Siliniyor: $($_.Name)" -ForegroundColor Gray
            Remove-Item -Path $_.FullName -Force
        }
        Write-Host "✅ $($oldBackups.Count) eski yedek silindi (>$daysToKeep gün)" -ForegroundColor Green
    } else {
        Write-Host "✅ Silinecek eski yedek yok" -ForegroundColor Green
    }

    # Yedekleme özeti
    $totalBackups = (Get-ChildItem -Path $backupRoot -Filter "backup_*.zip").Count
    Write-Host "`n📊 Yedekleme Özeti:" -ForegroundColor Cyan
    Write-Host "   📦 Toplam yedek: $totalBackups" -ForegroundColor Gray
    Write-Host "   📅 Son yedek: $timestamp" -ForegroundColor Gray

    # Log dosyasına kaydet
    $logPath = Join-Path $backupRoot "backup.log"
    Add-Content -Path $logPath -Value "[$timestamp] BAŞARILI - $fileCount dosya, $([math]::Round($folderSize, 2)) MB"

} catch {
    Write-Host "❌ HATA: Yedekleme başarısız!" -ForegroundColor Red
    Write-Host "   Detay: $_" -ForegroundColor Yellow
    
    # Log dosyasına hata kaydet
    $logPath = Join-Path $backupRoot "backup.log"
    Add-Content -Path $logPath -Value "[$timestamp] HATA - $_"
    
    exit 1
}

Write-Host "`n✅ İşlem tamamlandı!" -ForegroundColor Green
