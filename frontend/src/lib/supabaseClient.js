import { createClient } from '@supabase/supabase-js';

// Read from env variable or fallback to local storage
const getSupabaseConfig = () => {
  // Vite env variables
  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  
  const localUrl = localStorage.getItem('sb_supabase_url');
  const localKey = localStorage.getItem('sb_supabase_anon_key');
  
  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || ''
  };
};

const config = getSupabaseConfig();

export const supabase = (config.url && config.key)
  ? createClient(config.url, config.key)
  : null;

export const getStoredConfig = () => config;

export const saveSupabaseConfig = (url, key) => {
  localStorage.setItem('sb_supabase_url', url.trim());
  localStorage.setItem('sb_supabase_anon_key', key.trim());
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('sb_supabase_url');
  localStorage.removeItem('sb_supabase_anon_key');
};
