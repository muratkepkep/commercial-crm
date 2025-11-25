-- ===================================
-- CLEAN CLIENTS TABLE MIGRATION
-- ===================================
-- This script will completely rebuild the clients table
-- WARNING: This will DELETE ALL existing client data!
-- ===================================

-- STEP 1: Drop existing clients table
-- ===================================
DROP TABLE IF EXISTS clients CASCADE;

-- STEP 2: Create/Update ENUM types (without CASCADE)
-- ===================================

-- Client role types - DO NOT USE CASCADE
DO $$ BEGIN
    CREATE TYPE client_role AS ENUM ('alici', 'satici', 'kiraci', 'ev_sahibi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Search type
DO $$ BEGIN
    CREATE TYPE search_type AS ENUM ('kiralik_ariyor', 'satilik_ariyor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Client intent
DO $$ BEGIN
    CREATE TYPE client_intent AS ENUM ('satmak_istiyor', 'almak_istiyor', 'kiralamak_istiyor', 'kiraya_vermek_istiyor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- STEP 3: Create fresh clients table with ALL required columns
-- ===================================

CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Basic info
    full_name TEXT NOT NULL,
    phone TEXT,
    
    -- Role and intent
    role client_role NOT NULL DEFAULT 'alici'::client_role,
    search_type search_type,
    client_intent client_intent,
    
    -- Business info
    current_job TEXT,
    planned_activity TEXT,
    
    -- Budget (for buyers/renters)
    budget_min NUMERIC,
    budget_max NUMERIC,
    
    -- Property ownership (for landlords/sellers)
    owned_property_info TEXT,
    
    -- Notes
    notes TEXT,
    
    -- User ownership
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- STEP 4: Create indexes
-- ===================================

CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_clients_role ON clients(role);
CREATE INDEX idx_clients_created ON clients(created_at DESC);

-- STEP 5: Enable RLS
-- ===================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow public read access" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON clients
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON clients
  FOR DELETE USING (true);

-- STEP 6: Create updated_at trigger
-- ===================================

-- Function already exists from previous migrations
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- MIGRATION COMPLETED! ✅
-- ===================================
-- 
-- Next steps:
-- 1. All existing client data has been deleted
-- 2. You can now add clients with all fields working
-- 3. No more "Could not find column" errors
-- ===================================
