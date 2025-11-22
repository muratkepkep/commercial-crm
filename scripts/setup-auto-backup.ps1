# PocketBase Otomatik Yedekleme - Windows Task Scheduler Kurulumu
# Bu script, Windows görev zamanlayıcısına otomatik yedekleme görevi ekler

# Yönetici kontrolü
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Bu scripti yönetici olarak çalıştırmalısınız!" -ForegroundColor Red
    Write-Host "   Sağ tıklayın → 'Yönetici olarak çalıştır' seçin" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "🔧 PocketBase Otomatik Yedekleme Kurulumu" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Parametreler
$taskName = "PocketBase CRM Otomatik Yedekleme"
$taskDescription = "PocketBase CRM verilerini her gün otomatik olarak yedekler"
$scriptPath = "C:\Users\Murat\.gemini\antigravity\scratch\commercial-crm\scripts\backup.ps1"
$triggerTime = "02:00"  # Her gün saat 02:00

# Script dosyasını kontrol et
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ HATA: Backup scripti bulunamadı!" -ForegroundColor Red
    Write-Host "   Beklenen konum: $scriptPath" -ForegroundColor Yellow
    pause
    exit 1
}

try {
    # Mevcut görevi kontrol et ve sil
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "ℹ️  Mevcut görev bulundu, güncelleniyor..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    # Trigger oluştur (her gün saat 02:00)
    $trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime

    # Action oluştur (PowerShell scripti çalıştır)
    $action = New-ScheduledTaskAction -Execute "powershell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""

    # Settings oluştur
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable:$false `
        -ExecutionTimeLimit (New-TimeSpan -Hours 1)

    # Principal oluştur (SYSTEM hesabı ile çalıştır)
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    # Görevi kaydet
    Register-ScheduledTask `
        -TaskName $taskName `
        -Description $taskDescription `
        -Trigger $trigger `
        -Action $action `
        -Settings $settings `
        -Principal $principal | Out-Null

    Write-Host "✅ Otomatik yedekleme görevi oluşturuldu!" -ForegroundColor Green
    Write-Host "`n📋 Görev Detayları:" -ForegroundColor Cyan
    Write-Host "   📝 Görev adı: $taskName" -ForegroundColor Gray
    Write-Host "   ⏰ Zamanlama: Her gün saat $triggerTime" -ForegroundColor Gray
    Write-Host "   📁 Script: $scriptPath" -ForegroundColor Gray
    Write-Host "   👤 Kullanıcı: SYSTEM (yönetici)" -ForegroundColor Gray

    # Test çalıştırması öner
    Write-Host "`n🧪 Test Çalıştırması:" -ForegroundColor Cyan
    $response = Read-Host "Şimdi test yedeklemesi yapmak ister misiniz? (E/H)"
    
    if ($response -eq 'E' -or $response -eq 'e') {
        Write-Host "`n⏳ Test yedeklemesi başlatılıyor..." -ForegroundColor Yellow
        Start-ScheduledTask -TaskName $taskName
        Start-Sleep -Seconds 2
        
        # Görev durumunu kontrol et
        $taskInfo = Get-ScheduledTaskInfo -TaskName $taskName
        Write-Host "✅ Test tamamlandı!" -ForegroundColor Green
        Write-Host "   Son çalışma: $($taskInfo.LastRunTime)" -ForegroundColor Gray
        Write-Host "   Sonuç: $($taskInfo.LastTaskResult)" -ForegroundColor Gray
        
        if ($taskInfo.LastTaskResult -eq 0) {
            Write-Host "`n✅ Yedekleme başarılı! Backup klasörünü kontrol edin:" -ForegroundColor Green
            Write-Host "   C:\CRMData\backups\" -ForegroundColor Cyan
        } else {
            Write-Host "`n⚠️  Yedekleme sırasında hata oluşmuş olabilir." -ForegroundColor Yellow
            Write-Host "   Log dosyasını kontrol edin: C:\CRMData\backups\backup.log" -ForegroundColor Gray
        }
    }

    Write-Host "`n📌 Görev Zamanlayıcısını Açma:" -ForegroundColor Cyan
    Write-Host "   1. Windows Arama → 'Görev Zamanlayıcısı' yazın" -ForegroundColor Gray
    Write-Host "   2. '$taskName' görevini bulun" -ForegroundColor Gray
    Write-Host "   3. Sağ tıklayıp 'Çalıştır' ile manuel test yapabilirsiniz" -ForegroundColor Gray

    Write-Host "`n✅ Kurulum tamamlandı!" -ForegroundColor Green

} catch {
    Write-Host "❌ HATA: Görev oluşturulamadı!" -ForegroundColor Red
    Write-Host "   Detay: $_" -ForegroundColor Yellow
    pause
    exit 1
}

pause
