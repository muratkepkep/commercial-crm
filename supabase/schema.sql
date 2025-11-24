-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum for Client Roles
create type client_role as enum ('alici', 'satici', 'kiraci');

-- Create Enum for Search Type
create type search_type as enum ('kiralik_ariyor', 'satilik_ariyor');

-- Create Enum for User Roles (App Users)
create type user_role as enum ('admin', 'staff');

-- 1. PROFILES (Linked to Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role user_role default 'staff',
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROPERTIES (Industrial & Commercial Specs)
create table properties (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric,
  currency text default 'TRY',
  
  -- Location
  address text,
  city text,
  district text,
  lat double precision,
  lng double precision,
  ada text,
  parsel text,
  
  -- Industrial Specs
  property_type text, -- e.g., 'factory', 'warehouse', 'land'
  total_area_m2 numeric,
  closed_area_m2 numeric,
  open_area_m2 numeric,
  height_m numeric, -- Ceiling height
  power_kw numeric, -- Electricity power
  column_spacing text, -- e.g., '10x10'
  floor_load_ton_m2 numeric, -- Floor load capacity
  has_crane boolean default false,
  
  -- Media
  image_urls text[], -- Array of image URLs
  
  -- Metadata
  status text default 'active', -- 'active', 'sold', 'rented'
  user_id uuid references auth.users(id),
  owner_id uuid references profiles(id)
);

-- 3. CLIENTS (The "Smart" Notebook)
create table clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  full_name text not null,
  phone text,
  email text,
  
  -- Role & Classification
  role client_role not null default 'alici',
  search_type search_type, -- What type of property they are looking for
  
  -- Business Info
  current_job text, -- "Mevcut İşi / Mesleği"
  planned_activity text, -- "Yapacağı İş" (Critical for industrial)
  
  -- Requirements / Preferences
  budget_min numeric,
  budget_max numeric,
  preferred_locations text[],
  min_area_m2 numeric,
  min_power_kw numeric,
  
  notes text,
  
  user_id uuid references auth.users(id),
  assigned_to uuid references profiles(id)
);

-- 3.5 PROPERTY IMAGES (for Supabase Storage)
create table property_images (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  display_order integer default 0,
  
  constraint unique_property_image unique(property_id, storage_path)
);

create index idx_property_images_property_id on property_images(property_id);

-- 4. TODOS
create table todos (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  task text not null,
  is_completed boolean default false,
  due_date timestamp with time zone,
  
  user_id uuid references auth.users(id)
);

-- Set up Row Level Security (RLS)
-- For development, we might want to allow public access or restrict to authenticated users
alter table profiles enable row level security;
alter table properties enable row level security;
alter table clients enable row level security;
alter table todos enable row level security;
alter table property_images enable row level security;

-- Policy: Allow authenticated users to read all
create policy "Allow authenticated read access" on profiles for select to authenticated using (true);
create policy "Allow authenticated read access" on properties for select to authenticated using (true);
create policy "Allow authenticated read access" on clients for select to authenticated using (true);
create policy "Allow authenticated read access" on todos for select to authenticated using (true);

-- Policy: Allow authenticated users to insert/update
create policy "Allow authenticated insert access" on properties for insert to authenticated with check (true);
create policy "Allow authenticated update access" on properties for update to authenticated using (true);

create policy "Allow authenticated insert access" on clients for insert to authenticated with check (true);
create policy "Allow authenticated update access" on clients for update to authenticated using (true);

create policy "Allow authenticated insert access" on todos for insert to authenticated with check (true);
create policy "Allow authenticated update access" on todos for update to authenticated using (true);
