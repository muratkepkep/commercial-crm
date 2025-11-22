-- ===================================
-- SADECE POLICY GÜNCELLEMESİ
-- ===================================
-- Mevcut tabloları silmeden sadece herkese açık yapar
-- ===================================

-- Eski policy'leri temizle
-- ===================================
DROP POLICY IF EXISTS "Allow authenticated read access" ON properties;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update access" ON properties;
DROP POLICY IF EXISTS "Allow public read access" ON properties;
DROP POLICY IF EXISTS "Allow public insert access" ON properties;
DROP POLICY IF EXISTS "Allow public update access" ON properties;
DROP POLICY IF EXISTS "Allow public delete access" ON properties;

DROP POLICY IF EXISTS "Allow authenticated read access" ON clients;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON clients;
DROP POLICY IF EXISTS "Allow authenticated update access" ON clients;
DROP POLICY IF EXISTS "Allow public read access" ON clients;
DROP POLICY IF EXISTS "Allow public insert access" ON clients;
DROP POLICY IF EXISTS "Allow public update access" ON clients;
DROP POLICY IF EXISTS "Allow public delete access" ON clients;

DROP POLICY IF EXISTS "Allow authenticated read access" ON todos;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON todos;
DROP POLICY IF EXISTS "Allow authenticated update access" ON todos;
DROP POLICY IF EXISTS "Allow public read access" ON todos;
DROP POLICY IF EXISTS "Allow public insert access" ON todos;
DROP POLICY IF EXISTS "Allow public update access" ON todos;
DROP POLICY IF EXISTS "Allow public delete access" ON todos;

-- YENİ HERKESE AÇIK POLICY'LER
-- ===================================

-- Properties
CREATE POLICY "Allow public read access" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON properties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON properties
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON properties
  FOR DELETE USING (true);

-- Clients
CREATE POLICY "Allow public read access" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON clients
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON clients
  FOR DELETE USING (true);

-- Todos
CREATE POLICY "Allow public read access" ON todos
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON todos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON todos
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON todos
  FOR DELETE USING (true);

-- STORAGE POLICY'LERİ
-- ===================================

-- Var olan storage policy'leri temizle
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;

-- Bucket oluştur (yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Yeni storage policy'leri
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Anyone can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'property-images');

-- ===================================
-- TAMAMLANDI! ✅
-- ===================================
-- Artık herkes veri ekleyip okuyabilir
