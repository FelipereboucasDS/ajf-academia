DO $$
BEGIN
  -- Insert bucket if not exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('unit-photos', 'unit-photos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Create policies for unit-photos bucket
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'unit-photos');

CREATE POLICY "Admin Upload" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'unit-photos' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admin Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (
    bucket_id = 'unit-photos' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admin Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (
    bucket_id = 'unit-photos' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
