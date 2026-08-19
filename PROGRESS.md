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

### BUG de imágenes (viene de la Fase 3, no del carrito) — RESUELTO
- Síntoma: las imágenes devolvían 400 del optimizador: `"url" parameter is valid but image type is not allowed`
- Causa: placehold.co sirve SVG por defecto, y Next bloquea SVG en next/image (dangerouslyAllowSVG es false por defecto). No era un problema de remotePatterns: la URL pasaba la validación de host.
- Fix: agregar `.png` a las URLs de placeholder.
- Resuelto en HERO_IMAGES (app/(shop)/page.js) y en las filas de product_images de la base (datos seed). Verificado 200 / image/png contra el optimizador en ambos casos.

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

## Fase 8 — CRUD de categorías (admin)
- Bucket de Storage 'catalog-images' creado (público para lectura, solo authenticated puede escribir/borrar)
- lib/slug.js: generación de slugs en JS, reutilizable para productos en Fase 9
- lib/actions/categories.js: createCategory, updateCategory, deleteCategory (con manejo de FK violation), toggleCategoryVisibility, moveCategory
- ImageUploadField.jsx: componente reutilizable de subida con preview, pensado también para Fase 9
- Páginas: listado con reordenar/ocultar/eliminar, crear, editar
- Patrón establecido: querys de lectura del admin usan el cliente admin (bypassea RLS) para poder ver/editar contenido oculto, no el cliente server normal

### Notas técnicas de la Fase 8
- Las páginas del admin que leen datos llevan `export const dynamic = "force-dynamic"`. El cliente admin no toca cookies, así que sin eso Next las prerenderiza en build time y el listado queda congelado.
- La subida corre server-side con service_role, que bypassea también la RLS de storage. Las policies de la migración no se ejercitan hoy: quedan como defensa por si en el futuro se sube desde el browser con la sesión del admin.
- slugify usa \p{Diacritic} sobre el string normalizado en NFD. Las marcas se sacan ANTES del filtro [^a-z0-9], porque si no cada acento se convertiría en guión ("cámara" -> "ca-mara").
- En edición se usa updateCategory.bind(null, id) del lado servidor, así CategoryForm siempre invoca action(formData) sin conocer el id.
- moveCategory depende de que los display_order sean distintos entre sí. Hoy son 1,2,3. Si en algún momento quedan valores repetidos (por ejemplo varias filas en 0), el swap no tiene efecto visible.
- Borrar una categoría NO borra su imagen del bucket: queda huérfana en Storage. No es urgente (el bucket es chico) pero conviene limpiarlo en alguna fase futura.

## Fase 9 — CRUD de productos (admin)
- lib/actions/products.js: createProduct, updateProduct (con reconciliación de variantes: update/insert/soft-delete a stock=0 si la variante ya tiene pedidos), deleteProduct (bloqueado por FK si hay pedidos), toggleProductPublished
- VariantManager: componente controlado para agregar/quitar filas de talle/color/stock
- ProductImagesManager: componente controlado para múltiples imágenes con reordenar y borrar
- ProductForm: junta todo, mismo patrón de FormData manual que CategoryForm
- Páginas: listado, crear, editar
- Con esto se completa el admin funcional: categorías + productos + login. Falta la Fase 10 (gestión de pedidos) para cerrar el ciclo completo

### Notas técnicas de la Fase 9
- Reconciliación de variantes en updateProduct: los DELETE se hacen UNO POR UNO, no en lote. Un delete en lote falla entero si una sola variante está referenciada por un pedido, y se perderían los borrados del resto. Cada delete individual atrapa el código 23503 y, en ese caso, hace UPDATE stock = 0 en vez de borrar.
- Verificado contra la base que el borrado de una variante con order_items devuelve exactamente 23503 (order_items_product_variant_id_fkey), que es lo que el catch busca.
- deleteProduct borra los archivos de Storage DESPUÉS de que el delete del producto salió bien, no antes. Si se borraran primero y el delete fallara por FK (producto con pedidos), quedaría un producto vivo sin fotos: pérdida de datos irreversible. Las rutas se leen antes del delete porque product_images cae por cascade.
- createProduct hace rollback del producto si falla la subida de imágenes o el insert de variantes, para no dejar productos a medio crear (mismo criterio que el rollback de orders en Fase 6).
- El input file de ProductImagesManager NO tiene atributo name: los File se appendean a mano desde el estado. Si tuviera name, el form mandaría también los archivos que el usuario ya sacó del preview.
- LIMITACIÓN CONOCIDA: product_variants tiene unique (product_id, size, color). Si una variante quedó en stock 0 por el soft-delete y después se agrega otra con el mismo talle/color, el insert choca contra ese unique y la operación falla con el mensaje genérico. Lo mismo si se cargan dos filas idénticas en el mismo formulario.
- Deuda menor: buildUniqueSlug está duplicado en categories.js y products.js (cada uno consulta su propia tabla). Conviene extraerlo a un módulo plano — no puede vivir en un archivo "use server", porque ahí todos los exports tienen que ser funciones async.

## Fase 9.5 — Selector guiado de talles y colores
- lib/colorPalette.js: paleta de 11 colores con hex, compartida entre admin y catálogo público
- lib/sizePresets.js: presets de talles (letra, numérico) + detección de compatibilidad + generador de matriz
- SizeTypeSelector + ColorGridPicker: selección guiada por pills/swatches en vez de texto libre
- VariantMatrixBuilder: wrapper con modo guiado (default) y modo manual (VariantManager original, sin cambios) como escape hatch
- ProductVariantSelector del catálogo público ahora muestra un swatch de color cuando el nombre coincide con la paleta
- Sin cambios en lib/actions/products.js — el formato de variants_json es idéntico, esto fue una mejora exclusivamente de interfaz
- Decisión de diseño: se mantiene el schema flexible (size/color como texto libre en la base), la guía es solo a nivel UI — consistente con la decisión original del proyecto de no usar ENUMs rígidos

### Notas técnicas de la Fase 9.5
- La detección de compatibilidad corre UNA sola vez al montar (useState con initializer), no en cada render: si no, cada tecleo de stock recalcularía el modo.
- detectMatrixMode rechaza los casos donde algunas filas tienen talle y otras no (o algunas color y otras no): la grilla es siempre un producto cartesiano completo y no puede representar esa mezcla.
- generateVariantMatrix conserva id y stock de las combinaciones que ya existían. Verificado contra los datos reales: al regenerar, las 6 filas de "Vestido gasa floral" mantuvieron sus ids y sus stocks (4/4/4/4/4/0).
- Pasar de manual a guiado con datos incompatibles NO borra nada: solo muestra una advertencia. Las variantes se reemplazan recién cuando se elige un talle o color en la grilla.
- Estado del catálogo al momento de esta fase: en modo GUIADO quedan Blazer camel, Blusa seda negra, Cartera cruzada cuero, Pantalón palazzo terracota y Vestido gasa floral. En MANUAL quedan aestetic, todo menos media y Vestido, los tres por datos de prueba con talles tipo "sdij, dsiad, dsn" o "S, M, L, K" en un solo campo.
- .claude/launch.json tiene autoPort: true porque Next 16 se niega a levantar un segundo dev server sobre el mismo directorio y el puerto 3000 queda tomado por procesos huérfanos.

