# Historial de avance — Hippie & Chic

## Fase 0 — Setup inicial
- Proyecto Next.js creado (App Router, JS, Tailwind)
- Clientes de Supabase creados en lib/supabase/ (browser y server, con @supabase/ssr)
- Estructura de carpetas base armada
- Movido a repo propio (estaba anidado en otro repo por error, corregido)
- Pendiente: aún no se creó el proyecto real en Supabase

## Fase 2 — Base de datos en Supabase
- Proyecto de Supabase linkeado (CLI autenticado con supabase login)
- Migración 00001_initial_schema.sql aplicada con éxito
- Tablas creadas: categories, products, product_images, product_variants, orders, order_items
- RLS habilitada en las 6 tablas: lectura pública en catálogo (categories, products, product_images, product_variants), insert público en orders/order_items, resto sin política = bloqueado por defecto
- El admin va a operar con la service_role/secret key (bypassea RLS) desde server actions o API routes, todavía no implementado
- Verificado con: npx supabase migration list (local y remoto alineados). npx supabase db diff no está disponible en este entorno por falta de Docker Desktop.
- Nota: usar `npx supabase migration new nombre_descriptivo` para generar migraciones futuras (timestamp automático), evitando el flag --include-all.

## Fase 3 — Páginas públicas: Home y listado por categoría
- Tipografías configuradas: Cormorant Garamond (display), Work Sans (body), Caveat (accent)
- Tokens de color en Tailwind: sand, ink, caramel, rose, card
- Componentes creados: Header, Footer, CategoryCard, ProductCard, Arrow (elemento de marca reutilizable)
- Home: hero con mosaico de imágenes (placeholders) + grilla de categorías desde Supabase
- Página de categoría dinámica: app/(shop)/categoria/[slug]/page.js, con notFound() si el slug no existe
- Pendiente: página de producto individual (Fase 4), fotos reales (se cargan desde el admin en fases posteriores)

### Notas técnicas de la Fase 3
- Tailwind v4: los tokens van con `@theme` en app/globals.css (no hay tailwind.config.js)
- next/font expone las variables como `--font-cormorant` / `--font-work-sans` / `--font-caveat`, y `@theme inline` las mapea a las utilidades `font-display` / `font-body` / `font-accent`. Los nombres se mantienen distintos a propósito: si la variable de next/font y el token de Tailwind se llaman igual, la referencia queda circular.
- Next 16: `params` es una promesa, hay que `await params` en las rutas dinámicas
- Next 16 ya no sobrescribe `scroll-behavior` al navegar: el `<html>` lleva `scroll-smooth` + `data-scroll-behavior="smooth"`
- next.config.mjs: `images.remotePatterns` habilita placehold.co y **.supabase.co para next/image
- products todavía no tiene columna slug: ProductCard linkea usando el id como fallback
- La imagen de cada producto se resuelve con un solo query a product_images usando `.in()`, no uno por producto
- app/page.js (boilerplate) se eliminó porque colisionaba con app/(shop)/page.js en la ruta /

## Fase 3.5 — Ajuste de schema: imagen de categoría y slug de producto
- categories: agregada columna image_url (nullable, se completa desde el admin en fase futura)
- products: agregada columna slug (not null, unique), generada automáticamente a partir del name para los productos existentes via extension unaccent
- Actualizados los queries de home y categoría para usar estos campos
- Pendiente: cuando se construya el admin de creación de productos (fase de CRUD), generar el slug automáticamente en el server action al guardar, no depender de que se cargue a mano

## Fase 4 — Página de producto individual
- Componentes nuevos: ProductGallery (client, con miniaturas), ProductVariantSelector (client, pills de talle/color con validación de stock), Breadcrumb (reutiliza Arrow)
- Página app/(shop)/producto/[slug]/page.js con notFound() si no existe o no está publicado
- Botón "Agregar al carrito" visual y funcional en UI, sin lógica de estado todavía (Fase 5 lo conecta)
- Selector maneja los 3 casos: solo talle, solo color/sin variantes, ambos

### Notas técnicas de la Fase 4
- onVariantChange en ProductVariantSelector es una prop OPCIONAL: la página es un Server Component y React no permite pasar funciones a Client Components. Queda lista para cuando un padre client la use en Fase 5.
- Los datos seed solo ejercitan 2 de los 3 casos del selector: todas las variantes tienen color null y stock > 0. Las pills de color y el estado "sin stock" están implementados pero sin datos que los prueben.
- Todos los productos tienen exactamente 1 imagen, así que la fila de miniaturas todavía no se ve (aparece a partir de 2).
