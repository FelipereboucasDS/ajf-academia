-- Create invoices table for monthly billing per student
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, period)
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_invoices" ON public.invoices;
CREATE POLICY "admin_all_invoices" ON public.invoices 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "student_own_invoices" ON public.invoices;
CREATE POLICY "student_own_invoices" ON public.invoices 
  FOR SELECT TO authenticated 
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_insert_invoices" ON public.invoices;
CREATE POLICY "student_insert_invoices" ON public.invoices 
  FOR INSERT TO authenticated 
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "student_update_invoices" ON public.invoices;
CREATE POLICY "student_update_invoices" ON public.invoices 
  FOR UPDATE TO authenticated 
  USING (student_id = auth.uid()) 
  WITH CHECK (student_id = auth.uid());

-- Create Storage Bucket for receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'receipts');
