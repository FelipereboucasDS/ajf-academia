-- Drop existing policies if any to ensure idempotency
DROP POLICY IF EXISTS "admin_insert_units" ON public.units;
DROP POLICY IF EXISTS "admin_update_units" ON public.units;
DROP POLICY IF EXISTS "admin_delete_units" ON public.units;

-- Create policies for admin to insert, update, and delete units
CREATE POLICY "admin_insert_units" ON public.units
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "admin_update_units" ON public.units
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "admin_delete_units" ON public.units
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
