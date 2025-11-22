# 🔑 Supabase API Anahtarlarını Alma Rehberi

Tarayıcınızda **API Settings** sayfası zaten açık: 
https://supabase.com/dashboard/project/dvxacalacycgjkirrfqa/settings/api

## Kopyalamanız Gereken 2 Değer:

### 1️⃣ Project URL
Sayfanın üst kısmında "**Project URL**" başlığı altında:
```
https://dvxacalacycgjkirrfqa.supabase.co
```
Bu değer zaten `.env` dosyasına yazıldı ✅

### 2️⃣ anon public Key
"**Project API keys**" bölümünde, **"anon"** ve **"public"** etiketli satırda:

- Uzun bir text string göreceksiniz (JWT token)
- `eyJ` ile başlıyor olmalı
- Yanında "reveal" veya "copy" butonu olabilir
- Bu değeri **TAM OLARAK** kopyalayın

## 📝 Nasıl Kopyalanır:

1. **"anon public" satırını bulun**
2. Yanındaki **"Copy"** butonuna tıklayın (📋 ikonu)
   - VEYA metni seçip `Ctrl+C` ile kopyalayın
3. Kopyaladığınız değer şuna benzer olmalı:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eGFjYWxhY3ljZ2praXJyZnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg1NzQ...
   ```

## ✍️ `.env` Dosyasına Yapıştırma:

1. VS Code'da `.env` dosyasını açın
2. `VITE_SUPABASE_ANON_KEY=` satırını bulun
3. `=` işaretinden sonraki kısmı silin
4. Kopyaladığınız anon key'i yapıştırın

**SONUÇ:**
```env
VITE_SUPABASE_URL=https://dvxacalacycgjkirrfqa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
```

## ❓ Eğer Key'i Bulamıyorsanız:

Ekran görüntüsü alıp bana gönderin, size yardımcı olayım!
