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
