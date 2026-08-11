# Contexto del proyecto: Hippie & Chic — Catálogo online

## Qué es
Catálogo de ropa boho-chic (boutique en Córdoba, Argentina, @by_hippiechic).
Las clientas eligen productos, arman un carrito, y al confirmar se las
redirige a WhatsApp con un mensaje armado del pedido. La dueña confirma
manualmente el pedido por WhatsApp — NO hay pago online en el sitio.

## Stack
- Next.js (App Router, JavaScript — NO TypeScript)
- Tailwind CSS
- Supabase (Postgres + Auth + Storage), plan free
- Vercel para deploy

## Estructura de carpetas
- app/(shop)/     → páginas públicas (home, categoría, producto, carrito)
- app/admin/      → panel de administración (solo la dueña)
- app/api/        → API routes
- lib/supabase/   → clientes de Supabase (client.js = browser, server.js = server components)
- components/     → componentes reutilizables
- components/ui/  → componentes de UI genéricos

## Convenciones de código
- Server Components por defecto; "use client" solo cuando haga falta interactividad
- Sin TypeScript, JavaScript plano
- Talles y colores de producto son texto libre (no ENUM), viven en la tabla product_variants
- unit_price en order_items siempre guarda el precio al momento de la compra, no el actual

## Reglas de negocio importantes
- No hay auth de clientas, solo la dueña tiene login (admin)
- El carrito es estado local (no persiste en Supabase)
- Las orders SÍ se guardan en Supabase aunque la confirmación final sea por WhatsApp
- is_published en products permite ocultar sin borrar

## Cómo trabajamos
- Fases incrementales, una por vez, con stopping points explícitos
- Cada fase termina actualizando PROGRESS.md y haciendo commit + push
- Ver PROGRESS.md para el historial detallado de qué se hizo en cada fase
