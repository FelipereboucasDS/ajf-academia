DO $BODY$
BEGIN
  ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS student_name TEXT;
  ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS student_email TEXT;

  UPDATE public.bookings b
  SET student_name = p.name,
      student_email = p.email
  FROM public.profiles p
  WHERE b.student_id = p.id
    AND (b.student_name IS NULL OR b.student_email IS NULL);
END $BODY$;
