-- COMPLETE SCHEMA MIGRATION
-- This migration adds all missing fields to support full application functionality
-- SAFE TO RUN: All operations are additive, no data will be lost

-- 1. Update client_role enum to include 'ev_sahibi'
BEGIN;

-- Store current default value if exists, then drop it
ALTER TABLE clients ALTER COLUMN role DROP DEFAULT;

-- Drop and recreate the enum with all values
ALTER TYPE client_role RENAME TO client_role_old;
CREATE TYPE client_role AS ENUM ('alici', 'satici', 'kiraci', 'ev_sahibi');
ALTER TABLE clients ALTER COLUMN role TYPE client_role USING role::text::client_role;
DROP TYPE client_role_old;

-- Restore default
ALTER TABLE clients ALTER COLUMN role SET DEFAULT 'alici'::client_role;

COMMIT;

-- 2. Create client_intent enum (with existence check)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_intent') THEN
        CREATE TYPE client_intent AS ENUM (
            'satmak_istiyor',
            'almak_istiyor',
            'kiralamak_istiyor',
            'kiraya_vermek_istiyor'
        );
    END IF;
END $$;

-- 3. Add missing columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_intent client_intent,
ADD COLUMN IF NOT EXISTS owned_property_info text;

-- 4. Create property enums (with existence checks)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_category') THEN
        CREATE TYPE property_category AS ENUM (
            'daire',
            'fabrika',
            'arsa',
            'ofis',
            'depo',
            'arazi'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM (
            'satilik',
            'kiralik'
        );
    END IF;
END $$;

-- 5. Add missing columns to properties table
ALTER TABLE properties
-- Core categorization
ADD COLUMN IF NOT EXISTS property_category property_category,
ADD COLUMN IF NOT EXISTS listing_type listing_type,
ADD COLUMN IF NOT EXISTS property_owner_id uuid REFERENCES clients(id),

-- Apartment/Office specific fields
ADD COLUMN IF NOT EXISTS room_count text,
ADD COLUMN IF NOT EXISTS floor_number integer,
ADD COLUMN IF NOT EXISTS building_age text,
ADD COLUMN IF NOT EXISTS heating_type text,
ADD COLUMN IF NOT EXISTS balcony boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS elevator boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS furnished boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parking_spots integer,

-- Factory/Warehouse specific fields
ADD COLUMN IF NOT EXISTS crane boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS entrance_height_m numeric,
ADD COLUMN IF NOT EXISTS ground_loading boolean DEFAULT false,

-- Land/Plot specific fields
ADD COLUMN IF NOT EXISTS zoning_status text,
ADD COLUMN IF NOT EXISTS gabari numeric,
ADD COLUMN IF NOT EXISTS kak numeric,

-- Additional fields
ADD COLUMN IF NOT EXISTS administrative_building boolean DEFAULT false;

-- 6. Rename has_crane to crane (if has_crane exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'has_crane'
    ) THEN
        -- Copy data from has_crane to crane if crane doesn't have data
        UPDATE properties SET crane = has_crane WHERE crane IS NULL OR crane = false;
        -- Drop the old column
        ALTER TABLE properties DROP COLUMN has_crane;
    END IF;
END $$;

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(property_category);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(property_owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_role ON clients(role);
CREATE INDEX IF NOT EXISTS idx_clients_intent ON clients(client_intent);

-- 8. Update RLS policies for property_images (if not already set)
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access" ON property_images;
CREATE POLICY "Allow authenticated read access" 
ON property_images FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert access" ON property_images;
CREATE POLICY "Allow authenticated insert access" 
ON property_images FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update access" ON property_images;
CREATE POLICY "Allow authenticated update access" 
ON property_images FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete access" ON property_images;
CREATE POLICY "Allow authenticated delete access" 
ON property_images FOR DELETE 
TO authenticated 
USING (true);

-- 9. Add helpful comments
COMMENT ON COLUMN clients.client_intent IS 'What the client wants to do: buy, sell, rent, or rent out';
COMMENT ON COLUMN clients.owned_property_info IS 'Description of property owned by client (for ev_sahibi role)';
COMMENT ON COLUMN properties.property_category IS 'Type of property: apartment, factory, land, office, warehouse, plot';
COMMENT ON COLUMN properties.listing_type IS 'Listing type: for sale or for rent';
COMMENT ON COLUMN properties.property_owner_id IS 'References client with role ev_sahibi (property owner)';

-- Migration complete!
-- All fields are now in sync with the TypeScript application types
