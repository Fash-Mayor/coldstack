-- Run in Supabase SQL editor if stacks already exists without carrier_id
ALTER TABLE public.stacks
  ADD COLUMN IF NOT EXISTS carrier_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_stacks_carrier_id ON public.stacks(carrier_id);
