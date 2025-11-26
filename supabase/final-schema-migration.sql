-- ===================================
-- COMMERCIAL CRM - FINAL SCHEMA MIGRATION
-- ===================================
-- This migration aligns the database schema with TypeScript types
-- Run this in Supabase Dashboard > SQL Editor
-- 
-- This script is IDEMPOTENT and safe to run multiple times
-- It will NOT drop or lose any existing data
-- ===================================

-- STEP 1: Create/Update ENUM types
-- ===================================

-- Property category enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_category') THEN
        CREATE TYPE property_category AS ENUM ('daire', 'fabrika', 'arsa', 'ofis', 'depo', 'arazi');
    END IF;
END $$;

-- Listing type enum  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM ('satilik', 'kiralik');
    END IF;
END $$;

-- Client intent enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_intent') THEN
        CREATE TYPE client_intent AS ENUM ('satmak_istiyor', 'almak_istiyor', 'kiralamak_istiyor', 'kiraya_vermek_istiyor');
    END IF;
END $$;

-- Update client_role to include 'ev_sahibi' if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'client_role'::regtype 
        AND enumlabel = 'ev_sahibi'
    ) THEN
        ALTER TYPE client_role ADD VALUE 'ev_sahibi';
    END IF;
END $$;

-- STEP 2: Add missing columns to PROPERTIES table
-- ===================================

-- New categorization columns
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_category property_category,
ADD COLUMN IF NOT EXISTS listing_type listing_type;

-- Property owner reference (for rentals)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_owner_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Location columns (if missing from old schemas)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT;

-- Apartment/Office specific fields
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS room_count TEXT,
ADD COLUMN IF NOT EXISTS floor_number INTEGER,
ADD COLUMN IF NOT EXISTS building_age TEXT,
ADD COLUMN IF NOT EXISTS heating_type TEXT,
ADD COLUMN IF NOT EXISTS balcony BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS elevator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parking_spots INTEGER;

-- Factory/Warehouse specific fields
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS crane BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS entrance_height_m NUMERIC,
ADD COLUMN IF NOT EXISTS ground_loading BOOLEAN DEFAULT false;

-- Land specific fields
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS zoning_status TEXT,
ADD COLUMN IF NOT EXISTS gabari NUMERIC,
ADD COLUMN IF NOT EXISTS kak NUMERIC;

-- New administrative building field
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS administrative_building BOOLEAN DEFAULT false;

-- STEP 3: Migrate existing data
-- ===================================

-- Set default property_category for properties that don't have one
UPDATE properties 
SET property_category = 'fabrika'::property_category
WHERE property_category IS NULL;

-- Migrate property_type to listing_type
UPDATE properties 
SET listing_type = 
  CASE 
    WHEN property_type = 'satilik' THEN 'satilik'::listing_type
    WHEN property_type = 'kiralik' THEN 'kiralik'::listing_type
    ELSE 'satilik'::listing_type
  END
WHERE listing_type IS NULL AND property_type IS NOT NULL;

-- Set default listing_type for any remaining null values
UPDATE properties
SET listing_type = 'satilik'::listing_type
WHERE listing_type IS NULL;

-- Migrate has_crane to crane column
UPDATE properties
SET crane = has_crane
WHERE crane IS NULL AND has_crane IS NOT NULL;

-- STEP 4: Add missing columns to CLIENTS table
-- ===================================

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS client_intent client_intent,
ADD COLUMN IF NOT EXISTS owned_property_info TEXT;

-- STEP 5: Add missing columns to TODOS table
-- ===================================

ALTER TABLE todos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS weekday INTEGER;

-- STEP 6: Create indexes for performance
-- ===================================

-- Indexes for map/location queries
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_city_district ON properties(city, district);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(property_category);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- Index for property owner lookup
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(property_owner_id) WHERE property_owner_id IS NOT NULL;

-- Client indexes
CREATE INDEX IF NOT EXISTS idx_clients_role ON clients(role);
CREATE INDEX IF NOT EXISTS idx_clients_intent ON clients(client_intent) WHERE client_intent IS NOT NULL;

-- STEP 7: Verify critical columns exist
-- ===================================

-- This will show all columns in the properties table
-- Run this separately to verify the migration:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'properties'
-- ORDER BY column_name;

-- ===================================
-- MIGRATION COMPLETED! ✅
-- ===================================
-- 
-- What was updated:
-- ✓ Added property_category and listing_type enums
-- ✓ Added client_intent enum
-- ✓ Added 'ev_sahibi' to client_role enum
-- ✓ Added all property detail columns (apartment, factory, land specific)
-- ✓ Added client_intent and owned_property_info to clients
-- ✓ Added user_id to todos table
-- ✓ Created performance indexes for location and filtering
-- ✓ Migrated existing data (property_type → listing_type, has_crane → crane)
--
-- Next steps:
-- 1. Verify in Supabase Table Editor that all columns exist
-- 2. Test creating/updating properties with new fields
-- 3. Verify map coordinates are saving correctly
-- ===================================
