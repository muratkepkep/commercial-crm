-- FIX: Allow public access for development (NO AUTHENTICATION REQUIRED)
-- This bypasses RLS for anonymous users. For production, you should implement proper authentication.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON properties;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update access" ON properties;

DROP POLICY IF EXISTS "Allow authenticated read access" ON clients;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON clients;
DROP POLICY IF EXISTS "Allow authenticated update access" ON clients;

DROP POLICY IF EXISTS "Allow authenticated read access" ON todos;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON todos;
DROP POLICY IF EXISTS "Allow authenticated update access" ON todos;

-- Create PUBLIC access policies (for development)
-- Properties
CREATE POLICY "Allow public read access" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON properties FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON properties FOR DELETE USING (true);

-- Clients
CREATE POLICY "Allow public read access" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON clients FOR DELETE USING (true);

-- Todos
CREATE POLICY "Allow public read access" ON todos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON todos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON todos FOR DELETE USING (true);
