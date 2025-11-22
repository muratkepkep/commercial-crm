# 🚀 Supabase Kurulum Rehberi

## Tek Adımda Kurulum

### 1️⃣ Supabase Dashboard'a Girin

1. https://supabase.com adresine gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü tıklayın

### 2️⃣ SQL Dosyasını Çalıştırın

1. **"New Query"** butonuna tıklayın
2. `complete-setup.sql` dosyasını açın
3. **Tüm içeriği kopyalayın**
4. SQL Editor'e yapıştırın
5. Sağ alttaki **"RUN"** butonuna basın

⏱️ İşlem 5-10 saniye sürer.

### 3️⃣ Kontrol Edin

SQL çalıştıktan sonra:

✅ Sol menüden **"Table Editor"** açın  
✅ Şu tabloları görmelisiniz:
- `properties` (Mülkler)
- `clients` (Müşteriler)
- `todos` (Yapılacaklar)
- `profiles` (Kullanıcılar)

✅ Sol menüden **"Storage"** açın  
✅ `property-images` bucket'ını görmelisiniz

---

## ⚠️ Sorun Giderme

### Hata: "policy already exists"

**Çözüm**: Eski policy'ler var. Bu normal, SQL dosyası otomatik temizler. Tekrar RUN'a basın.

### Hata: "permission denied"

**Çözüm**: Supabase projenizde admin yetkisi yoksa, proje sahibinden SQL'i çalıştırmasını isteyin.

### Tablolar görünmüyor

**Çözüm**: 
1. Sayfayı yenileyin (F5)
2. Table Editor'de "Reload" yapın
3. Hala görünmüyorsa SQL'i tekrar çalıştırın

---

## 🎉 Kurulum Tamamlandı!

Artık uygulamanızda:
- ✅ Mülk ekleyebilirsiniz
- ✅ Müşteri ekleyebilirsiniz
- ✅ Görsel yükleyebilirsiniz
- ✅ Tüm veriler kaydedilir

**Not**: Bu kurulum development (geliştirme) içindir. Herkes veri ekleyebilir/silebilir. Production'da authentication ekleyin!