## Fase 10 — Gestión de pedidos (admin)
- lib/actions/orders.js: agregada updateOrderStatus, con ajuste de stock según la transición (descuenta al confirmar, devuelve si se revierte una confirmación, sin tocar stock en pendiente→rechazado)
- Badge de pedidos pendientes en el nav del admin
- Listado de pedidos con filtro por estado (tabs)
- Detalle de pedido: items, totales, acciones de confirmar/rechazar/revertir, link directo a WhatsApp de la clienta si dejó teléfono
- Con esto se completa el ciclo funcional completo: catálogo público → carrito → WhatsApp + orden guardada → admin puede ver, confirmar/rechazar, y el stock se ajusta solo
- Pendiente (fuera del alcance de este roadmap original): pulido visual final y deploy a Vercel

### Notas técnicas de la Fase 10
- El ajuste de stock se calcula en JS (leer stock actual -> Math.max(stock - qty, 0) o stock + qty -> update), no con una expresión SQL tipo greatest(): el cliente JS de Supabase no permite expresiones crudas en update.
- Antes de tocar la base se agrupan las cantidades por product_variant_id. Si una misma variante apareciera en dos líneas del pedido, dos updates seguidos se pisarían entre sí y solo se aplicaría el último.
- Los updates de stock son best-effort: un fallo puntual se loguea y sigue, para que el estado del pedido igual quede como decidió la dueña.
- Verificado end-to-end contra la Server Action real (arnés temporal, borrado después): confirmar descuenta (3->1), revertir devuelve (1->3), pendiente→rechazado no toca nada (3->3), y confirmar una cantidad mayor al stock lo deja en 0 sin pasar a negativo. La base quedó en 0 órdenes y stock total 81, idéntico al estado previo.
- El layout del admin lleva force-dynamic porque hace la query del contador de pendientes; sin eso el badge queda congelado en el valor del build.
- OJO al testear Server Actions: revalidatePath NO se puede llamar durante el render de un Server Component ("used revalidatePath during render which is unsupported"). Un arnés de prueba tiene que ser un Route Handler, no una page. Y como revalidatePath está al final de la función, las llamadas que fallan por esto igual ya escribieron en la base.
- Las carpetas de app/ que empiezan con "_" son private folders y no generan ruta: no sirven para arneses temporales.

## Fase 11 — Pulido visual: logo real, menos flechas, sección "Quiénes somos", CTA de WhatsApp
- Header usa el logo real (public/hippiechic-logo.png) en vez del wordmark tipográfico
- Breadcrumb usa "/" en vez del componente Arrow como separador
- Nuevo componente Eyebrow (texto manuscrito Caveat, usado como etiqueta arriba de títulos de sección)
- Nueva AboutSection en el home, entre hero y categorías, con copy placeholder pendiente de revisión con la dueña
- Hero reducido en altura, con fotos reales (public/hero-*.jpg) en vez de placeholders
- Footer con CTA "Para consultas" + botón de WhatsApp (mensaje genérico, reutiliza lib/whatsapp.js)
- Pendiente: confirmar con la dueña el texto final de la sección "Quiénes somos" (años del negocio, tono de la bio)

### Notas técnicas de la Fase 11
- Los nombres de archivo reales difieren de los que asumía el plan: el logo es hippiechic-logo.png (no logo.png) y las fotos del hero están en la raíz de public/ (no en public/hero/). Se referencian con sus nombres reales, sin renombrar.
- public/about.jpg.jpg tenía la extensión duplicada (error de guardado) y se renombró a about.jpg. Si se vuelve a subir desde el explorador de Windows, ojo con eso.
- Esta versión de lucide-react NO exporta iconos de marca: el import de Instagram rompe el build. Se usa Users para "seguidoras". Verificado que sí existen Users, Truck, Calendar, MessageCircle, AtSign, Camera, Heart y Star.
- El logo se renderiza con width/height reales (431x499) para que Next calcule el aspect ratio, y el tamaño visible lo fijan las clases (h-13 / sm:h-16 con w-auto). Verificado que sale 64x55, sin deformarse.
- El hero pasó de aspect-ratio a alto fijo (52vh mobile / 65vh desktop) y en mobile muestra 2 fotos en grid-cols-2, porque antes la tercera quedaba oculta dejando una columna vacía.
- Eyebrow usa caramel también sobre el fondo ink del footer: da 5.26:1 de contraste, así que pasa AA y no hizo falta una variante clara.
- El botón de WhatsApp del footer no se renderiza si falta NEXT_PUBLIC_WHATSAPP_NUMBER, para no linkear a wa.me/undefined.

## Fase 11.5 — Logo tipográfico real, categorías compactas, breadcrumb unificado, hero carrusel
- Logo del header: texto real con fuente Permanent Marker (no imagen), evita el problema de baja resolución de la Fase 11
- Grilla de categorías: 2 columnas en mobile (antes 1), cards más compactas
- Eliminadas las flechas de texto sueltas en "Categorías" y "Ver catálogo"
- Breadcrumb de categoría finalmente migrado a components/Breadcrumb.jsx (deuda pendiente desde la Fase 4)
- HeroCarousel: carrusel automático con puntitos, pausa al hover, reemplaza el mosaico estático de 3 fotos fijas
- Más espacio entre hero y "Quiénes somos"
- Pendiente: sumar más fotos al array de HERO_IMAGES cuando la dueña las confirme (hoy son 3, el carrusel soporta más sin cambios de código)

