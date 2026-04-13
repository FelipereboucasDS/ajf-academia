ALTER TABLE public.units ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS available_hours jsonb NOT NULL DEFAULT '[]'::jsonb;

DROP POLICY IF EXISTS "admin_insert_schedules" ON public.schedules;
CREATE POLICY "admin_insert_schedules" ON public.schedules
  FOR INSERT TO authenticated WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin' ));

DROP POLICY IF EXISTS "admin_update_schedules" ON public.schedules;
CREATE POLICY "admin_update_schedules" ON public.schedules
  FOR UPDATE TO authenticated USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin' ));

DROP POLICY IF EXISTS "admin_delete_schedules" ON public.schedules;
CREATE POLICY "admin_delete_schedules" ON public.schedules
  FOR DELETE TO authenticated USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin' ));
