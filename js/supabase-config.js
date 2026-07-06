// js/supabase-config.js
// Lee credenciales desde window (inyectadas por Vite en el HTML)

var supabaseUrl = window.SUPABASE_URL;
var supabaseKey = window.SUPABASE_KEY;

if (!supabaseUrl || supabaseUrl.indexOf('%VITE') === 0 || !supabaseUrl.startsWith('http')) {
  console.warn('Supabase credentials not configured. Form submissions will be simulated.');
  window.__supabaseReady = false;
} else {
  try {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.__supabaseReady = true;
  } catch (e) {
    console.warn('Supabase initialization failed:', e.message);
    window.__supabaseReady = false;
  }
}