### Notas técnicas de la Fase 11.5
- La variable de next/font para Permanent Marker se llama --font-permanent-marker, NO --font-marker: el token de Tailwind ya se llama --font-marker, y si compartieran nombre la referencia en globals.css quedaría circular. Mismo criterio que las otras tres fuentes.
- BUG encontrado y corregido en HeroCarousel: pausa por hover y pausa por click en un puntito compartían un solo booleano isPaused. Si el timer de "retomar tras click" (6s) vencía mientras el mouse seguía encima, forzaba isPaused(false) e ignoraba el hover en curso; y al revés, sacar el mouse cancelaba de golpe la gracia post-click. Se separó en isHovering + isClickPaused, con isPaused derivado como el OR de ambos.
- Verificación del hover: dispatchEvent con MouseEvent('mouseover'/'mouseenter') sintético NO dispara el handler de React 19 de forma confiable en este entorno de pruebas. La verificación real se hizo invocando directamente props.onMouseEnter/onMouseLeave leídos del fiber de React (element[key que empieza con __reactProps$]), que sí ejercita la lógica real del componente sin la ambigüedad del sistema de eventos sintéticos.
- grep confirmó cero apariciones de "→" como texto literal en app/ y components/, y que el componente Arrow (components/ui/Arrow.jsx) solo se usa en Header.jsx. Los otros matches de "Arrow" en el proyecto son ArrowUp/ArrowDown de lucide-react (iconos de reordenar en el admin), un componente distinto.
- Tanto categoria/[slug]/page.js como producto/[slug]/page.js importan components/Breadcrumb.jsx: no queda ninguna implementación de breadcrumb armada a mano.

## Fase 11.6 — Hero rehecho como marquee deslizante
- HeroCarousel reescrito de cero: de slideshow con dots/fade (JS + estado) a marquee CSS puro (sin JavaScript, sin estado, sin los bugs de timers de la versión anterior)
- Texto/CTA del hero separados en su propio bloque arriba, ya no superpuestos sobre las fotos
- Tira de fotos full-bleed (borde a borde de la pantalla), sin gap entre imágenes, sin bordes redondeados
- Desktop: 3 fotos visibles simultáneamente. Mobile: 1 foto + adelanto de la siguiente
- Loop infinito vía animación CSS (translateX sobre contenido duplicado), pausa al hover

### Notas técnicas de la Fase 11.6
- El track necesita width:max-content (clase w-max) además de flex. Sin eso, un div flex block-level toma por defecto el ancho del contenedor padre (no el de la suma de sus hijos), así que translateX(-50%) se calcularía sobre el ancho equivocado (el del viewport, no el de la tira completa) y el loop se rompería. Verificado midiendo en el navegador: track = 2560px (exactamente 2x el ancho de 3 imágenes al 33.33vw en un viewport de ~1280px), wrapper = 1265px.
- El pause por hover quedó resuelto 100% en CSS (group-hover:[animation-play-state:paused]), sin JS. Verificado extrayendo la regla compilada real del CSS servido: `.group-hover\:[animation-play-state\:paused]:is(:where(.group):hover *) { animation-play-state: paused; }`.
- aspect-[3/4] con corchetes, no aspect-3/4: coincide con la convención ya usada en el resto del proyecto (ProductCard, CategoryCard, ProductGallery).
- Velocidad calculada a partir de los números reales: track de 2560px, se mueve -50% (1280px) en 40s = 32px/s. Cada imagen mide ~427px de ancho, así que tarda ~13.3s en pasar completa. Los 40s quedaron como estaban en el pedido original; es un solo número en animate-[marquee_40s_linear_infinite] si hay que ajustarlo.

## Fase 11.7 — Hero con embla-carousel-react, texto superpuesto de nuevo
- Se reemplazó el marquee CSS automático (Fase 11.6) por embla-carousel-react: maneja drag, touch, inercia y snap sin código propio
- Texto/CTA del hero de vuelta superpuestos sobre las fotos, con velo bg-ink/30 para legibilidad
- pointer-events-none en el overlay (excepto el botón), para no bloquear el arrastre de Embla
- Decisión: para interacciones con física real (drag + inercia + snap), se prioriza una librería chica y madura en vez de reimplementar a mano — distinto del criterio general del proyecto de evitar dependencias para lógica simple
- npm audit detectó una vulnerabilidad alta preexistente (nanoid, transitiva vía postcss de Tailwind/Next, no relacionada con Embla) y se resolvió con npm audit fix

### Notas técnicas de la Fase 11.7
- La sección del hero quedó SIN altura fija (ni h-[52vh] ni similar). Los slides de Embla definen su propia altura vía aspect-[3/4], y el overlay (absolute inset-0) toma esa altura del contenedor relative. Ponerle una altura fija que no coincida con la que da el aspect-ratio real dejaría un hueco vacío debajo de las fotos, con el texto centrado en ese hueco en vez de sobre las imágenes — es el error que casi se repite acá arrastrando el valor de la fase del marquee sin revisarlo.
- Verificación de que Embla se montó de verdad: el track (className="flex", sin ningún style en el JSX) apareció en el DOM con `style="transform: translate3d(0px, 0px, 0px);"`. Ese inline style es la firma propia del motor de Embla (lo pone él, no el componente), y confirma que se inicializó y está gestionando el track.
- Limitación de verificación: no se pudo confirmar el gesto de arrastre en sí simulando PointerEvent sintéticos (dispatchEvent con pointerdown/move/up) — Embla no reaccionó a la secuencia simulada, la misma clase de limitación de entorno que ya había aparecido antes con eventos de hover de React. No es evidencia de un bug: Embla es la implementación canónica de la librería siguiendo su patrón documentado, sin código propio de por medio que pueda interferir. Falta la prueba manual real (mouse/touch) de que el arrastre se sienta bien.
- Se eliminó el @keyframes marquee de app/globals.css (quedaba huérfano, sin nada que lo referenciara tras el cambio a Embla).

## Fase 11.8 — Layout más ancho, acento botánico, ritmo de fondo entre secciones
- Hero: vuelve a 1 foto + adelanto en mobile (w-[85vw], antes w-[46vw] mostraba 2), desktop sin cambios
- Indicador de swipe en mobile: ChevronRight con rebote horizontal, se autooculta a los 4.5s
- Contenedor principal ensanchado a max-w-7xl en las 4 páginas públicas (antes dejaba franjas vacías enormes en desktop)
- Grillas de categoría/producto suman columna xl para aprovechar pantallas anchas
- Nuevo componente BotanicalAccent (SVG de línea fina, inspirado en las flores secas de las fotos reales de la marca), usado como acento sutil en 2 lugares, sin librerías
- Fondo alternado sand/card entre secciones del home para dar ritmo visual

