ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time_slot text;

-- Limpar possíveis duplicatas existentes antes de criar o índice único
DELETE FROM public.bookings
WHERE ctid NOT IN (
    SELECT min(ctid)
    FROM public.bookings
    WHERE status = 'booked'
    GROUP BY student_id, date
) AND status = 'booked';

-- Removemos o índice caso exista para garantir a idempotência
DROP INDEX IF EXISTS one_booking_per_day_idx;

-- Criamos um índice único para student_id e date apenas quando status for 'booked'
-- Isso garante a regra de negócio: apenas uma aula por dia por aluno
CREATE UNIQUE INDEX one_booking_per_day_idx ON public.bookings (student_id, date) WHERE status = 'booked';
