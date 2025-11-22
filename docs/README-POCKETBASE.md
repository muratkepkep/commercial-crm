# 🚀 PocketBase Kurulum ve Kullanım Rehberi

Bu rehber, Commercial CRM projenizde PocketBase'i kurmak ve kullanmak için gereken tüm adımları içerir.

## 📋 İçindekiler

1. [PocketBase Nedir?](#pocketbase-nedir)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Yedekleme Sistemi](#yedekleme-sistemi)
4. [Sorun Giderme](#sorun-giderme)

---

## 🎯 PocketBase Nedir?

PocketBase, kendi bilgisayarınızda çalışan, tek dosyalı bir backend çözümüdür.

### Avantajlar

- ✅ **Tam Kontrol:** Tüm veriler bilgisayarınızda
- ✅ **İnternet Gerektirmez:** %100 offline çalışır
- ✅ **Kolay Yedekleme:** Klasör kopyala-yapıştır
- ✅ **Ücretsiz:** Hiçbir ücret yok
- ✅ **Görseller Dahil:** Dosya storage built-in

---

## ⚡ Hızlı Başlangıç

### Adım 1: PocketBase İndirin

1. https://pocketbase.io/docs/ adresine gidin
2. **Windows** için indirin: `pocketbase_windows_amd64.zip`
3. Veya direkt: https://github.com/pocketbase/pocketbase/releases/latest

### Adım 2: Klasör Yapısını Oluşturun

PowerShell'i açın ve çalıştırın:

\`\`\`powershell
# Ana klasörü oluştur
New-Item -ItemType Directory -Path "C:\\CRMData" -Force
New-Item -ItemType Directory -Path "C:\\CRMData\\backups" -Force
New-Item -ItemType Directory -Path "C:\\CRMData\\scripts" -Force
\`\`\`

### Adım 3: PocketBase'i Yerleştirin

1. İndirdiğiniz ZIP'i açın
2. `pocketbase.exe` dosyasını `C:\\CRMData\\` klasörüne kopyalayın

### Adım 4: İlk Kez Çalıştırın

1. `C:\\CRMData\\pocketbase.exe` dosyasına **çift tıklayın**
2. Terminal penceresi açılacak:
   \`\`\`
   Server started at http://127.0.0.1:8090
   \`\`\`

3. **Tarayıcıda açın:** http://127.0.0.1:8090/_/

4. **Admin hesabı oluşturun:**
   - Email: `admin@crm.local`
   - Password: `admin123`

### Adım 5: Database Schema Oluşturun

1. Admin panelde **Collections** sekmesine gidin
2. **Import collections** butonuna tıklayın
3. `pocketbase/pb_schema.json` dosyasını seçin
4. **Confirm import** tıklayın

✅ Tablolar oluşturuldu: `users`, `properties`, `clients`, `todos`

### Adım 6: İlk Kullanıcıyı Oluşturun

1. **Collections** → **users** → **+ New record**
2. Formu doldurun:
   \`\`\`
   username: admin
   email: admin@crm.local
   password: admin123
   full_name: Yönetici
   role: admin
   \`\`\`
3. **Create** tıklayın

### Adım 7: React Uygulamasını Başlatın

Yeni terminal açın (PocketBase'i kapatmayın!):

\`\`\`powershell
cd C:\\Users\\Murat\\.gemini\\antigravity\\scratch\\commercial-crm
npm run dev
\`\`\`

### Adım 8: Giriş Yapın

Tarayıcıda `http://localhost:5173` açılacak.

**Login:**
- Kullanıcı adı: `admin`
- Şifre: `admin123`

✅ **Hazır!** Artık PocketBase çalışıyor.

---

## 💾 Yedekleme Sistemi

### Manuel Yedekleme

\`\`\`powershell
cd C:\\Users\\Murat\\.gemini\\antigravity\\scratch\\commercial-crm
.\\scripts\\backup.ps1
\`\`\`

Yedekler: `C:\\CRMData\\backups\\` klasöründe

### Otomatik Günlük Yedekleme Kurulumu

1. **PowerShell'i yönetici olarak açın**
2. Çalıştırın:
   \`\`\`powershell
   cd C:\\Users\\Murat\\.gemini\\antigravity\\scratch\\commercial-crm
   .\\scripts\\setup-auto-backup.ps1
   \`\`\`

✅ Her gece saat 02:00'de otomatik yedekleme yapılacak!

### Yedekten Geri Yükleme

\`\`\`powershell
cd C:\\Users\\Murat\\.gemini\\antigravity\\scratch\\commercial-crm
.\\scripts\\restore.ps1
\`\`\`

Liste gelecek, seçim yapın ve geri yükleyin.

---

## 🗂️ Veri Konumu

Tüm verileriniz burada:

\`\`\`
C:\\CRMData\\
├── pocketbase.exe          # Uygulama
├── pb_data\\               # 🔒 TÜM VERİLERİNİZ
│   ├── data.db            # Database
│   └── storage\\          # Görseller
├── backups\\              # Otomatik yedekler
└── scripts\\              # Yedekleme scriptleri (opsiyonel)
\`\`\`

### Veriyi Taşıma

1. PocketBase'i durdurun
2. `pb_data` klasörünü USB/harddisk'e kopyalayın
3. Yeni PC'de yapıştırın
4. PocketBase'i başlatın

✅ Tüm verileriniz taşındı!

---

## 🔧 Günlük Kullanım

### PocketBase'i Başlatma

1. `C:\\CRMData\\pocketbase.exe` çift tıklayın
2. Terminal açık kalsın

### PocketBase'i Durdurma

- Terminal penceresini kapatın
- Veya `Ctrl+C` tuşlarına basın

### Otomatik Başlatma (Opsiyonel)

Windows başlangıcında otomatik:

1. `pocketbase.exe` kısayol oluşturun
2. Kısayolu `shell:startup` klasörüne kopyalayın

---

## 🆘 Sorun Giderme

### Port 8090 kullanımda

\`\`\`powershell
cd C:\\CRMData
.\\pocketbase.exe serve --http="127.0.0.1:8091"
\`\`\`

`.env` dosyasını güncelleyin:
\`\`\`
VITE_POCKETBASE_URL=http://127.0.0.1:8091
\`\`\`

### "Connection refused" hatası

→ PocketBase çalışmıyor. `pocketbase.exe`'yi tekrar başlatın.

### Admin şifremi unuttum

\`\`\`powershell
cd C:\\CRMData
.\\pocketbase.exe admin create yeni@admin.com admin123
\`\`\`

### Database'i sıfırla

\`\`\`powershell
# PocketBase'i durdur
# pb_data klasörünü sil:
Remove-Item -Path "C:\\CRMData\\pb_data" -Recurse -Force
# PocketBase'i başlat, sıfırdan başlar
\`\`\`

---

## 📚 Daha Fazla Bilgi

- **Kurulum Detayları:** [POCKETBASE-ILK-KURULUM.md](./POCKETBASE-ILK-KURULUM.md)
- **PocketBase Dokümantasyon:** https://pocketbase.io/docs/
- **Backup Script Detayları:** `scripts/` klasörü

---

## ✅ Kontrol Listesi

Kurulum tamamlandığında bu liste dolu olmalı:

- [ ] PocketBase indirildi ve `C:\\CRMData\\` içinde
- [ ] İlk kez çalıştırıldı ve admin hesabı oluşturuldu
- [ ] Collections import edildi (4 tablo)
- [ ] İlk kullanıcı oluşturuldu (`admin`)
- [ ] React uygulaması çalışıyor (`npm run dev`)
- [ ] Login başarılı
- [ ] Otomatik yedekleme kuruldu (opsiyonel)

---

**🎉 Tebrikler! PocketBase hazır. Artık güvenle çalışabilirsiniz.**

Verileriniz tamamen kontrolünüzde ve her zaman yedekte! 🔒
