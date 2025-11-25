-- ===================================
-- COMMERCIAL CRM - ENHANCED SCHEMA MIGRATION
-- ===================================
-- Run this in Supabase Dashboard > SQL Editor
-- This script adds new features while preserving existing data
-- ===================================

-- STEP 1: Create new ENUM types
-- ===================================

-- Property category types
DROP TYPE IF EXISTS property_category CASCADE;
CREATE TYPE property_category AS ENUM ('daire', 'fabrika', 'arsa', 'ofis', 'depo', 'arazi');

-- Listing type (satılık vs kiralık)
DROP TYPE IF EXISTS listing_type CASCADE;
CREATE TYPE listing_type AS ENUM ('satilik', 'kiralik');

-- Update client_role to include property owner/landlord
DROP TYPE IF EXISTS client_role CASCADE;
CREATE TYPE client_role AS ENUM ('alici', 'satici', 'kiraci', 'ev_sahibi');

-- Client intent/purpose
DROP TYPE IF EXISTS client_intent CASCADE;
CREATE TYPE client_intent AS ENUM ('satmak_istiyor', 'almak_istiyor', 'kiralamak_istiyor', 'kiraya_vermek_istiyor');

-- Recreate search_type
DROP TYPE IF EXISTS search_type CASCADE;
CREATE TYPE search_type AS ENUM ('kiralik_ariyor', 'satilik_ariyor');

-- STEP 2: Add new columns to PROPERTIES table
-- ===================================

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_category property_category,
ADD COLUMN IF NOT EXISTS listing_type listing_type,
ADD COLUMN IF NOT EXISTS property_owner_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT;

-- Migrate existing property_type data to new structure
-- Assume existing property_type contains 'satilik' or 'kiralik'
UPDATE properties 
SET listing_type = 
  CASE 
    WHEN property_type = 'satilik' THEN 'satilik'::listing_type
    WHEN property_type = 'kiralik' THEN 'kiralik'::listing_type
    ELSE 'satilik'::listing_type
  END
WHERE listing_type IS NULL;

-- Set default property_category for existing properties (can be updated later)
UPDATE properties 
SET property_category = 'fabrika'::property_category
WHERE property_category IS NULL;

-- STEP 3: Add new column to CLIENTS table
-- ===================================

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_intent client_intent;

-- STEP 4: Create NOTES table
-- ===================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  title TEXT NOT NULL,
  content TEXT,
  
  -- Links to other entities (optional)
  related_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  related_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- User who created the note
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_property ON notes(related_property_id);
CREATE INDEX IF NOT EXISTS idx_notes_client ON notes(related_client_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);

-- STEP 5: Create PLANS table
-- ===================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Links to other entities (optional)
  related_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  related_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- User who created the plan
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plans_property ON plans(related_property_id);
CREATE INDEX IF NOT EXISTS idx_plans_client ON plans(related_client_id);
CREATE INDEX IF NOT EXISTS idx_plans_scheduled ON plans(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_plans_completed ON plans(is_completed);

-- STEP 6: Enable RLS on new tables
-- ===================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Public access policies for notes
CREATE POLICY "Allow public read access" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON notes
  FOR DELETE USING (true);

-- Public access policies for plans
CREATE POLICY "Allow public read access" ON plans
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON plans
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON plans
  FOR DELETE USING (true);

-- STEP 7: Create trigger for updated_at
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to plans
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- MIGRATION COMPLETED! ✅
-- ===================================
-- 
-- Next steps:
-- 1. Verify in Supabase Table Editor that new columns exist
-- 2. Check that existing data is preserved
-- 3. Update your application code to use new fields
-- ===================================