### Notas técnicas de la Fase 11.8
- El viewBox del BotanicalAccent es "0 -20 120 180", no "0 0 120 160": las tres puntas de arriba del tallo se dibujan en Y negativo y con el viewBox original quedaban recortadas.
- Los acentos van dentro de secciones con overflow-hidden y sangran hacia afuera con translate. Verificado que no generan scroll horizontal (document.scrollWidth === clientWidth).
- El acento del About está abajo a la izquierda, no arriba: la columna de texto es más corta que la foto, así que ese es el único rincón realmente vacío. Con la posición original (top-0) se cruzaba con el eyebrow y el título.
- Los fondos de sección son a sangre completa (section con el bg + div interno con mx-auto max-w-7xl). Si el bg fuera al mismo elemento que el max-w, el cambio de tono se cortaría en el ancho del contenedor en vez de ir borde a borde.
- El carrito se reestructuró a dos columnas en lg+ (lista + panel sticky de total/formulario). Pasarlo de max-w-3xl a max-w-7xl en una sola columna habría dejado las líneas del pedido estiradas de punta a punta, peor que antes.
- OJO al verificar en el navegador con el pane oculto: getComputedStyle devuelve valores viejos (el renderer está throttleado). El indicador de swipe parecía no ocultarse — leyendo el atributo class real se confirmó que sí. Misma trampa que ya apareció en las fases 11.5 y 9.5.
- Para chequear si un acento tapa texto NO sirve comparar getBoundingClientRect de h2/p: son elementos de bloque y su caja ocupa todo el ancho aunque los glifos estén solo a la izquierda. Hay que medir con un Range sobre el contenido (range.selectNodeContents + getBoundingClientRect).

## Fase 12 — Hero administrable + puntitos de navegación
- Tabla hero_images (lectura pública, escritura vía service_role): id, image_url, display_order
- Admin: /admin/hero con CRUD de fotos (subir, mover arriba/abajo, eliminar), agregado al nav
- Server actions en lib/actions/heroImages.js: addHeroImage, removeHeroImage, moveHeroImage — mismo patrón de swap de display_order que moveCategory
- Público: app/(shop)/page.js ya no importa un array HERO_IMAGES hardcodeado, hace query a hero_images ordenado por display_order
- Si la tabla queda vacía, la home no rompe: fondo caramel sólido con altura fija en vez de un carrusel sin fotos
- Indicador de swipe reemplazado: eran un chevron con fade automático (Fase 11.8), ahora son puntitos tipo Instagram Stories debajo del carrusel, sincronizados con Embla vía emblaApi.on('select'), con click para saltar directo a una foto (emblaApi.scrollTo)
- Se eliminó el @keyframes swipe-hint de globals.css, quedaba huérfano tras sacar el chevron

### Notas técnicas de la Fase 12
- El array HERO_IMAGES que se reemplazó tenía 7 fotos, no 3: el comentario que lo describía ("agregar más rutas cuando la dueña confirme más fotos") había quedado desactualizado desde que se sumaron hero-4 a hero-7 en una fase anterior. Se migraron las 7 a la tabla como seed de la misma migración, no solo 3.
- removeHeroImage intenta borrar también el archivo de Storage, pero solo si la URL matchea el patrón público del bucket catalog-images. Las 7 fotos originales son archivos de /public (rutas relativas tipo "/hero-1.jpg"), así que al eliminarlas de la tabla no hay nada que borrar en Storage — se ignora en silencio, no es un error.
- HeroUploadForm fuerza un remount de ImageUploadField (cambiando su key) después de subir una foto: el input file se resetea con form.reset(), pero eso no dispara el evento onChange que limpia el preview interno del componente, así que sin el remount la miniatura de la foto ya subida se quedaría pegada en la vista previa.
- Verificación: npm run build sin errores, /admin/hero confirmado que redirige a /admin/login sin sesión (probado navegando directo a la URL). El click en los puntitos se probó invocando .click() sobre los botones reales vía JS y leyendo el atributo class resultante (el mismo motivo de siempre: con el pane no compositando, tanto los clicks de mouse simulados por el tool como los screenshots hacen timeout).
- Pendiente de probar por la dueña, logueada: subir una foto nueva de verdad (upload a Storage + insert), reordenar con las flechas, y eliminar una foto (incluyendo que borre el archivo de Storage cuando corresponda). No hay credenciales de admin disponibles en este entorno para probarlo de punta a punta.

## Fase 12.5 — Auditoría de seguridad del login admin

Auditoría de 5 puntos sobre app/admin/login, proxy.js y los Server Actions de escritura, pedida explícitamente antes de tocar nada. 4 de 5 puntos ya estaban bien; se corrigió el quinto.

- **Mensaje de error del login**: ya era genérico ("Email o contraseña incorrectos") sin distinguir usuario inexistente de contraseña incorrecta. Sin cambios.
- **Service role key fuera del bundle del cliente**: confirmado por grep completo del repo — SUPABASE_SERVICE_ROLE_KEY solo vive en .env.local (sin prefijo NEXT_PUBLIC_) y en lib/supabase/admin.js; ninguno de los 21 archivos "use client" del proyecto la importa ni la referencia, directa o indirectamente. Sin cambios.
- **proxy.js cubre /admin/\***: el matcher "/admin/:path\*" protege todas las rutas y subrutas de admin sin excepciones. Sin cambios.
- **Cookies de sesión**: cero overrides manuales de httpOnly/secure/sameSite en todo el repo — se usan los defaults de @supabase/ssr tal cual. Sin cambios.
- **Server Actions de escritura sin verificación de sesión propia** (el hallazgo real): las 13 acciones de escritura sensibles dependían 100% de que el proxy hubiera bloqueado el acceso a la *página* que las invoca. Pero en Next.js App Router una Server Action es su propio endpoint, no queda atada a la ruta desde la que se la llama — el matcher de rutas del proxy no la protege si se la invoca fuera de esa ruta. Corregido: se agregó lib/session.js (requireAdminSession(), usa supabase.auth.getUser() con el cliente atado a cookies, igual que hace proxy.js) y se lo llama al principio de cada acción sensible, devolviendo { success: false, error: "No autorizado" } sin sesión válida:
  - lib/actions/categories.js: createCategory, updateCategory, deleteCategory, toggleCategoryVisibility, moveCategory
  - lib/actions/products.js: createProduct, updateProduct, deleteProduct, toggleProductPublished
  - lib/actions/heroImages.js: addHeroImage, removeHeroImage, moveHeroImage
  - lib/actions/orders.js: updateOrderStatus (createOrder queda sin chequeo a propósito — es el checkout público de la clienta, no hay auth de clientas en este proyecto)

### Notas técnicas de la Fase 12.5
- requireAdminSession() usa getUser(), no getSession(): getUser() revalida el token contra el servidor de Supabase, getSession() confía en la cookie tal cual llegó sin validarla de nuevo. Mismo criterio que ya usa proxy.js.
- Verificación: npm run build sin errores. No se probó el bypass real (armar a mano un POST con el id de una Server Action apuntando a una ruta pública) porque hubiera significado construir un exploit funcional contra el propio proyecto — el chequeo se validó por code review, comparando la lógica con la de proxy.js (ya probada en la Fase 6) y confirmando que el guard corta antes de cualquier llamada a createAdminClient() o al bucket de Storage.

