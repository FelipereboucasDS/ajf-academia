CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY CHECK (id = 1),
  booking_cutoff_time TIME NOT NULL DEFAULT '22:00:00',
  billing_cutoff_type TEXT NOT NULL DEFAULT 'last_business_day',
  billing_cutoff_day INT NOT NULL DEFAULT 1,
  pix_key TEXT NOT NULL DEFAULT ''
);

INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON public.app_settings;
CREATE POLICY "public_read_settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON public.app_settings;
CREATE POLICY "admin_update_settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
