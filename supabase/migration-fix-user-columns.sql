-- ===================================
-- MİGRATİON: Eksik user_id Kolonları ve property_images Tablosu
-- ===================================
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- Bu script mevcut verileri korur, sadece eksik şemaları ekler
-- ===================================

-- ADIM 1: clients tablosuna user_id kolonu ekle
-- ===================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE clients 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'user_id kolonu clients tablosuna eklendi';
    ELSE
        RAISE NOTICE 'user_id kolonu zaten clients tablosunda mevcut';
    END IF;
END $$;

-- ADIM 2: properties tablosuna user_id kolonu ekle
-- ===================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE properties 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'user_id kolonu properties tablosuna eklendi';
    ELSE
        RAISE NOTICE 'user_id kolonu zaten properties tablosunda mevcut';
    END IF;
END $$;

-- ADIM 3: property_images tablosunu oluştur
-- ===================================
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    
    CONSTRAINT unique_property_image UNIQUE(property_id, storage_path)
);

-- ADIM 4: property_images için index oluştur
-- ===================================
CREATE INDEX IF NOT EXISTS idx_property_images_property_id 
ON property_images(property_id);

-- ADIM 5: property_images için RLS aktif et
-- ===================================
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- ADIM 6: property_images için policy'ler ekle
-- ===================================
DROP POLICY IF EXISTS "Allow public read access" ON property_images;
DROP POLICY IF EXISTS "Allow public insert access" ON property_images;
DROP POLICY IF EXISTS "Allow public update access" ON property_images;
DROP POLICY IF EXISTS "Allow public delete access" ON property_images;

CREATE POLICY "Allow public read access" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON property_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON property_images
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON property_images
    FOR DELETE USING (true);

-- ===================================
-- DOĞRULAMA: Kolonların eklendiğini kontrol et
-- ===================================
DO $$
DECLARE
    client_user_id_exists BOOLEAN;
    property_user_id_exists BOOLEAN;
    property_images_exists BOOLEAN;
BEGIN
    -- clients.user_id kontrolü
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'user_id'
    ) INTO client_user_id_exists;
    
    -- properties.user_id kontrolü
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'user_id'
    ) INTO property_user_id_exists;
    
    -- property_images tablosu kontrolü
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'property_images'
    ) INTO property_images_exists;
    
    -- Sonuçları göster
    IF client_user_id_exists AND property_user_id_exists AND property_images_exists THEN
        RAISE NOTICE '✅ TÜM DEĞİŞİKLİKLER BAŞARIYLA UYGULANMIŞTIR!';
        RAISE NOTICE '  - clients.user_id: MEVCUT';
        RAISE NOTICE '  - properties.user_id: MEVCUT';
        RAISE NOTICE '  - property_images tablosu: MEVCUT';
    ELSE
        RAISE WARNING '⚠️ BAZI DEĞİŞİKLİKLER EKSIK:';
        IF NOT client_user_id_exists THEN
            RAISE WARNING '  - clients.user_id: EKSİK';
        END IF;
        IF NOT property_user_id_exists THEN
            RAISE WARNING '  - properties.user_id: EKSİK';
        END IF;
        IF NOT property_images_exists THEN
            RAISE WARNING '  - property_images tablosu: EKSİK';
        END IF;
    END IF;
END $$;

-- ===================================
-- MİGRATİON TAMAMLANDI! ✅
-- ===================================
-- Artık müşteri ve portföy ekleme çalışacaktır.
-- Uygulamanızı yeniden başlatın: npm run dev
-- ===================================
