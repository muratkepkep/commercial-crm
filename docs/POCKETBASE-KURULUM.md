# 🚀 PocketBase Kurulum Rehberi

## Adım 1: PocketBase İndir

1. **İndirme Linki:** https://pocketbase.io/docs/
2. **Windows için:** `pocketbase_0.22.x_windows_amd64.zip` dosyasını indirin
3. **Direkt Link:** https://github.com/pocketbase/pocketbase/releases/latest

## Adım 2: Klasör Yapısı Oluştur

```powershell
# PowerShell'i Yönetici olarak açın ve şu komutları çalıştırın:
New-Item -ItemType Directory -Path "C:\CRMData" -Force
New-Item -ItemType Directory -Path "C:\CRMData\backups" -Force
New-Item -ItemType Directory -Path "C:\CRMData\scripts" -Force
```

Bu komutlar şu klasörleri oluşturur:
```
C:\CRMData\
├── backups\      (Otomatik yedekler burada)
└── scripts\      (Yedekleme scriptleri)
```

## Adım 3: PocketBase'i Yerleştir

1. İndirdiğiniz **ZIP dosyasını açın**
2. İçindeki `pocketbase.exe` dosyasını `C:\CRMData\` klasörüne kopyalayın

Sonuç:
```
C:\CRMData\
├── pocketbase.exe    ✅ (buraya kopyaladınız)
├── backups\
└── scripts\
```

## Adım 4: İlk Çalıştırma

1. **Dosya Gezgini**'nde `C:\CRMData` klasörünü açın
2. **pocketbase.exe** dosyasına **çift tıklayın**
3. Bir terminal penceresi açılacak ve şunu göreceksiniz:

```
Server started at http://127.0.0.1:8090
├─ REST API: http://127.0.0.1:8090/api/
└─ Admin UI: http://127.0.0.1:8090/_/
```

> ✅ **Tebrikler!** PocketBase çalışıyor!

## Adım 5: Admin Paneline Giriş

1. Tarayıcınızda şu adresi açın: **http://127.0.0.1:8090/_/**
2. İlk giriş ekranında **admin hesabı oluşturun**:
   - **Email:** `admin@crm.local`
   - **Password:** `admin123`
   - **Password Confirm:** `admin123`
3. "Create admin account" butonuna tıklayın

> 🔒 **Önemli:** Bu bilgileri unutmayın!

## Adım 6: Collections (Tablolar) Oluşturma

### Otomatik Kurulum (Önerilen)

Collections'ları otomatik oluşturmak için:

1. PocketBase admin panelde **Settings** → **Import collections** sekmesine gidin
2. Aşağıdaki dosyayı kullanın: `pocketbase/pb_schema.json`
3. "Import" butonuna tıklayın

### Manuel Kurulum

Eğer otomatik çalışmazsa, her collection'ı manuel oluşturabilirsiniz. Detaylar için `pocketbase/SCHEMA.md` dosyasına bakın.

## Adım 7: Doğrulama

PocketBase'in çalıştığını doğrulayalım:

```powershell
# PowerShell'de test edin:
Invoke-RestMethod -Uri "http://127.0.0.1:8090/api/health"
```

> ✅ **Başarılı:** `{"code": 200, "message": "OK"}` yanıtı almalısınız

## Adım 8: React Uygulamasını Bağlayın

PocketBase hazır! Şimdi React uygulamanızı bağlayalım:

```powershell
# Proje klasörüne gidin
cd C:\Users\Murat\.gemini\antigravity\scratch\commercial-crm

# PocketBase SDK'yı yükleyin
npm install pocketbase

# Supabase'i kaldırın (artık gerekmeyecek)
npm uninstall @supabase/supabase-js
```

## Adım 9: .env Dosyasını Güncelleyin

`.env` dosyasını açın ve şunu ekleyin:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## Kullanım

### PocketBase'i Başlatma
1. `C:\CRMData\pocketbase.exe` dosyasına çift tıklayın
2. Terminal penceresi açık kalsın (kapattığınızda PocketBase durur)

### PocketBase'i Durdurma
- Terminal penceresini kapatın veya `Ctrl+C` tuşlarına basın

### Otomatik Başlatma (İsteğe Bağlı)
Windows başlangıcında otomatik çalışması için:
1. `pocketbase.exe` için kısayol oluşturun
2. Kısayolu `shell:startup` klasörüne kopyalayın

## Sorun Giderme

### Port Zaten Kullanılıyor
Eğer `8090` portu kullanımdaysa:
```powershell
# Farklı port kullanın:
.\pocketbase.exe serve --http="127.0.0.1:8091"

# .env dosyasını güncelleyin:
VITE_POCKETBASE_URL=http://127.0.0.1:8091
```

### Admin Şifremi Unuttum
```powershell
# PocketBase'i durdurun (Ctrl+C)
# Yeni admin oluşturun:
.\pocketbase.exe admin create admin@crm.local admin123
```

### Veritabanını Sıfırla
```powershell
# PocketBase'i durdurun
# pb_data klasörünü silin:
Remove-Item -Path "C:\CRMData\pb_data" -Recurse -Force
# PocketBase'i tekrar başlatın, sıfırdan başlar
```

## Veri Konumu

Tüm verileriniz burada:
```
C:\CRMData\pb_data\
├── data.db           # SQLite veritabanı (TÜM veriler)
├── logs.db           # Log kayıtları
└── storage\          # Görseller ve dosyalar
    └── [collection]\
        └── [record_id]\
            └── [filename]
```

> ✅ **Yedekleme:** `pb_data` klasörünü kopyalayarak tüm verilerinizi yedekleyebilirsiniz!

## Sonraki Adımlar

1. ✅ PocketBase kuruldu ve çalışıyor
2. ⏭️ React kodlarını PocketBase'e bağlayacağız
3. ⏭️ Otomatik yedekleme sistemi kuracağız
4. ⏭️ Mevcut localStorage verilerini taşıyacağız
