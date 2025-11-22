# 📝 PocketBase İlk Kurulum Adımları

Bu rehber, PocketBase'i ilk kez kurduğunuzda takip etmeniz gereken adımları içerir.

## ✅ Ön Hazırlık Kontrol Listesi

- [ ] PocketBase indirildi
- [ ] `C:\CRMData` klasörü oluşturuldu
- [ ] `pocketbase.exe` dosyası `C:\CRMData` içine kopyalandı
- [ ] React projesinde `npm install pocketbase` çalıştırıldı

## 🚀 1. Adım: PocketBase'i Başlat

1. Dosya Gezgini'nde `C:\CRMData` klasörünü açın
2. `pocketbase.exe` dosyasına **çift tıklayın**
3. Bir terminal penceresi açılacak

**Beklenen Çıktı:**
```
Server started at http://127.0.0.1:8090
├─ REST API: http://127.0.0.1:8090/api/
└─ Admin UI: http://127.0.0.1:8090/_/
```

> ⚠️ **Terminal penceresini kapatmayın!** PocketBase çalışıyor olmalı.

## 🔐 2. Adım: İlk Admin Kullanıcısını Oluştur

1. Tarayıcınızda şu adresi açın: **http://127.0.0.1:8090/_/**

2. İlk kez açtığınızda "Create new admin account" ekranı gelecek

3. Formu doldurun:
   ```
   Email: admin@crm.local
   Password: admin123
   Password confirm: admin123
   ```

4. **"Create admin account"** butonuna tıklayın

✅ Admin paneline giriş yaptınız!

## 📊 3. Adım: Collections (Tablolar) Oluştur

### Otomatik İmport (Önerilen)

1. Admin panelde sol menüden **"Collections"** sekmesine gidin

2. Sağ üstteki **"Import collections"** butonuna tıklayın

3. `pocketbase/pb_schema.json` dosyasını seçin (projenizde zaten hazır)

4. **"Confirm import"** butonuna tıklayın

5. Şu tablolar oluşacak:
   - ✅ `users` (Kullanıcılar)
   - ✅ `properties` (Mülkler - ada, parsel, görseller)
   - ✅ `clients` (Müşteriler)
   - ✅ `todos` (Yapılacaklar)

### Manuel Oluşturma (Alternatif)

Eğer import çalışmazsa:

1. **"Collections"** → **"+ New collection"**
2. **"New base collection"** seçin
3. Her tablo için manuel alan ekleyin (detaylar `pocketbase/pb_schema.json` içinde)

## 👤 4. Adım: İlk CRM Kullanıcısını Oluştur

1. Admin panelde **"Collections"** → **"users"**

2. **"+ New record"** butonuna tıklayın

3. Formu doldurun:
   ```
   username: admin
   email: admin@crm.local
   password: admin123
   full_name: Yönetici
   role: admin
   ```

4. **"Create"** butonuna tıklayın

✅ Şimdi CRM uygulamasında bu kullanıcı ile giriş yapabilirsiniz!

## 🧪 5. Adım: Bağlantıyı Test Et

PowerShell'de test edin:

```powershell
# PocketBase API'nin çalıştığını kontrol et
Invoke-RestMethod -Uri "http://127.0.0.1:8090/api/health"
```

**Beklenen yanıt:**
```json
{
  "code": 200,
  "message": "API is healthy"
}
```

## ▶️ 6. Adım: React Uygulamasını Başlat

1. Yeni bir terminal açın (PocketBase terminalini kapatmayın!)

2. Proje klasörüne gidin:
   ```powershell
   cd C:\Users\Murat\.gemini\antigravity\scratch\commercial-crm
   ```

3. React uygulamasını başlatın:
   ```powershell
   npm run dev
   ```

4. Tarayıcınızda otomatik olarak açılacak: `http://localhost:5173`

## 🔑 7. Adım: CRM'e Giriş Yapın

Login ekranında:
```
Kullanıcı adı: admin
Şifre: admin123
```

✅ **Tebrikler!** PocketBase kurulumu tamamlandı ve CRM hazır!

---

## 🆘 Sorun Giderme

### "Connection refused" hatası
→ PocketBase çalışmıyor olabilir. `pocketbase.exe`'yi tekrar başlatın.

### Admin paneline giremiyorum
→ Tarayıcıda `http://127.0.0.1:8090/_/` adresini kontrol edin.

### Port 8090 kullanımda
```powershell
# Farklı port kullanın:
cd C:\CRMData
.\pocketbase.exe serve --http="127.0.0.1:8091"

# .env dosyasını güncelleyin:
VITE_POCKETBASE_URL=http://127.0.0.1:8091
```

### Collections import çalışmıyor
→ Manuel oluşturma yöntemini kullanın veya schema dosyasını kontrol edin.

---

## ⏭️ Sonraki Adımlar

1. ✅ PocketBase çalışıyor
2. ✅ Admin kullanıcısı oluşturuldu
3. ✅ Collections hazır
4. ⏭️ Mevcut localStorage verilerinizi PocketBase'e taşıyın
5. ⏭️ Otomatik yedekleme sistemini kurun
