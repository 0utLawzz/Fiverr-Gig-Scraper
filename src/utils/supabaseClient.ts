import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FiverrGig } from '../types/scraper';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
}

const STORAGE_KEY = 'fiverr_scraper_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read Supabase config from storage', e);
  }

  // Fallback to environment variables if available
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'fiverr_gigs',
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

export function createSupabaseInstance(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (err) {
    console.error('Supabase client creation error', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string, tableName = 'fiverr_gigs'): Promise<{ success: boolean; message: string }> {
  try {
    const client = createSupabaseInstance(url, anonKey);
    if (!client) {
      return { success: false, message: 'Invalid Supabase URL or Anon Key format.' };
    }

    // Attempt a light select to test access
    const { error } = await client.from(tableName).select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: `Connected to Supabase! Note: Table '${tableName}' does not exist yet. Run the SQL script below in Supabase SQL Editor.`,
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }

    return { success: true, message: `Successfully connected to Supabase table '${tableName}'!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to reach Supabase project.' };
  }
}

export async function syncGigsToSupabase(
  gigs: FiverrGig[],
  config: SupabaseConfig
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = createSupabaseInstance(config.url, config.anonKey);
  if (!client) {
    return { success: false, count: 0, error: 'Supabase credentials are not configured.' };
  }

  try {
    // Transform gigs into table schema rows
    const rows = gigs.map((g) => ({
      id: g.id,
      position: g.position,
      title: g.title,
      seller_name: g.sellerName,
      seller_level: g.sellerLevel,
      rating: g.rating,
      review_count: g.reviewCount,
      price: g.price,
      currency: g.currency || '$',
      image_url: g.imageUrl,
      gig_url: g.gigUrl,
      badges: g.badges,
      keywords: g.keywords,
      delivery_time: g.deliveryTime,
      scraped_at: g.timestamp,
    }));

    // Perform upsert on table
    const { data, error } = await client
      .from(config.tableName || 'fiverr_gigs')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Failed to upsert records into Supabase.' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- 1. Create table for scraped Fiverr Gigs
CREATE TABLE IF NOT EXISTS public.fiverr_gigs (
    id TEXT PRIMARY KEY,
    position INTEGER,
    title TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_level TEXT,
    rating NUMERIC(3, 2),
    review_count INTEGER,
    price NUMERIC(10, 2),
    currency TEXT DEFAULT '$',
    image_url TEXT,
    gig_url TEXT,
    badges TEXT[],
    keywords TEXT[],
    delivery_time TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for instant analytical queries
CREATE INDEX IF NOT EXISTS idx_fiverr_gigs_seller ON public.fiverr_gigs(seller_name);
CREATE INDEX IF NOT EXISTS idx_fiverr_gigs_price ON public.fiverr_gigs(price);
CREATE INDEX IF NOT EXISTS idx_fiverr_gigs_rating ON public.fiverr_gigs(rating);
CREATE INDEX IF NOT EXISTS idx_fiverr_gigs_scraped_at ON public.fiverr_gigs(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_fiverr_gigs_keywords ON public.fiverr_gigs USING GIN(keywords);

-- 3. Row Level Security (RLS) setup
ALTER TABLE public.fiverr_gigs ENABLE ROW LEVEL SECURITY;

-- 4. Policies (allow public reads and anon upsert)
DROP POLICY IF EXISTS "Allow public read access" ON public.fiverr_gigs;
CREATE POLICY "Allow public read access" 
  ON public.fiverr_gigs FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow anon upsert" ON public.fiverr_gigs;
CREATE POLICY "Allow anon upsert" 
  ON public.fiverr_gigs FOR ALL 
  USING (true) 
  WITH CHECK (true);
`;
