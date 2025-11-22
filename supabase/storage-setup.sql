-- Storage bucket for property images (Run this in Supabase Dashboard > SQL Editor)

-- Create storage bucket for property images
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'property-images');

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-images');

-- Allow authenticated users to delete images
create policy "Authenticated users can delete images"
on storage.objects for delete
to authenticated
using (bucket_id = 'property-images');

-- Allow updating images (for replacing)
create policy "Authenticated users can update images"
on storage.objects for update
to authenticated
using (bucket_id = 'property-images');
