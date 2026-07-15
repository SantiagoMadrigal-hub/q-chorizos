# Q' Chorizos — Artisan Chorizo Website

> **Production-ready multi-page site** built with Vite + Vanilla JS, deployed on Vercel with CI/CD. Demonstrates modern frontend architecture, performance optimization, accessibility, and backend integration patterns.

**Live:** https://q-chorizos.vercel.app  
**Form Demo:** https://q-chorizos.vercel.app/html-css/formulario/formulario.html

---

## 🏗️ Architecture Highlights

| Area | Implementation |
|------|----------------|
| **Build** | Vite 5 multi-entry (3 HTML entry points) |
| **Styling** | CSS Custom Properties, mobile-first, BEM-ish, Bootstrap 5 utilities only |
| **JS** | ES Modules, zero framework, ~3KB gzipped main bundle |
| **Backend** | Supabase (PostgreSQL + RLS + RPC functions) |
| **Deploy** | Vercel + GitHub Actions CI (lint → test → build) |
| **Images** | Sharp + `vite-plugin-image-optimizer` → WebP/AVIF/PNG/SVG (58% savings, ~18MB) |
| **Performance** | LCP preload, defer scripts, cache headers, Brotli/Gzip via Vercel Edge |

---

## 📁 Project Structure

```
q-chorizos/
├── index.html                              # Redirects to main SPA
├── public/                                 # Static assets (copied to dist/)
│   ├── fotos-proyectos/                    # Product & lifestyle images
│   ├── robots.txt
│   └── sitemap.xml
├── html-css/
│   ├── contenido basico de la pagina/      # Main landing page (entry: index.html)
│   │   ├── index.html
│   │   ├── *.css (modular: variables, global, componentes, responsive, print, etc.)
│   │   ├── carousel.js
│   │   ├── modal.js
│   │   ├── modal-producto.js
│   │   └── scroll-animations.js
│   └── formulario/                         # Order form (entry: formulario.html)
│       ├── formulario.html
│       ├── estilos-base.css
│       └── estilos-interaccion.css
├── js/                                     # Shared modules
│   ├── form-submission.js                  # Form validation + Supabase insert + mock payment
│   ├── form-ui.js                          # Quantity controls, dynamic price, char count
│   ├── navbar.js                           # Mobile menu, scroll spy, smooth scroll
│   ├── supabase-config.js                  # Client init, RPC wrappers
│   └── __tests__/products.test.js          # Vitest + jsdom (15 tests)
├── terminos.html                           # Static legal pages
├── privacidad.html
├── vite.config.js                          # Multi-entry, image optimizer, compression (dev only)
├── vercel.json                             # SPA rewrites, cache headers, env mapping
├── .github/workflows/ci.yml                # Lint → Test → Build
└── package.json
```

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/SantiagoMadrigal-hub/q-chorizos.git
cd q-chorizos

# 2. Install
npm ci

# 3. Env vars (copy .env.example → .env)
cp .env.example .env
# Add your Supabase URL + anon key

# 4. Dev server (port 3000)
npm run dev

