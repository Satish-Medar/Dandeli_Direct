import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log("🚀 Starting bulk import...");
  
  try {
    const rawData = readFileSync(new URL('./data.json', import.meta.url));
    const properties = JSON.parse(rawData);
    
    console.log(`Found ${properties.length} properties in data.json.`);
    console.log("Step 1/2: Upserting core fields...");

    // ── STAGE 1: Core fields that always exist in the schema ─────────────
    const coreProperties = properties.map(p => ({
      slug: p.id,
      alias: p.alias,
      exact_name: p.name || p.alias.replace(/#[0-9]+/, '').trim(),
      manager_phone: "+91 99999 99999",
      location: p.location,
      image_url: p.image,
      river_distance: p.riverDistanceText || p.riverDistance,
      signal: p.mobileSignal || p.signal,
      rating: typeof p.rating === 'string' ? parseFloat(p.rating) : p.rating,
      wholesale_rate: p.pricePerNightINR || p.stay,
      direct_rack_rate: (p.pricePerNightINR || p.stay) + 1000,
      is_verified: true,
      is_masked: true,
    }));

    const { data: coreData, error: coreError } = await supabase
      .from('properties')
      .upsert(coreProperties, { onConflict: 'slug' })
      .select('slug');

    if (coreError) {
      console.error("❌ Error inserting core fields:", coreError.message);
      return;
    }
    console.log(`✅ Step 1 complete — ${coreData.length} properties upserted.`);

    // ── STAGE 2: Rich fields (requires migration 001_add_rich_fields.sql) ─
    console.log("Step 2/2: Attempting to upsert rich fields (tags, amenities, etc.)...");
    console.log("   ℹ️  If this fails, run supabase/migrations/001_add_rich_fields.sql in your Supabase SQL Editor first.");

    const richProperties = properties.map(p => ({
      slug: p.id,
      tags: Array.isArray(p.tags) ? p.tags : [],
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      activities_offered: Array.isArray(p.activitiesOffered) ? p.activitiesOffered : [],
      meals_included: Array.isArray(p.mealsIncluded) ? p.mealsIncluded : [],
      food_type: p.foodType || null,
      pet_friendly: p.petFriendly === true,
      couple_friendly: p.coupleFriendly !== false,
      family_friendly: p.familyFriendly !== false,
      wifi_available: p.wifiAvailable === true,
      distance_to_river_km: p.distanceToRiverKm || null,
      stay_type: p.stayType || null,
      category: p.category || null,
      review_count: p.reviewCount || 0,
      nearest_landmark: p.nearestLandmark || null,
      google_maps_url: p.googleMapsUrl || null,
    }));

    const { data: richData, error: richError } = await supabase
      .from('properties')
      .upsert(richProperties, { onConflict: 'slug' })
      .select('slug');

    if (richError) {
      console.warn("⚠️  Rich fields skipped:", richError.message);
      console.warn("   → Run supabase/migrations/001_add_rich_fields.sql in Supabase SQL Editor, then re-run this script.");
    } else {
      console.log(`✅ Step 2 complete — rich fields saved for ${richData.length} properties.`);
    }

    console.log("\n🎉 Seed done!");
    
  } catch (error) {
    console.error("❌ Failed to run seed script:", error);
  }
}

seedData();