## Fase 14 — Dashboard del admin con métricas reales
- Reemplazado el placeholder de bienvenida por métricas reales: pedidos pendientes, productos publicados, categorías activas, ingresos del mes
- Alerta de stock bajo (variantes con stock <= 2, máximo 8, ordenadas ascendente)
- Últimos 5 pedidos con acceso directo al detalle
- Accesos rápidos a crear categoría/producto

### Notas técnicas de la Fase 14
- Las 6 queries del dashboard van en un solo Promise.all, no en secuencia: son todas independientes entre sí (nada depende del resultado de otra), así que no hay motivo para esperarlas una por una.
- Ingresos del mes: se trajeron los totales de las orders confirmadas del mes y se sumaron a mano con reduce(), en vez de pedirle el sum() a Postgres. A propósito: numeric(10,2) puede volver de postgrest como string, y sumar con + sin pasar por Number() antes concatena en vez de sumar (0 + "15000" da "015000", no 15000). Se aplicó Number(order.total) en cada vuelta del reduce para evitarlo.
- Stock bajo hace un embed a products(name) desde product_variants: mismo caso ya documentado en el detalle de pedido (Fase 8 o donde haya quedado) de que el embed puede volver como objeto o como array de un elemento según cómo lo resuelva Supabase — se reusó el mismo helper firstOf() que ya existía ahí.
- Verificación: npm run build sin errores, /admin confirmado que redirige a /admin/login sin sesión. Como no hay credenciales de admin en este entorno para ver el dashboard renderizado con datos reales, se corrió una consulta SQL de solo lectura directa contra la base (vía el MCP de Supabase) replicando la lógica de las 6 queries del dashboard, para confirmar que devuelven números sensatos antes de darlo por terminado: 1 pedido pendiente, 27 productos publicados, 8 categorías activas, $0 de ingresos del mes (no hay pedidos confirmados todavía), 9 variantes con stock bajo (el dashboard corta en 8, como pide la spec).
- Pendiente de confirmar por la dueña, logueada: que el dashboard se vea bien de verdad en el navegador (esto no se pudo verificar visualmente, solo por datos y por build).

## Fase 14.5 — Fix: el admin se veía roto en mobile
- Header del admin (app/admin/(protected)/layout.js): la nav (Hero, Categorías, Productos, Pedidos + Cerrar sesión) no entraba en una fila en mobile y estiraba TODA la página — scroll horizontal del sitio entero, no solo del header. Ahora el `<nav>` scrollea internamente (overflow-x-auto) en vez de forzar el ancho de la página.
- Filas de /admin/productos: en mobile, el nombre del producto (el div flex-1 min-w-0) le cedía casi todo el espacio a precio + badge + "Editar" + acciones, y quedaba comprimido a ~15px de ancho — el texto se partía letra por letra en una columna vertical, prácticamente ilegible.
- Mismo problema, más leve, en /admin/categorias (el nombre quedaba en ~93px, apretado pero legible).
- Se aplicó el mismo arreglo a las dos: en mobile la fila pasa a 2 líneas (imagen+nombre arriba, precio/badge/Editar/acciones abajo con flex-wrap); en sm+ es exactamente la misma fila de una sola línea de siempre.

### Notas técnicas de la Fase 14.5
- Cómo se encontró: no fue a ojo. Se armó una ruta temporal (app/qa-mobile-admin, borrada después) que importaba las Server Components reales del admin (AdminLayout, AdminHomePage, AdminHeroPage, AdminCategoriesPage, AdminProductsPage, AdminOrdersPage) y las renderizaba fuera de /admin — como usan el cliente admin (service_role, no sesión de usuario) para leer datos, se pudieron ver renderizadas con datos reales sin necesitar login. Con eso sí se pudo medir en el navegador (document.body.scrollWidth vs clientWidth, getBoundingClientRect de cada fila) en vez de adivinar por el código. No es una técnica que quede instalada en el proyecto, fue solo para este diagnóstico puntual.
- El fix del header es "shrink-0 en cada link + overflow-x-auto en el nav": el nav ya no puede estirarse más allá de su contenedor (max-w-full), así que cuando el contenido no entra, scrollea en vez de empujar el ancho de toda la página.
- El fix de las filas usa `sm:contents` en dos wrappers: en mobile son contenedores flex reales (imagen+nombre por un lado, el resto por otro), pero en sm+ `display: contents` los hace "invisibles" para el layout y sus hijos vuelven a ser hijos directos del `<li>`, reproduciendo la fila plana de una sola línea que ya existía — verificado que a desktop las 6 piezas (imagen, nombre, precio, badge, Editar, acciones) quedan en la misma fila, mismas coordenadas Y, como antes del cambio.
- Verificación en el navegador (mobile 375px): antes del fix, document.body.scrollWidth era 426px (51px de overflow) y el nombre de producto medía ~15px de ancho; después del fix, scrollWidth quedó en 375px (sin overflow) y el nombre de producto pasó a 245px de ancho en 2 líneas limpias. A desktop, sin cambios: mismo layout medido pixel a pixel antes y después.
- npm run build sin errores. La ruta temporal de QA se borró antes de commitear, no forma parte del build final (confirmado: no aparece en la lista de rutas).

## Fase 15 — Logo real en el header, banda de marquee decorativa
- Header: el wordmark de texto (fuente Permanent Marker) + los dos Arrow ícono quedan reemplazados por el archivo real hippiechic-logo-v2.png vía next/image, h-10 en mobile / h-12 en desktop, width auto (ajustado después a h-12/h-16 — ver más abajo)
- Nuevo components/LogoMarquee.jsx: banda fondo "ink" con el logo repetido en loop horizontal continuo (CSS puro, sin JS), como separador entre el Hero y "Quiénes somos" en la home
- Limpieza: components/ui/Arrow.jsx eliminado (quedó sin ningún uso en todo el proyecto), y la fuente Permanent Marker sacada de app/layout.js y del token --font-marker en globals.css (idem, sin uso una vez sacado el wordmark)

