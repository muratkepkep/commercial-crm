# 🚀 PocketBase Collections Otomatik Kurulum

Bu script tüm collection'ları (properties, clients, todos) otomatik oluşturur.

## ⚡ Hızlı Kullanım

### 1. PocketBase'in Çalıştığından Emin Olun

Bir PowerShell penceresinde PocketBase çalışıyor olmalı:
```powershell
cd C:\CRMData
.\pocketbase.exe serve
```

### 2. Script'i Çalıştırın

**YENİ** bir PowerShell penceresi açın:

```powershell
cd C:\Users\Murat\.gemini\antigravity\scratch\commercial-crm
node scripts/setup-collections.js
```

### 3. Sonuç

Script şunları oluşturacak:
- ✅ **properties** collection (ada, parsel, görseller)
- ✅ **clients** collection
- ✅ **todos** collection

## ❓ Sorun Giderme

### "Admin authentication failed"

→ Admin hesabınızı henüz oluşturmadınız. Önce şunu yapın:

1. http://127.0.0.1:8090/_/ adresini açın
2. Admin hesabı oluşturun:
   - Email: `admin@crm.local`
   - Password: `admin123`

Sonra scripti tekrar çalıştırın.

### "Cannot find module 'pocketbase'"

→ Node modülleri eksik. Çalıştırın:

```powershell
cd C:\Users\Murat\.gemini\antigravity\scratch\commercial-crm
npm install
```

### "Connection refused"

→ PocketBase çalışmıyor. Başlatın:

```powershell
cd C:\CRMData
.\pocketbase.exe serve
```

## ✅ Başarılı Olunca

Collections oluşturulduktan sonra:

1. Admin panelde **Collections** sekmesine gidin
2. `properties`, `clients`, `todos` görünecek
3. Şimdi ilk kullanıcıyı oluşturun:
   - Collections → **users** → **+ New record**
   - username: `admin`
   - password: `admin123`
   - role: `admin`

4. React uygulamasını başlatın ve test edin! 🎉
