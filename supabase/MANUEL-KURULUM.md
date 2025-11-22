# 🚀 Supabase Manuel Kurulum Rehberi

## Yöntem 1: RLS'i Kapat (En Kolay - Önerilen)

### Adım 1: Table Editor'ü Açın
1. Supabase Dashboard'a gidin
2. Sol menüden **"Table Editor"**'ü tıklayın

### Adım 2: Properties Tablosu için RLS'i Kapatın
1. **"properties"** tablosunu seçin
2. Sağ üstteki **"⚙️"** (ayarlar) simgesine tıklayın
3. **"Edit Table"** seçin
4. Aşağı kaydırın, **"Enable Row Level Security (RLS)"** seçeneğini bulun
5. ✅ İşareti kaldırın (KAPATIN)
6. **"Save"** butonuna tıklayın

### Adım 3: Clients Tablosu için RLS'i Kapatın
1. **"clients"** tablosunu seçin
2. Aynı işlemi tekrarlayın (RLS'i kapatın)

### Adım 4: Todos Tablosu için RLS'i Kapatın
1. **"todos"** tablosunu seçin
2. Aynı işlemi tekrarlayın (RLS'i kapatın)

### Adım 5: Storage Bucket Oluşturun
1. Sol menüden **"Storage"**'ı tıklayın
2. **"Create a new bucket"** butonuna tıklayın
3. **Name**: `property-images` yazın
4. **Public bucket**: ✅ İŞARETLEYİN (önemli!)
5. **"Save"** butonuna tıklayın

---

## Yöntem 2: Yeni Proje Oluştur (Eğer Yöntem 1 Çalışmazsa)

### Adım 1: Yeni Supabase Projesi
1. https://supabase.com/dashboard adresine gidin
2. **"New Project"** butonuna tıklayın
3. Proje adı: `commercial-crm` (veya istediğiniz ad)
4. Database Password: **Güçlü bir şifre** (kaydedin!)
5. Region: **Frankfurt** (veya size en yakın)
6. **"Create new project"** butonuna tıklayın
7. ⏱️ 2-3 dakika bekleyin (proje kurulumu)

### Adım 2: SQL Çalıştırın
1. Proje hazır olunca sol menüden **"SQL Editor"**'ü açın
2. Aşağıdaki SQL'i kopyalayıp yapıştırın
3. **"RUN"** butonuna basın

```sql
-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum'lar
CREATE TYPE client_role AS ENUM ('alici', 'satici', 'kiraci');
CREATE TYPE search_type AS ENUM ('kiralik_ariyor', 'satilik_ariyor');

-- Properties Tablosu
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'TRY',
  address TEXT,
  city TEXT,
  district TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  ada TEXT,
  parsel TEXT,
  property_type TEXT,
  total_area_m2 NUMERIC,
  closed_area_m2 NUMERIC,
  open_area_m2 NUMERIC,
  height_m NUMERIC,
  power_kw NUMERIC,
  column_spacing TEXT,
  floor_load_ton_m2 NUMERIC,
  has_crane BOOLEAN DEFAULT false,
  image_urls TEXT[],
  status TEXT DEFAULT 'active'
);

-- Clients Tablosu
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role client_role NOT NULL DEFAULT 'alici',
  search_type search_type,
  current_job TEXT,
  planned_activity TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_locations TEXT[],
  min_area_m2 NUMERIC,
  min_power_kw NUMERIC,
  notes TEXT
);

-- Todos Tablosu
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  task TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE
);

-- RLS'i kapatıyoruz (herkese açık)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
```

### Adım 3: Storage Bucket
1. Sol menüden **"Storage"** açın
2. **"Create a new bucket"**
3. Name: `property-images`
4. Public: ✅ İŞARETLE
5. **"Save"**

### Adım 4: .env Dosyasını Güncelleyin
1. Supabase Dashboard'da **"Settings"** > **"API"**'e gidin
2. Şu bilgileri kopyalayın:
   - **Project URL**
   - **anon public** key

3. `.env` dosyanızı açın ve güncelleyin:

```env
VITE_SUPABASE_URL=buraya_project_url_yapistirin
VITE_SUPABASE_ANON_KEY=buraya_anon_key_yapistirin
```

4. Terminalde dev server'ı yeniden başlatın:
```bash
# Ctrl+C ile durdurun
npm run dev
```

---

## ✅ Test Edin

1. http://localhost:5173 adresine gidin
2. **"Ekle"** sekmesine tıklayın
3. **"Mülk Ekle"** formunu doldurun:
   - Başlık: "Test Mülk"
   - Kapalı Alan: "1000"
4. **"Kaydet"** butonuna basın
5. **"Portföyler"** sekmesine gidin
6. Mülk görünüyor mu? ✅

---

## 🎯 Hangi Yöntemi Seçmeliyim?

- **Yöntem 1**: Mevcut projeniz varsa ve sadece RLS problemi yaşıyorsanız
- **Yöntem 2**: Karışık SQL hatalarından bıktıysanız veya temiz başlangıç istiyorsanız

## 💡 İpucu

Yöntem 2'yi tercih ediyorum çünkü:
- ✅ Hiç SQL yazmaya gerek yok
- ✅ Tüm ayarlar otomatik
- ✅ 5 dakikada hazır
- ✅ Garanti çalışır
