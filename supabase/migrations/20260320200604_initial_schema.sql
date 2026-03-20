DO $BODY$
DECLARE
  admin_id uuid;
  student_id uuid;
  teacher_id uuid;
BEGIN

  -- 1. Create Tables
  CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    photo TEXT NOT NULL,
    capacity INT NOT NULL,
    price NUMERIC NOT NULL
  );

  CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    status TEXT NOT NULL DEFAULT 'active',
    favorite_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'booked',
    attendance TEXT NOT NULL DEFAULT 'pending'
  );

  -- 2. RLS & Policies
  ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "public_units" ON public.units;
  CREATE POLICY "public_units" ON public.units FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "public_schedules" ON public.schedules;
  CREATE POLICY "public_schedules" ON public.schedules FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "public_profiles" ON public.profiles;
  CREATE POLICY "public_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
  CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

  DROP POLICY IF EXISTS "public_bookings" ON public.bookings;
  CREATE POLICY "public_bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "insert_bookings" ON public.bookings;
  CREATE POLICY "insert_bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
  
  DROP POLICY IF EXISTS "update_bookings" ON public.bookings;
  CREATE POLICY "update_bookings" ON public.bookings FOR UPDATE TO authenticated USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

  -- 3. Seeds
  -- Insert Units
  INSERT INTO public.units (id, name, address, photo, capacity, price) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'AJF Penha', 'Rua Guaiaúna, 150 - Penha, SP', 'https://img.usecurling.com/p/600/400?q=soccer%20field&color=black&dpr=2', 15, 80),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid, 'AJF Guarulhos', 'Av. Tiradentes, 1000 - Guarulhos, SP', 'https://img.usecurling.com/p/600/400?q=stadium%20lights&color=black&dpr=2', 12, 75),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::uuid, 'AJF Mooca', 'Rua Juventus, 690 - Mooca, SP', 'https://img.usecurling.com/p/600/400?q=goal%20net&color=black&dpr=2', 20, 90)
  ON CONFLICT (id) DO NOTHING;

  -- Insert Schedules
  INSERT INTO public.schedules (id, unit_id, day_of_week) VALUES
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 1),
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid, 2),
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 3),
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid, 4),
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::uuid, 5),
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::uuid, 6),
  (gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::uuid, 0)
  ON CONFLICT DO NOTHING;

  -- Admin Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'felipereboucas35@gmail.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'felipereboucas35@gmail.com',
      crypt('securepassword123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Felipe Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, name, email, role, status, avatar)
    VALUES (admin_id, 'Felipe Admin', 'felipereboucas35@gmail.com', 'admin', 'active', 'https://img.usecurling.com/i?q=shield&color=white&shape=fill')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Student Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'aluno@ajf.com') THEN
    student_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      student_id, '00000000-0000-0000-0000-000000000000', 'aluno@ajf.com',
      crypt('securepassword123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Aluno Teste"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, name, email, role, status, avatar)
    VALUES (student_id, 'Aluno Teste', 'aluno@ajf.com', 'student', 'active', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Teacher Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'prof@ajf.com') THEN
    teacher_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      teacher_id, '00000000-0000-0000-0000-000000000000', 'prof@ajf.com',
      crypt('securepassword123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Prof Teste"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, name, email, role, status, avatar)
    VALUES (teacher_id, 'Prof. Renato', 'prof@ajf.com', 'teacher', 'active', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3')
    ON CONFLICT (id) DO NOTHING;
  END IF;

END $BODY$;
