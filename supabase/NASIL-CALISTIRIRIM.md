# NASIL ÇALIŞTIRIRIM?

## Adım 1: Supabase Dashboard'a Git

1. Tarayıcınızda [https://supabase.com](https://supabase.com) adresine gidin
2. Projenize giriş yapın
3. Sol menüden **SQL Editor**'e tıklayın

## Adım 2: Migration Script'i Kopyala

1. Bu dosyayı açın: `supabase/migration-fix-user-columns.sql`
2. **TÜM içeriği** kopyalayın (Ctrl+A, sonra Ctrl+C)

## Adım 3: Supabase'de Çalıştır

1. SQL Editor'de **"New query"** butonuna tıklayın
2. Kopyaladığınız içeriği yapıştırın (Ctrl+V)
3. Sağ alttaki **"Run"** butonuna tıklayın ▶️
4. Birkaç saniye bekleyin

## Adım 4: Sonuçları Kontrol Et

SQL çalıştıktan sonra, altta şu mesajları görmelisiniz:

```
✅ TÜM DEĞİŞİKLİKLER BAŞARIYLA UYGULANMIŞTIR!
  - clients.user_id: MEVCUT
  - properties.user_id: MEVCUT
  - property_images tablosu: MEVCUT
```

## Adım 5: Uygulamayı Test Et

Artık müşteri ve portföy ekleme çalışmalıdır!

1. Terminalde şu komutu çalıştırın:
   ```bash
   npm run dev
   ```

2. Tarayıcıda uygulamayı açın

3. **Müşteri Defteri** sayfasına gidin
   - "+" butonuna tıklayın
   - Formu doldurun
   - "Kaydet"
   - ✅ "Müşteri eklendi!" mesajı görmeli ve listede görünmeli

4. **Portföy Ekle** sayfasına gidin
   - "Müşteri Ekle" sekmesinden "Mülk Ekle" sekmesine geçin
   - Başlık ve Kapalı Alan giriniz
   - "Kaydet"
   - ✅ "Mülk kaydedildi!" mesajı görmeli

## Sorun Giderme

### Hata: "relation 'clients' does not exist"
- Veritabanı hiç kurulmamış olabilir
- Önce `complete-setup.sql` dosyasını çalıştırın, sonra migration'ı

### Hata: "column 'user_id' already exists"  
- Bu normal! Migration zaten çalıştırılmış demektir
- Hiçbir şey yapmanıza gerek yok ✅

### Müşteri/Portföy hala eklenmiyor
1. Tarayıcı console'u açın (F12)
2. Hata mesajlarını kontrol edin
3. Supabase Dashboard > Table Editor'de `clients` ve `properties` tablolarını kontrol edin
4. `user_id` kolonunun olup olmadığını kontrol edin

## Yardım

Sorun yaşarsanız:
- Console'daki hata mesajlarını paylaşın
- Supabase SQL Editor'de aldığınız hata mesajını paylaşın
