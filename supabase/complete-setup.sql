-- ===================================
-- COMMERCIAL CRM - BASIT KURULUM
-- ===================================
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- Sadece gerekli tabloları oluşturur
-- ===================================

-- ADIM 1: Eski policy'leri temizle
-- ===================================
DROP POLICY IF EXISTS "Allow public read access" ON properties;
DROP POLICY IF EXISTS "Allow public insert access" ON properties;
DROP POLICY IF EXISTS "Allow public update access" ON properties;
DROP POLICY IF EXISTS "Allow public delete access" ON properties;

DROP POLICY IF EXISTS "Allow public read access" ON clients;
DROP POLICY IF EXISTS "Allow public insert access" ON clients;
DROP POLICY IF EXISTS "Allow public update access" ON clients;
DROP POLICY IF EXISTS "Allow public delete access" ON clients;

DROP POLICY IF EXISTS "Allow public read access" ON todos;
DROP POLICY IF EXISTS "Allow public insert access" ON todos;
DROP POLICY IF EXISTS "Allow public update access" ON todos;
DROP POLICY IF EXISTS "Allow public delete access" ON todos;

-- ADIM 2: Tabloları sil (eğer varsa)
-- ===================================
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- ADIM 3: Enum tipleri oluştur
-- ===================================
DROP TYPE IF EXISTS search_type CASCADE;
DROP TYPE IF EXISTS client_role CASCADE;

CREATE TYPE client_role AS ENUM ('alici', 'satici', 'kiraci');
CREATE TYPE search_type AS ENUM ('kiralik_ariyor', 'satilik_ariyor');

-- Extension aktif et
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ADIM 4: PROPERTIES Tablosu
-- ===================================
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Temel Bilgiler
  title TEXT NOT NULL,
  description TEXT,
  
  -- Fiyat
  price NUMERIC,
  currency TEXT DEFAULT 'TRY',
  
  -- Konum
  address TEXT,
  city TEXT,
  district TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  ada TEXT,
  parsel TEXT,
  
  -- Özellikler
  property_type TEXT,
  total_area_m2 NUMERIC,
  closed_area_m2 NUMERIC,
  open_area_m2 NUMERIC,
  height_m NUMERIC,
  power_kw NUMERIC,
  column_spacing TEXT,
  floor_load_ton_m2 NUMERIC,
  has_crane BOOLEAN DEFAULT false,
  
  -- Görseller
  image_urls TEXT[],
  
  -- Durum
  status TEXT DEFAULT 'active',
  
  -- Kullanıcı İlişkisi
  user_id UUID REFERENCES auth.users(id)
);

-- ADIM 5: CLIENTS Tablosu
-- ===================================
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Kişisel Bilgiler
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  
  -- Rol ve Arama Tipi
  role client_role NOT NULL DEFAULT 'alici',
  search_type search_type,
  
  -- İş Bilgileri
  current_job TEXT,
  planned_activity TEXT,
  
  -- Gereksinimler
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_locations TEXT[],
  min_area_m2 NUMERIC,
  min_power_kw NUMERIC,
  
  notes TEXT,
  
  -- Kullanıcı İlişkisi
  user_id UUID REFERENCES auth.users(id)
);

-- ADIM 6: TODOS Tablosu
-- ===================================
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  task TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE
);

-- ADIM 6.5: PROPERTY_IMAGES Tablosu
-- ===================================
CREATE TABLE property_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  
  CONSTRAINT unique_property_image UNIQUE(property_id, storage_path)
);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);

-- ADIM 7: RLS Aktif Et
-- ===================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- ADIM 8: HERKESE AÇIK POLICY'LER
-- ===================================

-- Properties - Herkese Açık
CREATE POLICY "Allow public read access" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON properties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON properties
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON properties
  FOR DELETE USING (true);

-- Clients - Herkese Açık
CREATE POLICY "Allow public read access" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON clients
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON clients
  FOR DELETE USING (true);

-- Todos - Herkese Açık
CREATE POLICY "Allow public read access" ON todos
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON todos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON todos
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON todos
  FOR DELETE USING (true);

-- Property Images - Herkese Açık
CREATE POLICY "Allow public read access" ON property_images
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON property_images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON property_images
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON property_images
  FOR DELETE USING (true);

-- ADIM 9: STORAGE BUCKET (Görseller)
-- ===================================

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;

-- Bucket oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy'leri
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Anyone can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'property-images');

-- ===================================
-- KURULUM TAMAMLANDI! ✅
-- ===================================
