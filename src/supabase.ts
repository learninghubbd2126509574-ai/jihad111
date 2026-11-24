import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://naeyjyqeipeboolcgzpl.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXlqeXFlaXBlYm9vbGNnenBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MzIyNTgsImV4cCI6MjExMTEwODI1OH0.6fTCr6Nn4AabaEksRhe8Ecs1L8NgL8J3ye03F74mCYc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const SUPABASE_SETUP_SQL = `-- =========================================================
-- Unity Earning: Supabase Database Setup SQL
-- Paste this in Supabase Dashboard -> SQL Editor and click Run!
-- =========================================================

-- 1. Create collections_data table for all collections
CREATE TABLE IF NOT EXISTS public.collections_data (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collection, id)
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_collections_data_coll ON public.collections_data (collection);
CREATE INDEX IF NOT EXISTS idx_collections_data_updated ON public.collections_data (updated_at DESC);

-- 3. Enable Row Level Security (RLS) & Grant full public access
ALTER TABLE public.collections_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for collections_data" ON public.collections_data;
CREATE POLICY "Public access for collections_data" 
ON public.collections_data 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Enable Realtime updates across devices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'collections_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.collections_data;
  END IF;
END $$;
`;

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tableReady: boolean;
  message: string;
}> {
  try {
    const { error, status } = await supabase
      .from('collections_data')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || status === 404) {
        return {
          connected: true,
          tableReady: false,
          message: 'Connected to Supabase, but "collections_data" table is not created yet. Please run the SQL setup script.',
        };
      }
      return {
        connected: false,
        tableReady: false,
        message: error.message || 'Failed to query Supabase.',
      };
    }
    return {
      connected: true,
      tableReady: true,
      message: 'Supabase is fully connected and ready!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tableReady: false,
      message: err?.message || 'Network error connecting to Supabase.',
    };
  }
}
