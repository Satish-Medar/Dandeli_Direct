-- Migration: Add rich property fields to support advanced search
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activities_offered text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meals_included text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS food_type text,
  ADD COLUMN IF NOT EXISTS pet_friendly boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS couple_friendly boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS family_friendly boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS wifi_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS distance_to_river_km numeric(4,1),
  ADD COLUMN IF NOT EXISTS stay_type text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nearest_landmark text,
  ADD COLUMN IF NOT EXISTS google_maps_url text;