### Notas técnicas de la Fase 15
- No existe todavía una versión del logo en tono "sand" para que se lea sobre el fondo oscuro de la banda — se usó el filtro CSS `brightness(0) invert(1)` sobre el mismo PNG (ink sobre transparente): brightness(0) lo vuelve negro puro pisando el color original, invert(1) lo pasa a blanco. Si en algún momento se suma un archivo aparte en "sand", este filtro se puede sacar.
- Bug real encontrado y corregido antes de dar esto por terminado: el mecanismo de loop (duplicar el contenido una vez y animar translateX 0 → -50%) asume que el track completo mide EXACTO el doble de una tanda. Con el espaciado puesto como `gap` de flexbox eso no se cumple — gap no deja espacio después del último hijo, así que el hueco entre el final de una tanda y el arranque de la tanda duplicada termina siendo distinto (más corto) que el resto de los huecos, y el track queda medio espaciado más corto que el doble exacto. El -50% quedaba corrido y el loop iba a mostrar un salto perceptible cada 25s. Se resolvió moviendo el espaciado a `margin-right` en cada logo (incluido el último de cada tanda), así todos los huecos miden igual y el track sí es exactamente 2x una tanda. Verificado midiendo en el navegador: dos tandas de 1394.13px cada una, track total 2788.25px — exactamente el doble.
- Esta trampa no había aparecido en el marquee del hero (Fase 11.6, ya eliminado) porque ahí las fotos iban pegadas sin espaciado (gap: 0) — con gap 0 el error se anula solo. Acá, al pedirse espaciado moderado entre logos, el error se vuelve real.
- Verificado también: filter computado en el navegador (`brightness(0) invert(1)`), animation-name/duration/iteration-count/timing-function del track (marquee-logo, 25s, infinite, linear) y que la regla de pausa por hover está en el CSS compilado real (`.group-hover\:[animation-play-state\:paused]:is(:where(.group):hover *)`), mismo método que en la Fase 11.6.
- Sin overflow horizontal en ningún tamaño (mobile y desktop, document.body.scrollWidth === clientWidth en ambos).
- npm run build sin errores.
- Ajuste posterior a pedido de la dueña: el logo se veía chico, se agrandó de h-10/h-12 a h-12/h-16 (48px mobile, 64px desktop). Verificado que sigue entrando en la fila del header sin desbordar en ningún tamaño.

## Fase 16 — Footer completo con políticas, cookies y WhatsApp flotante
- react-icons agregado (íconos de marca reales: Instagram, Facebook, WhatsApp)
- Footer con redes (Instagram confirmado, Facebook con URL placeholder pendiente de confirmar), 4 políticas en popup con contenido real (menos cambios y devoluciones, aún placeholder), términos y condiciones (pendiente revisión legal)
- CookieBanner con persistencia en localStorage
- WhatsAppFloatButton fijo en todas las páginas públicas
- PENDIENTE A PROPÓSITO: botón de arrepentimiento / botón de baja / link de defensa del consumidor — no implementado hasta confirmar con un profesional si la Disposición 954/2025 aplica a este modelo de negocio
- PENDIENTE: URL real de Facebook, texto final de cambios y devoluciones (confirmar con la dueña), revisión legal de términos y condiciones

### Notas técnicas de la Fase 16
- components/ui/PolicyModal.jsx: overlay que cierra al click afuera (stopPropagation adentro del cuadro para que un click ahí no burbujee y lo cierre solo), botón X, Escape, y bloqueo de scroll del body mientras está abierto (document.body.style.overflow = "hidden", restaurado al cerrar).
- WhatsAppFloatButton quedó como Server Component (sin "use client"), no como pedía el enunciado original: es un `<a>` estático sin ningún handler, y CLAUDE.md pide Server Components salvo que haga falta interactividad real. Terminó necesitando "use client" de todos modos por el bug de abajo, así que en la práctica el pedido original resultó correcto — quedó documentado el motivo real, no solo "porque lo pedían".
- Bug real encontrado y corregido: en mobile, con el banner de cookies sin aceptar, el CookieBanner (apilado en 2 líneas, ~121px de alto) se solapaba completo con el WhatsAppFloatButton (mismo rincón inferior derecho, mismo z-40). Se resolvió con un CustomEvent liviano: CookieBanner dispara "cookie-consent-accepted" en window al aceptar, y WhatsAppFloatButton lo escucha para volver a su posición normal (bottom-5); mientras no hay consentimiento confirmado, se posiciona más arriba (bottom-36, despeja el banner con margen) en mobile, y en sm+ vuelve a bottom-5 porque ahí el banner es una sola fila mucho más baja.
- Verificación de este último fix chocó con la limitación ya documentada en fases anteriores (11.8, 12): con el pane sin compositar, getComputedStyle/getBoundingClientRect quedan pegados al primer paint y no reflejan cambios de clase posteriores — se probó forzando bottom inline con !important y el valor leído no se movió, confirmando que la medición estaba trabada, no que el fix fallara. Se verificó por el camino confiable de siempre: el atributo class real en el DOM (correcto: "bottom-36 sm:bottom-5" con el banner visible, "bottom-5" después de aceptar) y el CSS compilado real fetcheado del servidor (.bottom-36 { bottom: calc(var(--spacing) * 36) }, con --spacing resuelto en .25rem → 144px, que despeja los ~121px del banner).
- El botón "Hacer pedido" del carrito no se pudo verificar con el carrito cargado (no hay forma de agregar productos sin pasar por el flujo completo en este entorno de prueba, y el carrito es estado local de Zustand). Se razonó por geometría en vez de medirlo: el botón flotante ocupa un círculo fijo de 56x56 en la esquina, "Hacer pedido" es w-full (ocupa todo el ancho de la card), así que como mucho tapa la esquina inferior derecha del botón, nunca lo bloquea entero — mismo trade-off que usan la mayoría de los sitios con burbuja de WhatsApp + barra de checkout. Pendiente de confirmar a ojo por la dueña con productos reales en el carrito.
- No se agregó botón de arrepentimiento, botón de baja ni link de Defensa del Consumidor, tal como se pidió explícitamente — queda pendiente de una confirmación legal futura, no es un olvido.
- npm run build sin errores.

## Fase 17 — Auditoría visual: Grupo A (arreglado) + Grupo B (propuestas)

Auditoría pedida sobre capturas reales del sitio (público y admin) + el código de components/ y app/, separada en dos grupos: A se corrige directo, B solo se propone.

