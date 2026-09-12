// ==============================================================================
// INICIALIZACIÓN DEL CLIENTE SUPABASE
// ==============================================================================

import { CONFIG } from './config.js';

let supabaseInstance = null;

export function isSupabaseConfigured() {
  return Boolean(
    CONFIG.SUPABASE_URL &&
    CONFIG.SUPABASE_URL.startsWith('http') &&
    CONFIG.SUPABASE_ANON_KEY &&
    CONFIG.SUPABASE_ANON_KEY.length > 20
  );
}

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  if (!isSupabaseConfigured()) {
    console.warn(
      '⚠️ Supabase no está configurado aún en src/js/config.js. La aplicación funcionará en Modo Demo con datos locales.'
    );
    return null;
  }

  // Si window.supabase está cargado por el CDN oficial
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseInstance = window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY
    );
    return supabaseInstance;
  }

  console.error('El script SDK de Supabase (@supabase/supabase-js) no está disponible en window.');
  return null;
}
