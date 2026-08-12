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

## Fase 5 — Carrito de compras
- Store de Zustand en lib/store/cartStore.js con persist middleware (localStorage, key: hippiechic-cart)
- Acciones: addItem (suma cantidad si ya existe la variante), removeItem, updateQuantity, clearCart
- ProductVariantSelector conectado: agrega al carrito con la variante seleccionada + cantidad elegida
- CartLink en el Header: contador de items, con guard de hidratación (mounted state) para evitar mismatch SSR/cliente
- Página /carrito: lista editable (cantidad, eliminar), total calculado, botón "Hacer pedido" sin lógica todavía
- Pendiente: Fase 6 conecta "Hacer pedido" con armado de mensaje de WhatsApp + guardado de la orden en Supabase

### Notas técnicas de la Fase 5
- QuantityStepper (components/ui/) se comparte entre la página de producto y el carrito. En producto min=1; en el carrito min=0, así restar desde 1 elimina la línea (usa el comportamiento documentado de updateQuantity).
- Verificado en el navegador: no aparece ningún warning de hidratación al recargar /carrito con items persistidos.

### BUG de imágenes (viene de la Fase 3, no del carrito) — parcialmente resuelto
- Síntoma: las imágenes devuelven 400 del optimizador: `"url" parameter is valid but image type is not allowed`
- Causa: placehold.co sirve SVG por defecto, y Next bloquea SVG en next/image (dangerouslyAllowSVG es false por defecto). No es un problema de remotePatterns: la URL pasa la validación de host.
- Fix: agregar `.png` a las URLs de placeholder.
- RESUELTO en HERO_IMAGES (app/(shop)/page.js): verificado 200 / image/png en w=640, 750 y 1080.
- PENDIENTE en las filas de product_images de la base (datos seed): las fotos de producto siguen dando 400 en home, categoría, producto y carrito. Se resuelve con un UPDATE sobre image_url, o solo cuando se carguen las fotos reales desde Supabase Storage (que ya vienen en JPG/PNG y no tienen este problema).

## Fase 6 — Checkout: WhatsApp + guardado de orden
- Server Action createOrder en lib/actions/orders.js: valida, calcula total, inserta orders + order_items, hace rollback manual si falla el segundo insert
- lib/whatsapp.js: buildOrderMessage (arma texto del pedido) y buildWhatsAppUrl (arma el link wa.me)
- Formulario de nombre (obligatorio) y teléfono (opcional) en /carrito
- Flujo completo: confirmar → guardar en Supabase → limpiar carrito → redirigir a WhatsApp
- Pendiente: cargar NEXT_PUBLIC_WHATSAPP_NUMBER real en .env.local (no versionado)
- Con esto se cierra el flujo completo de compra del lado de la clienta. Lo que falta a partir de acá es el panel admin (Fases 7+)

### Notas técnicas de la Fase 6
- IMPORTANTE — createOrder usa un cliente service_role (lib/supabase/admin.js), NO el cliente anon de lib/supabase/server.js. Motivo verificado contra la base: orders y order_items solo tienen política de INSERT para anon. Sin política de SELECT, `insert().select("id")` falla con "new row violates row-level security policy" y no se puede recuperar el id de la orden; sin política de DELETE, el rollback borraría 0 filas en silencio. Con service_role ambas cosas funcionan, y orders sigue sin ser legible públicamente (que es lo que se quiere: son datos de clientas).
- lib/supabase/admin.js no debe importarse nunca desde un componente cliente. Verificado tras el build que ni "sb_secret" ni "SERVICE_ROLE" aparecen en .next/static/.
- buildWhatsAppUrl devuelve null si falta NEXT_PUBLIC_WHATSAPP_NUMBER, para no redirigir a wa.me/undefined. En ese caso el pedido igual queda guardado y el carrito se vacía; el mensaje de error se muestra en la rama de carrito vacío (es donde queda la clienta después de confirmar).

## Fase 7 — Login del panel admin
- Supabase Auth (email/password) para autenticación, usuario creado manualmente en el dashboard (no hay registro público)
- proxy.js protege todas las rutas /admin/*, redirige a /admin/login si no hay sesión
- app/admin/login/page.js: formulario de login con signInWithPassword
- app/admin/(protected)/layout.js: shell del admin con nav (links a Categorías/Productos/Pedidos, todavía no construidos) y logout
- Pendiente: CRUD de categorías (Fase 8), productos (Fase 9), gestión de pedidos (Fase 10)

### Notas técnicas de la Fase 7
- El archivo NO se llama middleware.js: en Next 16 esa convención está deprecada y se renombró a proxy.js, con la función exportada como `proxy`. El build lo lista como "ƒ Proxy (Middleware)". Ojo: el runtime edge no está soportado en proxy (siempre corre en nodejs).
- Shell del admin resuelto con route group app/admin/(protected)/, no leyendo el pathname con headers(). El grupo no aparece en la URL, así que (protected)/page.js sigue sirviendo /admin, y /admin/login queda fuera del grupo y por lo tanto sin shell. Evita el hack de pasar el pathname por un header custom desde el proxy.
- El matcher "/admin/:path*" cubre también /admin exacto (verificado: /admin, /admin/productos y /admin/pedidos/123 redirigen los tres).
- Tanto el login como el logout llaman router.refresh() después del push: sin eso el proxy sigue evaluando las cookies viejas.
