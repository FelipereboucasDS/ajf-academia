-- Recreate the trigger function with exception handling to prevent auth.users insert failures
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  parsed_dob DATE := NULL;
BEGIN
  -- Safely parse the date, if it fails, fallback to NULL
  BEGIN
    IF NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data->>'date_of_birth' != '' THEN
      parsed_dob := (NEW.raw_user_meta_data->>'date_of_birth')::DATE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    parsed_dob := NULL;
  END;

  INSERT INTO public.profiles (id, name, email, role, status, date_of_birth)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'student',
    'active',
    parsed_dob
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill missing profiles for existing auth users (fixes manually deleted profiles)
DO $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', email),
    email,
    'student',
    'active'
  FROM auth.users
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.users.id)
  ON CONFLICT (id) DO NOTHING;
END $$;
