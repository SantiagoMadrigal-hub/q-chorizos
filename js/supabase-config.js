// js/supabase-config.js
// Lee credenciales desde window (inyectadas por Vite en el HTML)

window.supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);
