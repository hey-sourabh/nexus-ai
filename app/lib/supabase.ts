// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ye 'supabase' object hum pure app me DB se baat karne ke liye use karenge
export const supabase = createClient(supabaseUrl, supabaseAnonKey);