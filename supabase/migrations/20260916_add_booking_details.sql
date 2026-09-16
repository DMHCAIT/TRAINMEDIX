ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_ref TEXT,
  ADD COLUMN IF NOT EXISTS booking_details JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_booking_ref_idx
  ON public.bookings (booking_ref)
  WHERE booking_ref IS NOT NULL;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'approved', 'in_rotation', 'rejected', 'completed', 'cancelled'));