CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS latitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'CO',
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

UPDATE public.properties
SET address = COALESCE(address, address_line)
WHERE address IS NULL AND address_line IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_property_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(
      ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision),
      4326
    )::geography;
  ELSE
    NEW.location := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_property_location ON public.properties;

CREATE TRIGGER trg_sync_property_location
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.sync_property_location();

UPDATE public.properties
SET updated_at = updated_at
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_property_location
ON public.properties
USING GIST (location);
