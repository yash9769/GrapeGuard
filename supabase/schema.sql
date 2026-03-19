-- ============================================================
-- GrapeGuard Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  language    TEXT DEFAULT 'hi',  -- 'hi' = Hindi, 'en' = English
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FARMS
-- ============================================================
CREATE TABLE public.farms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  location    TEXT,
  area_acres  NUMERIC(6,2),
  grape_type  TEXT,  -- e.g., 'Thompson Seedless', 'Bangalore Blue'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SENSORS
-- ============================================================
CREATE TABLE public.sensors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id     UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,  -- 'temperature', 'humidity', 'soil_moisture'
  location    TEXT,           -- e.g., 'North Block', 'Row 3'
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SENSOR READINGS
-- ============================================================
CREATE TABLE public.sensor_readings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id   UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
  farm_id     UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  temperature NUMERIC(5,2),   -- Celsius
  humidity    NUMERIC(5,2),   -- Percentage (0-100)
  soil_moisture NUMERIC(5,2), -- Percentage (0-100)
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast dashboard queries
CREATE INDEX idx_sensor_readings_farm_time 
  ON public.sensor_readings(farm_id, recorded_at DESC);

-- ============================================================
-- AI DETECTIONS
-- ============================================================
CREATE TABLE public.detections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id       UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  result        TEXT NOT NULL,      -- e.g., 'healthy', 'powdery_mildew'
  result_label  TEXT NOT NULL,      -- Human readable: 'Healthy', 'Powdery Mildew'
  confidence    NUMERIC(5,2),       -- 0-100 percentage
  is_healthy    BOOLEAN DEFAULT FALSE,
  notes         TEXT,
  detected_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_detections_farm_time 
  ON public.detections(farm_id, detected_at DESC);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE public.alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id       UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,    -- 'sensor_high', 'sensor_low', 'disease_detected'
  severity      TEXT NOT NULL,    -- 'low', 'medium', 'high'
  title         TEXT NOT NULL,
  title_hi      TEXT,             -- Hindi translation
  message       TEXT NOT NULL,
  message_hi    TEXT,             -- Hindi translation
  is_read       BOOLEAN DEFAULT FALSE,
  source_id     UUID,             -- ID of reading or detection that triggered alert
  source_table  TEXT,             -- 'sensor_readings' or 'detections'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_farm_unread 
  ON public.alerts(farm_id, is_read, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts         ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can only see/edit their own profile
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- FARMS: users can only access their own farms
CREATE POLICY "farms_own" ON public.farms
  FOR ALL USING (auth.uid() = user_id);

-- SENSORS: users can access sensors on their farms
CREATE POLICY "sensors_own" ON public.sensors
  FOR ALL USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- SENSOR_READINGS: users can access readings for their farms
CREATE POLICY "sensor_readings_own" ON public.sensor_readings
  FOR ALL USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- DETECTIONS: users can access their own detections
CREATE POLICY "detections_own" ON public.detections
  FOR ALL USING (auth.uid() = user_id);

-- ALERTS: users can access their own alerts
CREATE POLICY "alerts_own" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET for detection images
-- Run via Supabase Dashboard > Storage > New Bucket
-- OR via SQL:
-- ============================================================

-- Insert bucket (if using SQL approach)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('detection-images', 'detection-images', true)
  ON CONFLICT DO NOTHING;

-- Storage policy: authenticated users can upload
CREATE POLICY "auth_upload_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'detection-images');

CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'detection-images');

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED: Demo farm + sensors (optional, run after signup)
-- Replace 'YOUR_USER_ID' with actual user UUID
-- ============================================================
/*
INSERT INTO public.farms (user_id, name, location, area_acres, grape_type)
  VALUES ('YOUR_USER_ID', 'मेरा अंगूर का खेत', 'Nashik, Maharashtra', 5.0, 'Thompson Seedless');

-- Get the farm ID and add sensors
INSERT INTO public.sensors (farm_id, name, type, location)
  VALUES
    ('FARM_ID', 'तापमान सेंसर 1', 'temperature', 'North Block'),
    ('FARM_ID', 'नमी सेंसर 1',    'humidity',    'North Block'),
    ('FARM_ID', 'मिट्टी सेंसर 1',  'soil_moisture','Row 3');
*/

