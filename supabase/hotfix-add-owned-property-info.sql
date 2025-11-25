-- HOTFIX: Add owned_property_info field to clients
-- Run this IMMEDIATELY in Supabase SQL Editor if you already ran the previous migration

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS owned_property_info TEXT;