### Grupo A — corregido
- **Foco visible por teclado**: no existía en NINGÚN botón/link del sitio (solo los inputs lo tenían, vía focus:border-caramel). En vez de agregar la clase a mano en ~40 lugares, se agregó una regla global en globals.css (`a:focus-visible, button:focus-visible { outline: 2px solid var(--color-caramel); outline-offset: 2px; }`), que cubre todo el sitio de una vez sin tocar cada componente.
- **Contraste de texto insuficiente** (medido con la fórmula real de WCAG, no a ojo):
  - `text-ink/50` en texto real de 12-14px (no íconos): "Posición N" del admin de hero, slug de categoría, subtítulo de categoría en productos, badges "Oculta"/"Borrador", 3 labels del dashboard, timestamp de la lista de pedidos → subido a `text-ink/70` (pasa de ~3.1:1 a ~6:1, cumple AA en todos los casos).
  - Texto "Sin imagen" en ImageUploadField y ProductImagesManager (`text-ink/40`, ~2.4:1) → el texto (no el ícono, que queda igual de sutil a propósito) sube a `text-ink/70`.
  - Copyright del footer (`text-sand/50`, 4.3:1 sobre fondo ink) → `text-sand/70` (7:1).
  - Placeholders de todos los inputs del sitio (`placeholder:text-ink/40`, ~2.4:1) → `placeholder:text-ink/60`, en los 5 archivos que comparten ese patrón (login, carrito, VariantManager, ProductForm, CategoryForm).
  - `text-ink/60` (el tono "secundario" más usado en todo el sitio) también da un poco por debajo de AA (4.0-4.33:1 contra 4.5 necesario) — NO se tocó: es la convención dominante en decenas de lugares, cambiarla es una decisión de sistema de diseño, no un fix puntual. Queda como propuesta en el Grupo B.
- **Accesibilidad de formularios**:
  - ImageUploadField y ProductImagesManager: el "label" visual era un `<span>` suelto, sin asociar al input de archivo — ahora es un `<label htmlFor>` real con id en el input.
  - VariantManager: los labels "Talle"/"Color"/"Stock" de cada fila no estaban asociados a su input (y se repiten una vez por fila) — ahora cada uno tiene id/htmlFor único por índice de fila.
  - Foto principal de la galería de producto (ProductGallery): tenía `alt=""` — ahora usa el nombre real del producto (se agregó la prop `productName`, pasada desde la página de producto).
- **Espaciado inconsistente**: los dos primeros bloques del footer usaban `py-14` y `py-12` sin ninguna razón visible entre sí (misma jerarquía de contenido) — unificados a `py-14`.
- **Bug reportado en captura, investigado y descartado**: en la captura de /admin/hero, "Posición 1/2/3..." se veía violeta. Se verificó en el navegador el color computado real: es `oklab` correspondiente a ink al 50% (un marrón oscuro grisáceo), no violeta — no hay ninguna regla CSS que produzca ese tono en el código. Se aprovechó igual para subir el contraste (ver arriba), pero el "bug" en sí no era real — probablemente una lectura de la imagen a baja resolución/compresión.
- **Colores hardcodeados**: único hallazgo real fue `bg-[#25D366]`/`text-white` en el botón flotante de WhatsApp — es el verde de marca oficial de WhatsApp, no un color del sistema de diseño del sitio; tokenizarlo a "caramel" rompería el reconocimiento de marca. Se dejó igual, con un comentario aclarando que es intencional.
- **Estados vacíos/error**: revisados todos (categoría sin productos, carrito vacío, listas del admin sin datos, mensajes de error de formulario) — ya seguían un patrón consistente en todo el sitio (empty state centrado en font-accent text-2xl text-ink/60, error en text-sm text-rose). No se encontró ningún fallback genérico feo que corregir.
- npm run build sin errores.

### Grupo B — propuestas, sin tocar código

1. **`text-ink/60` (y su equivalente en sand) por debajo de AA en casi todo el sitio.** Es el color de texto secundario más usado (subtítulos, ayudas, descripciones) y mide 4.0-4.33:1 contra el 4.5:1 que pide WCAG AA para texto normal — muy cerca, pero técnicamente no pasa. Arreglarlo implica cambiar la opacidad base de "texto secundario" en decenas de archivos, lo cual cambia el peso visual de todo el sitio, no un solo lugar puntual. Propuesta: subir a `/70` de forma sistemática (mismo criterio que ya se aplicó en el Grupo A a los casos peores) — pero como toca tantos archivos a la vez, prefiero que lo apruebes antes de tocarlo.

2. **Sensación de marca: admin notoriamente menos cuidado que el público.** El sitio público tiene acentos deliberados (BotanicalAccent, marquee de logo, Eyebrow en Caveat manuscrita, paleta caramel/rose usada con variedad). El admin es 100% funcional: tarjetas, listas, botones — sin ningún toque decorativo. Es una decisión válida (un admin más "quieto" ayuda a que la dueña opere rápido, sin ruido visual), pero si preferís que se sienta más "Hippie & Chic" y menos genérico, se podría sumar algo mínimo (el Eyebrow manuscrito en algunos títulos del admin, o un detalle de color en el header) sin tocar la usabilidad.

3. **Página de producto se siente vacía debajo de "Agregar al carrito".** Queda bastante espacio en blanco a la derecha de la foto, sin nada que refuerce la decisión de compra (envío, cambios, medios de pago) — justo la información que ahora vive en los popups del footer, pero un poco escondida. Se podría sumar un bloque corto con esos 3 datos clave directo en la página de producto.

4. **Tarjetas de métricas del dashboard son texto plano.** Comparadas con el resto del sitio (que usa íconos, color, acentos), las 4 tarjetas de arriba del dashboard son solo número + label sin ningún apoyo visual. Un ícono por métrica o un color sutil distinto por tipo (ingresos vs. alertas) las haría más rápidas de escanear.

5. **Franja fina de color en el borde superior de varias capturas (footer, categoría, producto, admin pedidos/hero).** Se ve una línea delgada verdosa/turquesa pegada al borde de arriba en varias de las imágenes que mandaste. La busqué en el código y no encontré ninguna regla que la explique, y no pude reproducirla navegando el sitio yo mismo en este entorno. Puede ser un artefacto del navegador/SO al capturar (barra de progreso de carga, extensión) y no algo del sitio — si la seguís viendo después de un refresh fuerte, mandame una captura con las devtools abiertas en la pestaña Elements para encontrar el origen real antes de tocar nada. **[Probable causa encontrada y corregida en la Fase 17.5: faltaba theme-color — ver esa fase.]**

## Fase 17.5 — theme-color de la barra del navegador

Pedido puntual, no parte de la auditoría: agregar theme-color a la paleta del proyecto. Probablemente explica el ítem 5 del Grupo B de la Fase 17 (la franja verdosa en las capturas) — sin theme-color, el navegador tiñe su propia UI (barra de direcciones en mobile) con un color por default en vez de combinar con el sitio.

- app/layout.js no tenía ni themeColor en metadata ni un export viewport — se agregó `export const viewport = { themeColor: "#ede4d3" }` (en Next 16, themeColor va en viewport, no en metadata; ahí dejó de aceptarse hace varias versiones)
- Verificado en el navegador: `<meta name="theme-color" content="#ede4d3">` presente en el HTML real
- npm run build sin errores