# 5. Production build
npm run build        # → dist/
npm run preview      # preview dist/
```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (HMR) |
| `npm run build` | Production build (minified, hashed, images optimized) |
| `npm run preview` | Preview `dist/` locally |
| `npm run lint` | ESLint (JS + HTML inline scripts) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier check |
| `npm run format:fix` | Prettier write |
| `npm run test` | Vitest run (jsdom) |
| `npm run test:watch` | Vitest watch mode |
| `npm run analyze` | Rollup visualizer bundle report |

---

## 🔧 Tech Stack Deep Dive

### Vite Multi-Entry Config
```js
// vite.config.js
rollupOptions: {
  input: {
    root: resolve(__dirname, 'index.html'),
    main: resolve(__dirname, 'html-css/contenido basico de la pagina/index.html'),
    formulario: resolve(__dirname, 'html-css/formulario/formulario.html')
  }
}
```
- 3 independent HTML pages, each with own CSS/JS chunks
- Shared vendor chunk (`node_modules` → `vendor.[hash].js`)
- Compression (Brotli/Gzip) **disabled in production** — Vercel handles it at Edge

### Image Optimization (Build-time)
```js
// vite.config.js
ViteImageOptimizer({
  png: { quality: 80 },
  jpeg: { quality: 75 },
  webp: { quality: 75 },
  avif: { quality: 65 },
  svg: { multipass: true },
  cache: true
})
```
**Result:** 31.9 MB → 13.5 MB (58% reduction)  
PNG/JPG → WebP/AVIF auto-generated, cached in `node_modules/.cache/`

### Supabase Integration (Serverless Postgres)
```js
// js/supabase-config.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// RPC functions (SECURITY DEFINER, bypass RLS for inserts)
await supabase.rpc('insertar_pedido', { p_nombre_completo: ..., p_producto: ... });
await supabase.rpc('insertar_feedback', { p_calificacion: 5, p_comentario: '...' });
```
- **RLS enabled** on `Pedidos` table
- **Two INSERT policies** for `anon` role (no auth required)
- **No secrets in frontend** — only `anon` key (safe for public)

### Performance Optimizations
| Technique | Implementation |
|-----------|----------------|
| LCP Preload | `<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">` |
| Defer JS | Bootstrap + custom scripts with `defer` / `type="module"` |
| Critical CSS | Inlined above-the-fold styles (manual, ~3KB) |
| Cache Headers | `vercel.json` → `assets/*`, `fotos-proyectos/*` → `max-age=31536000, immutable` |
| Compression | Vercel Edge (Brotli + Gzip) — no build plugin needed |

### Accessibility (WCAG 2.1 AA)
- Semantic HTML5 (`header`, `main`, `section`, `footer`, `nav`, `article`)
- Heading hierarchy: `h1` → `h2` → `h3` (no skips)
- Skip link: `<a href="#contenido-principal" class="skip-to-content">`
- ARIA: `aria-label`, `aria-expanded`, `aria-controls`, `aria-live`, `role="dialog"` (modals)
- Focus management: modal trap, restore focus on close, visible `:focus-visible`
- Reduced motion: `@media (prefers-reduced-motion: reduce)`
- High contrast: `@media (forced-colors: active)`
- Color contrast ratios ≥ 4.5:1

### SEO & Structured Data
- **Canonical URLs** pointing to `q-chorizos.vercel.app`
- **Sitemap.xml** + **robots.txt** (auto-copied to `dist/`)
- **Open Graph** + **Twitter Cards** on every page
- **JSON-LD**: `FoodEstablishment`, `BreadcrumbList`, `FAQPage`
- **Meta robots**: `index, follow` on all pages

---

## 🧪 Demo: Mock Payment Flow

> **No real payment gateway** — demonstrates integration pattern for Wompi / MercadoPago.

```js
// js/form-submission.js
async function mockPayment(order) {
  await new Promise(r => setTimeout(r, 1200)); // simulate network
  return {
    id: 'pay_mock_' + Date.now(),
    status: 'approved',
    metodo: order.metodo_pago,
    monto: order.precio_unitario * order.cantidad,
    reference: 'ORD-' + Date.now().toString(36).toUpperCase()
  };
}
```

**User flow:**
1. Fill form → "Confirmar pedido"
2. Loading spinner on button
3. Supabase inserts order (`insertar_pedido` RPC)
4. `mockPayment()` resolves → green toast appears:
   ```
   ✅ Pago simulado aprobado
   En producción: Nequi/Daviplata → Wompi / MercadoPago
   Ref: ORD-A1B2C3 · $25.800
   ```
5. Confirmation screen + rating modal (1-5 stars + comment)

**To integrate real gateway:** replace `mockPayment()` with:
```js
const res = await fetch('/api/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order)
});
const payment = await res.json();
// redirect to payment.url or render widget
```

