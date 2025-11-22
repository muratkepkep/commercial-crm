-- ===================================
-- YENİ SUPABASE PROJESİ İÇİN
-- ===================================
-- Temiz bir Supabase projesinde çalıştırın
-- RLS KAPALI - Herkese açık
-- ===================================

-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Tipler
CREATE TYPE client_role AS ENUM ('alici', 'satici', 'kiraci');
CREATE TYPE search_type AS ENUM ('kiralik_ariyor', 'satilik_ariyor');

-- PROPERTIES Tablosu
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

-- CLIENTS Tablosu
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

-- TODOS Tablosu
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  task TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE
);

-- RLS'i Kapat (Herkese Açık)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- ===================================
-- TAMAMLANDI! ✅
-- Storage bucket'ı manuel oluşturun:
-- Storage > Create bucket > "property-images" (public ✅)
-- ===================================