## Fase 18 — Resolución de 4 de los 5 puntos del Grupo B (Fase 17)

Siguiendo el mismo formato de la auditoría: PASO 1 y 2 mecánicos (contraste), PASO 3-5 con criterio propio explicado y aprobado por la dueña antes de commitear.

- **PASO 1 (theme-color)**: ya resuelto en la Fase 17.5, sin cambios acá.
- **PASO 2 — `text-ink/60` → `text-ink/70`**: aplicado en todo texto legible chico (12-14px) que efectivamente fallaba AA (~4.0-4.33:1 → ~6-7:1). Sin tocar: `placeholder:text-ink/60` (categoría distinta, ya resuelta en la Fase 17), el color de íconos-solo-botón vía `iconButtonClass` (ya pasan el umbral de 3:1 para íconos, no es texto), y los empty states en `font-accent text-2xl` (texto grande, ya pasa AA-large en 3:1 — no había base matemática para tocarlos).
- **PASO 3 — Info de confianza en producto**: bloque con borde (`border-ink/10 bg-card`, mismo estilo que ya usa el sitio) con 3 líneas ícono+texto (Truck/Landmark/RotateCcw de lucide-react) inmediatamente debajo de "Agregar al carrito" en app/(shop)/producto/[slug]/page.js — el hueco vacío señalado en la Fase 17. Contenido resumido a una línea por punto (no el texto largo de lib/policyContent.js), porque ahí compite por atención con el botón de compra.
- **PASO 4 — Identidad de marca en el admin**: el logo real (mismo PNG del header público, invertido a blanco con el mismo filtro `brightness(0) invert(1)` que ya usa components/LogoMarquee.jsx) reemplaza el texto "Hippie & Chic — Admin" en app/admin/(protected)/layout.js, con "Admin" al lado en Caveat para no perder la distinción de un vistazo. Se sumó una línea caramel de 2px (`border-b-2 border-caramel`) bajo el header. Se descartó agregar un Eyebrow manuscrito arriba de cada título de página del admin (Categorías, Productos, Pedidos): son pantallas que se escanean rápido y seguido, y eso hubiera sido exactamente el "ruido visual que hace más lento el trabajo diario" que la dueña pidió evitar explícitamente.
- **PASO 5 — Cards de métricas del dashboard**: un ícono por métrica (ShoppingBag/Package/Tags/Wallet de lucide-react) en un círculo caramel tenue a la izquierda del número, mismo lenguaje visual que ya usa AboutSection (ícono + texto). El número se mantiene como el elemento más grande de cada card. Se descartó diferenciar "Pedidos pendientes" con un color de fondo distinto cuando el valor es > 0: introducía un estado condicional que podía leerse como bug sin explicación, y no valía la complejidad extra para lo pedido.
- Queda pendiente el punto 1 del Grupo B (el `text-ink/60` de base del sitio, 4.0-4.33:1, sistémico) — no se tocó, no fue parte de este pedido.

### Notas técnicas de la Fase 18
- Verificación: se reconstruyó la ruta temporal de QA (app/qa-mobile-admin, renderiza las Server Components del admin fuera de /admin sin necesitar sesión) para confirmar en el navegador el logo del header, la línea caramel, las 4 cards con ícono, y el bloque de confianza en una página de producto real — y se borró antes de commitear (confirmado dos veces: Glob y listado directo de app/, ninguno encuentra la carpeta).

## Fase 19 — Filtros de categoría (talle, orden, buscador)
- Filtros reflejados en la URL (searchParams): `talle` (lista separada por comas, multi-select), `orden` (`recientes` default / `precio-asc` / `precio-desc`), `buscar` (texto libre)
- Talles disponibles calculados dinámicamente por categoría (no una lista fija) — se recalculan sobre el universo completo de la categoría, no sobre el resultado ya filtrado, así elegir un talle no hace desaparecer las opciones de los demás
- components/CategoryFilters.jsx: pills de talle (mismo estilo que ProductVariantSelector), select de orden, buscador con debounce de 350ms
- Estado vacío específico cuando los filtros no arrojan resultados ("No se encontraron productos con estos filtros"), con link para limpiarlos — distinto del estado vacío general ("Todavía no hay productos en esta categoría") que sigue existiendo cuando la categoría está vacía sin que haya ningún filtro puesto

### Notas técnicas de la Fase 19
- `router.replace` para el buscador (no deja entradas de historial por cada letra tipeada) vs `router.push` para talle/orden (son decisiones concretas, tiene sentido que "atrás" las deshaga una por una). Ambos con `{ scroll: false }` para no saltar al toque de la página al cambiar un filtro.
- El talle filtra en dos pasos porque Supabase/PostgREST no deja filtrar la tabla principal por "algún hijo cumple X" en una sola consulta: primero se resuelve qué `product_id` tienen alguna variante con los talles pedidos (`product_variants` con embed `products!inner(category_id)` para poder filtrar por categoría desde ahí), después se aplica `.in('id', esosIds)` sobre la query de productos. Si esa lista da vacía, se corta ahí mismo sin llegar a consultar `products` — no hace falta, ya se sabe que el resultado es vacío.
- El input de búsqueda tiene un problema clásico de sincronización: si el efecto que sincroniza el input con la URL corriera siempre, pisaría lo que la persona está tipeando en cuanto el debounce actualizara la URL (la propia actualización dispara el efecto). Se resolvió con un ref (`isOwnUpdate`) que marca "este cambio de URL lo hice yo mismo" antes del `router.replace`, así el efecto de sincronización solo reacciona a cambios externos de verdad (botón atrás/adelante del navegador, o "Limpiar filtros").
- Verificado en el navegador: combinar los 3 filtros a la vez arma la URL correcta (`?talle=38&orden=precio-asc&buscar=jean`) y devuelve productos que cumplen los tres (9 de 10 jeans, todos con "jean" en el nombre, ordenados $46.000→$96.000 ascendente). Categoría sin talles cargados (Carteras): la sección de talle no aparece, sin overflow ni error. Talle inexistente en la categoría (`?talle=99`): cae directo al estado "sin resultados" sin romper. "Limpiar filtros" resetea la URL y el input a la vez.
- npm run build sin errores.
- Pendiente de confirmar con la dueña: "de palta" en el pedido original no se entendió a qué se refería (no hay ningún filtro de "palta" pedido en el resto del mensaje) — se avisa en vez de adivinar. Si era un typo por "talle", ya está cubierto; si era otra cosa (color, precio como filtro con rango en vez de solo orden), se agrega aparte.
- npm run build sin errores en cada paso.