---

## 📦 Deploy Your Own

### 1. Vercel (Recommended)
```bash
# Push to GitHub → Import in Vercel
# Framework: Vite (auto-detected)
# Build: npm run build
# Output: dist
```

### 2. Environment Variables (Vercel Dashboard → Settings → Env Vars)
| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_KEY` | `sb_publishable_...` (anon key) | Production, Preview, Development |

### 3. Supabase Setup
```sql
-- 1. Create table
create table public.pedidos (
  id bigserial primary key,
  created_at timestamptz default now(),
  nombre_completo text not null,
  telefono text not null,
  email text not null,
  direccion_entrega text not null,
  instrucciones text,
  cantidad int not null default 1,
  metodo_pago text not null,
  producto text not null,
  precio_unitario int not null
);

-- 2. Enable RLS
alter table public.pedidos enable row level security;

-- 3. INSERT policies for anon (two policies as in your setup)
create policy "Permitir insert anónimo" on public.pedidos
  for insert to anon with check (true);

create policy "Permitir insertar pedidos anonimos" on public.pedidos
  for insert to anon with check (true);

-- 4. RPC function (SECURITY DEFINER)
create or replace function public.insertar_pedido(
  p_nombre_completo text, p_telefono text, p_email text,
  p_direccion_entrega text, p_instrucciones text,
  p_cantidad int, p_metodo_pago text, p_producto text, p_precio_unitario int
) returns json language plpgsql security definer as $$
begin
  insert into public.pedidos (nombre_completo, telefono, email, direccion_entrega,
                              instrucciones, cantidad, metodo_pago, producto, precio_unitario)
  values (p_nombre_completo, p_telefono, p_email, p_direccion_entrega,
          p_instrucciones, p_cantidad, p_metodo_pago, p_producto, p_precio_unitario)
  returning id, created_at;
end;
$$;

grant execute on function public.insertar_pedido(...) to anon;
```

---

## 📊 Lighthouse Scores (Target)

| Category | Mobile | Desktop |
|----------|--------|---------|
| **Performance** | ≥ 90 | ≥ 95 |
| **Accessibility** | 100 | 100 |
| **Best Practices** | ≥ 95 | ≥ 95 |
| **SEO** | 100 | 100 |

*Run: Chrome DevTools → Lighthouse → Mobile/Desktop → "Analyze page load"*

---

## 🎯 Portfolio Talking Points

| Topic | What to Say |
|-------|-------------|
| **Multi-entry Vite** | "Configured 3 HTML entry points with shared vendor chunk — each page loads only its CSS/JS" |
| **Image pipeline** | "Sharp + Vite plugin generates WebP/AVIF at build time, 58% savings, cached" |
| **Supabase + RLS** | "Postgres with Row Level Security, RPC functions bypass RLS safely for public inserts" |
| **No-framework JS** | "ES Modules, ~3KB gzipped main bundle, Bootstrap only for utilities/modal/carousel" |
| **CI/CD** | "GitHub Actions runs lint → test → build on every PR; Vercel auto-deploys main" |
| **Performance** | "LCP preload, defer scripts, critical CSS inline, immutable cache headers via vercel.json" |
| **Accessibility** | "WCAG 2.1 AA: heading order, ARIA, focus trap, skip link, reduced motion, forced colors" |
| **Mock payment** | "Simulates gateway latency/response; swap function for real Wompi/MercadoPago integration" |

---

## 📄 License

MIT — free to use, modify, showcase.

---

## 👤 Author

**Santiago Madrigal**  
Frontend Developer — Vanilla JS, Vite, Supabase, Performance, Accessibility  
[GitHub](https://github.com/SantiagoMadrigal-hub) · [LinkedIn](https://linkedin.com/in/santiago-madrigal)

---

> Built as a portfolio piece demonstrating production-grade frontend engineering without framework overhead.