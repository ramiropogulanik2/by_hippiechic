# Handoff: Rediseño del home — Hippie & Chic

## Overview
Rediseño de la home de `by-hippiechic.vercel.app` (Next.js + Supabase, catálogo boho-chic con cierre de venta por WhatsApp). El objetivo del rediseño es **poner producto y precio arriba de todo**: hoy hay que hacer al menos dos clicks desde el home para ver una prenda con precio.

**Importante para quien implemente:** el cliente quiere adoptar *algunos* de estos cambios y no todos. Los cambios están numerados en "Change list" más abajo y son **independientes entre sí** — se pueden aplicar de a uno. No implementar el paquete completo sin confirmar cuáles quedaron aprobados.

## About the Design Files
Los archivos de este bundle son **referencias de diseño hechas en HTML**: prototipos que muestran la apariencia y el comportamiento buscados, no código de producción para copiar tal cual. La tarea es **recrear estos diseños dentro del entorno existente del proyecto** (Next.js App Router + React + el sistema de estilos que ya usa el repo) siguiendo sus patrones y componentes actuales. El HTML usa estilos inline por una restricción de la herramienta con la que fue hecho — en el codebase debe traducirse a lo que el repo ya use (Tailwind, CSS Modules, etc.).

## Fidelity
**High-fidelity (hifi).** Colores, tipografía, escala y espaciados son definitivos y están listados abajo en "Design Tokens". La UI debería recrearse fielmente, pero usando los componentes y utilidades que ya existan en el repo.

Dos salvedades de contenido:
- Los **nombres y precios de producto son placeholder inventados** ("Campera de cuero Alma", "$189.000", etc.). Deben venir de Supabase.
- Seis de las ocho tarjetas de destacados tienen un **placeholder rayado** con la leyenda `foto de producto 4:5` porque el sitio actual no expone fotos de producto sueltas, solo imágenes de hero. Hacen falta fotos reales en relación de aspecto 4:5.

---

## Change list (para elegir)

| # | Cambio | Qué reemplaza hoy | Riesgo / esfuerzo |
|---|---|---|---|
| 1 | **Un solo hero editorial partido** (texto izquierda / foto derecha a sangre + foto chica superpuesta) | El carrusel de 6 heroes | Bajo. Elimina lógica de carrusel; hay que elegir 2 fotos fijas. |
| 2 | **Marquee informativo** ("Envíos a todo el país · Cambios sin cargo · 3 cuotas · Showroom con cita previa · WhatsApp") | La cinta con el logo repetido 8+ veces | Bajo. Verificar que las promesas sean ciertas antes de publicarlas. |
| 3 | **Grilla de destacados en el home**, 8 productos, con precio y talles visibles | Nada — hoy no hay producto en el home | Medio. Requiere query de destacados en Supabase + flag `destacado` por producto. |
| 4 | **Categorías en 3 familias grandes con foto** (Ropa / Cueros & Denim / Accesorios) **+ chips de subcategorías debajo** | La lista plana de 9 categorías iguales | Medio. Requiere agrupar las 9 categorías existentes en 3 familias. |
| 5 | **Barra superior de anuncio** en negro con envíos + showroom | Nada | Bajo. |
| 6 | **Header sticky** con nav por familias, botón WhatsApp y carrito con contador | Header con logo + carrito | Bajo. |
| 7 | **Prueba social en el hero** (41k seguidoras / 8 años / despacho 48h) | Los datos sueltos dentro del bloque "Detrás de" | Bajo. Confirmar el dato de "8 años" y "48h" antes de publicar. |
| 8 | **"Detrás de Hippie & Chic" corrido más abajo y acortado**, con CTA "Pedir una cita" | El bloque actual, más arriba y más largo | Bajo. |
| 9 | **Bloque WhatsApp full-width en negro** antes del footer | El botón de WhatsApp suelto | Bajo. |
| 10 | **Footer de 4 columnas** (marca+redes / Comprar / Ayuda / Showroom) | Lista de links sin jerarquía | Bajo. |
| 11 | **Tipografía nueva**: Instrument Serif para titulares + Jost para el resto | Tipografía actual | Bajo, pero es el cambio más visible de identidad. Decidir primero. |
| 12 | **Badge "Oportunidad"** en terracota con precio tachado en las tarjetas | Nada | Bajo. Depende de #3. |

Cambios sugeridos y **no implementados** todavía (mencionar al cliente):
- Barra fija inferior en mobile con carrito + WhatsApp.
- Botón "Consultar stock y talle por WhatsApp" en cada tarjeta de producto y en la ficha, con el nombre del producto precargado en el mensaje.

---

## Screens / Views

### Home (desktop)
**Purpose:** que la visitante vea producto y precio sin hacer un click, y que pueda saltar a WhatsApp desde cualquier punto de la página.

**Layout general:** una sola columna vertical de secciones. Cada sección tiene `max-width: 1440px`, centrada con `margin: 0 auto`, y `padding` lateral de `44px`. El fondo global es `#f7f2ea`. Separación vertical entre secciones: `112px` de `padding-top`. La página no debe tener overflow horizontal en ningún ancho.

#### 1. Barra de anuncio
- Fondo `#1c1815`, texto `#f7f2ea`, centrado, ancho completo (sin max-width).
- Padding `11px 20px`. Tipografía: Jost 12px, `letter-spacing: 0.22em`, `text-transform: uppercase`.
- Copy: `Envíos a todo el país · Showroom en Córdoba con cita previa`

#### 2. Header (sticky)
- `position: sticky; top: 0; z-index: 20`. Fondo `rgba(247,242,234,0.94)` con `backdrop-filter: blur(10px)`. Borde inferior `1px solid rgba(28,24,21,0.1)`.
- Interior: `max-width 1440px`, `padding: 18px 44px`, flex, `justify-content: space-between`, `gap: 32px`.
- **Logo** izquierda: `hippiechic-logo-v2.png`, altura `44px`, ancho auto, linkeado a `/`.
- **Nav** centro: flex, `gap: 30px`, `flex-wrap: wrap`. Jost 14px, `letter-spacing: 0.09em`, uppercase, color `#1c1815`. Items: `Novedades` (→ `#destacados`), `Ropa`, `Cueros & Denim`, `Accesorios` (→ `#categorias`), `Oportunidades` (color `#a8553a`, → `/categoria/oportunidades`).
  - Hover: `border-bottom: 1px solid` del color del texto. En reposo el borde es `transparent` para que no salte el layout.
- **Acciones** derecha: flex, `gap: 14px`.
  - `WhatsApp`: borde `1px solid #1c1815`, `padding: 11px 18px`, Jost 13px uppercase `letter-spacing: 0.1em`. Hover: fondo `#1c1815`, texto `#f7f2ea`. Href `https://wa.me/5493516519012`.
  - `Carrito (0)`: fondo `#1c1815`, texto `#f7f2ea`, `padding: 12px 18px`. Hover: fondo `#a8553a`. Href `/carrito`. El contador debe reflejar el estado real del carrito.

#### 3. Hero
- Grid de 2 columnas: `minmax(0,1.05fr) minmax(0,1fr)`, `gap: 0`, `align-items: stretch`, `min-height: 640px`.
- **Columna izquierda** — `padding: 96px 64px 96px 0`, flex column centrada verticalmente, `gap: 30px`:
  - Eyebrow: Jost 12px, `letter-spacing: 0.28em`, uppercase, color `#a8553a`. Copy: `Temporada 26 · Boho rockero`.
  - `<h1>`: Instrument Serif 400, `font-size: clamp(52px, 6.2vw, 96px)`, `line-height: 0.98`, `letter-spacing: -0.015em`, `text-wrap: pretty`. Copy en dos líneas: `Cueros, denim y` / `piezas con carácter` — la segunda línea en `<em>` itálica color `#a8553a`.
  - Párrafo: Jost 18px, `line-height: 1.55`, `max-width: 46ch`, color `rgba(28,24,21,0.78)`. Copy: `Selección chica y elegida a mano. Reservás por WhatsApp, te confirmamos talle y stock en el momento, y lo enviamos a todo el país.`
  - Botonera, flex `gap: 14px`, `flex-wrap: wrap`, `padding-top: 6px`:
    - Primario `Ver catálogo` → `#destacados`. Fondo `#1c1815`, texto `#f7f2ea`, `padding: 18px 34px`, Jost 14px uppercase `letter-spacing: 0.12em`. Hover: fondo `#a8553a`.
    - Secundario `Consultar un talle` → wa.me. Borde `1px solid rgba(28,24,21,0.35)`, mismo padding y tipografía. Hover: borde `#1c1815`.
  - Fila de prueba social: `border-top: 1px solid rgba(28,24,21,0.14)`, `padding-top: 26px`, `margin-top: 12px`, flex `gap: 40px`, `flex-wrap: wrap`. Cada item: número en Instrument Serif 34px `line-height: 1`, y label en Jost 11px `letter-spacing: 0.18em` uppercase color `rgba(28,24,21,0.6)`. Items: `41k / Seguidoras`, `8 / Años de tienda`, `48h / Despacho`.
- **Columna derecha** — `position: relative`, `min-height: 640px`:
  - Foto principal en `position: absolute; inset: 0`, `object-fit: cover` (en el mock: `hero-1.jpg`).
  - Foto secundaria superpuesta: `position: absolute; left: -56px; bottom: 56px`, `200×264px`, `border: 1px solid rgba(247,242,234,0.5)`, `overflow: hidden`, `box-shadow: 0 28px 60px rgba(28,24,21,0.28)`, `object-fit: cover` (en el mock: `hero-4.jpg`). El desborde a la izquierda es intencional y pisa la columna de texto.

#### 4. Marquee informativo
- `margin-top: 80px`. Fondo `#efe7da`, borde superior e inferior `1px solid rgba(28,24,21,0.14)`, `overflow: hidden`, ancho completo.
- Interior: un flex de `width: max-content` con **el mismo grupo de items duplicado dos veces**, animado con `@keyframes` de `translateX(0)` a `translateX(-50%)`, `34s linear infinite`. La duplicación es lo que hace que el loop no tenga corte visible.
- Cada grupo: flex `align-items: center`, `gap: 52px`, `padding: 16px 26px`, `white-space: nowrap`. Items en Jost 12px `letter-spacing: 0.24em` uppercase color `rgba(28,24,21,0.72)`, separados por un `✳` color `#a8553a`.
- Copy: `Envíos a todo el país` · `Cambios sin cargo en Córdoba` · `3 cuotas sin interés` · `Showroom con cita previa` · `Atención directa por WhatsApp`.
- Respetar `prefers-reduced-motion: reduce` → pausar la animación.

#### 5. Destacados (`id="destacados"`)
- Encabezado: flex `space-between`, `align-items: flex-end`, `gap: 32px`, `flex-wrap: wrap`, `padding-bottom: 38px`.
  - Izquierda: eyebrow `Recién llegado` (mismo estilo que el del hero) + `<h2>` `Lo que se está llevando` en Instrument Serif 400 `clamp(36px, 3.6vw, 54px)` `line-height: 1.02`.
  - Derecha: filtros. Jost 13px `letter-spacing: 0.08em` uppercase, `padding: 10px 18px`. El activo (`Todo`) va con fondo `#1c1815` y texto `#f7f2ea`; los inactivos (`Cueros`, `Denim`, `Tejidos`) con `border: 1px solid rgba(28,24,21,0.28)`. **En el mock son estáticos** — en el codebase deben filtrar la grilla de verdad (client-side sobre los destacados ya cargados es suficiente).
- Grilla: `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(250px,1fr))`, `gap: 34px 26px`.
- **Tarjeta de producto** — flex column `gap: 14px`:
  - Media: `aspect-ratio: 4/5`, `overflow: hidden`, `object-fit: cover`.
    - Placeholder (mientras no haya foto): fondo `repeating-linear-gradient(45deg, #e7dccb, #e7dccb 9px, #efe7da 9px, #efe7da 18px)` con la leyenda centrada en monospace 11px `letter-spacing: 0.1em` color `rgba(28,24,21,0.55)`: `foto de producto 4:5`. **Este placeholder no va a producción** — es la marca de dónde falta foto.
    - Badge opcional: `position: absolute; top: 12px; left: 12px`, 10px uppercase `letter-spacing: 0.16em`, `padding: 6px 10px`. `Nuevo` → fondo `#1c1815`, texto `#f7f2ea`. `Oportunidad` → fondo `#a8553a`, texto `#fff`.
  - Texto: flex column `gap: 5px`.
    - Nombre: Jost 16px, color `#1c1815`.
    - Precio: Instrument Serif 24px `line-height: 1`. Si hay oferta: precio nuevo en `#a8553a` y, al lado, precio anterior en Jost 14px `text-decoration: line-through` color `rgba(28,24,21,0.45)`, con `gap: 10px` y `align-items: baseline`.
    - Talles / variantes: Jost 12px `letter-spacing: 0.1em` uppercase color `rgba(28,24,21,0.55)`. Ej. `Talles S · M · L`, `Talles 36 al 46`, `Último talle M`, `Talle único`, `Negro · Suela`.
  - La tarjeta entera debe ser un link a la ficha de producto (en el mock no lo es).
- CTA de cierre: centrado, `padding-top: 52px`. `Ver los 240 productos`, borde `1px solid #1c1815`, `padding: 18px 42px`, Jost 14px uppercase `letter-spacing: 0.12em`. Hover: fondo `#1c1815`, texto `#f7f2ea`. **El "240" es placeholder** — debe ser el conteo real del catálogo.

#### 6. Categorías (`id="categorias"`)
- Encabezado: eyebrow `Nuestro catálogo` + `<h2>` `Elegí por familia` (mismo estilo que el h2 de destacados), `padding-bottom: 38px`.
- Grid de familias: `repeat(auto-fit, minmax(300px,1fr))`, `gap: 22px`. Cada familia es un `<a>` de `aspect-ratio: 3/4`, `overflow: hidden`, `position: relative`:
  - Foto `object-fit: cover` a sangre.
  - Overlay: `linear-gradient(to top, rgba(28,24,21,0.82) 0%, rgba(28,24,21,0.1) 55%, rgba(28,24,21,0) 100%)`.
  - Texto abajo, `padding: 32px`, color `#f7f2ea`, flex column `gap: 10px`: título en Instrument Serif 38px `line-height: 1` + lista de subcategorías en Jost 13px `letter-spacing: 0.06em` color `rgba(247,242,234,0.82)`.
  - Familias: `Ropa` (Remeras · Bodies & tops · Camisas · Sweaters) → `/categoria/remeras`; `Cueros & Denim` (Camperas · Chalecos · Jeans · Faldas) → `/categoria/pantalones-jeans`; `Accesorios` (Carteras · Cinturones · Bijou) → `/categoria/carteras-accesorios`. **Los destinos son provisorios** — lo correcto sería una página de familia que agrupe sus subcategorías.
- Chips de subcategorías: flex `gap: 10px`, `flex-wrap: wrap`, `padding-top: 22px`. Jost 13px `letter-spacing: 0.08em` uppercase, `border: 1px solid rgba(28,24,21,0.25)`, `padding: 11px 18px`. Hover: fondo `#1c1815`, texto `#f7f2ea`, borde `#1c1815`. Uno por cada categoría existente: Remeras, Bodies & Tops, Camisas & Blusas, Sweaters, Chalecos, Faldas, Pantalones & Jeans. `Oportunidades` va aparte, con borde y texto `#a8553a`, hover fondo `#a8553a` y texto `#fff`.

#### 7. Detrás de la marca
- Grid `repeat(auto-fit, minmax(320px,1fr))`, `gap: 0`, fondo `#efe7da`, `align-items: stretch`.
- Izquierda: `about.jpg` a sangre, `min-height: 460px`, `object-fit: cover`.
- Derecha: `padding: 64px 56px`, flex column `gap: 22px`, centrada verticalmente:
  - Eyebrow `Conocé la tienda`.
  - `<h2>`: Instrument Serif 400 `clamp(34px, 3.2vw, 48px)` `line-height: 1.03`. Copy `Detrás de Hippie & Chic` con `Hippie & Chic` en itálica.
  - Párrafo Jost 17px `line-height: 1.6` `max-width: 52ch` color `rgba(28,24,21,0.78)`: `Armamos la tienda pensando en mujeres que buscan piezas con personalidad: cueros, denim y esa mezcla boho-rockera que nos representa. Atendemos con cita previa en el showroom de Córdoba y enviamos a todo el país.`
  - Link `Pedir una cita →`, `align-self: flex-start`, Jost 14px uppercase `letter-spacing: 0.12em`, `border-bottom: 1px solid #1c1815`, `padding-bottom: 5px`. Hover: color y borde `#a8553a`.

#### 8. Bloque WhatsApp
- Fondo `#1c1815`, texto `#f7f2ea`, `padding: 74px 56px`, flex `space-between`, `align-items: center`, `gap: 40px`, `flex-wrap: wrap`.
- Izquierda: eyebrow `¿Tenés dudas con el talle?` en color `#d99b7c` + `<h2>` `Escribinos y te ayudamos a elegir` en Instrument Serif 400 `clamp(34px, 3.4vw, 50px)` `line-height: 1.03`, `max-width: 24ch`.
- Derecha: botón `flex: none`, fondo `#25d366`, texto `#0b2b15`, `padding: 20px 34px`, Jost 15px uppercase `letter-spacing: 0.1em`, con el ícono de WhatsApp de 26px a la izquierda y `gap: 14px`. Hover: fondo `#1fbb59`. Href `https://wa.me/5493516519012?text=Hola!%20Tengo%20una%20consulta%20sobre%20un%20producto.`

#### 9. Footer
- `margin-top: 112px`, `border-top: 1px solid rgba(28,24,21,0.14)`.
- Grid `repeat(auto-fit, minmax(200px,1fr))`, `gap: 44px`, `padding: 64px 44px 34px`.
  - **Col 1:** logo (altura 46px) + párrafo Jost 14px `line-height: 1.6` color `rgba(28,24,21,0.7)` `max-width: 34ch` (`Envíos a todo el país · Córdoba, Argentina. Los pedidos se confirman por WhatsApp.`) + dos botones de red con borde `1px solid rgba(28,24,21,0.25)`, Jost 12px uppercase `letter-spacing: 0.12em`, `padding: 9px 15px`: `Instagram` → `https://www.instagram.com/by_hippiechic`, `Facebook` → `https://www.facebook.com/HippieChicOk`.
  - **Col 2 — `Comprar`:** ¿Cómo comprar? / Medios de pago / Métodos de envío.
  - **Col 3 — `Ayuda`:** Cambios y devoluciones / Términos y condiciones / Contacto (→ wa.me).
  - **Col 4 — `Showroom`:** `Córdoba Capital / Con cita previa / Lun a Vie · 10 a 18h` en Jost 15px `line-height: 1.55` color `rgba(28,24,21,0.78)`. **Confirmar el horario con la clienta antes de publicar.**
  - Títulos de columna: Jost 11px `letter-spacing: 0.2em` uppercase color `rgba(28,24,21,0.5)`. Links: Jost 15px color `#1c1815`, hover `#a8553a`.
- Línea final: `padding: 0 44px 44px`, Jost 12px `letter-spacing: 0.14em` uppercase color `rgba(28,24,21,0.5)`: `© Hippie & Chic 2026`.

## Interactions & Behavior
- **Hover de links y botones**: transición de color/fondo en ~150ms `ease`. Los links de nav usan `border-bottom` transparente en reposo para que el hover no cambie la altura.
- **Nav interna**: `Novedades` y las familias hacen scroll suave a `#destacados` / `#categorias`. Con header sticky de ~81px hace falta `scroll-margin-top` en los targets.
- **Marquee**: animación CSS infinita, sin JS. Pausar en `prefers-reduced-motion: reduce`.
- **Filtros de destacados**: en el mock son decorativos. Comportamiento esperado: click marca el chip activo (fondo `#1c1815`) y filtra la grilla; `Todo` resetea.
- **Tarjeta de producto**: toda la tarjeta navega a la ficha. Sugerido (no en el mock): al hover, cambiar a la segunda foto del producto.
- **Carrito**: el contador del header refleja el estado del carrito.
- **CTAs de WhatsApp**: abrir en pestaña nueva con el mensaje precargado. Donde aplique, incluir el nombre del producto en el `text`.
- **Estados que faltan en el mock y hay que resolver en el codebase**: skeleton de la grilla mientras carga Supabase; estado de error si la query falla; estado vacío si no hay destacados (mejor esconder la sección que mostrarla vacía); `alt` real en cada foto de producto.
- **Responsive**: este handoff cubre solo desktop. El grid del hero y el de "detrás de" deben colapsar a una columna abajo de ~900px; la foto superpuesta del hero (`left: -56px`) hay que reubicarla o esconderla en mobile. La grilla de productos ya reflow con `auto-fill minmax(250px,1fr)`.

## State Management
- `featuredProducts`: lista de destacados desde Supabase (id, nombre, precio, precio anterior, talles/variantes, badge, fotos). Requiere un flag `destacado` y un `orden` en la tabla de productos.
- `activeFilter`: `'todo' | 'cueros' | 'denim' | 'tejidos'`. Local al componente de destacados.
- `cartCount`: derivado del carrito existente; alimenta el botón del header.
- `catalogCount`: conteo total de productos, para el CTA `Ver los N productos`.
- Data fetching: los destacados y el conteo se pueden resolver en server component / SSR — es contenido above-the-fold y no debería depender de JS del cliente.

## Design Tokens

**Colores**
| Token | Valor | Uso |
|---|---|---|
| `bg` | `#f7f2ea` | Fondo de página (coincide con el `theme-color` actual del sitio) |
| `bg-alt` | `#efe7da` | Marquee, bloque "detrás de" |
| `ink` | `#1c1815` | Texto principal, botones sólidos, overlays |
| `ink-78` | `rgba(28,24,21,0.78)` | Párrafos |
| `ink-55` | `rgba(28,24,21,0.55)` | Metadatos (talles), texto de placeholder |
| `ink-50` | `rgba(28,24,21,0.5)` | Títulos de columna del footer, copyright |
| `hairline` | `rgba(28,24,21,0.14)` | Bordes divisorios |
| `border` | `rgba(28,24,21,0.25)` – `rgba(28,24,21,0.35)` | Bordes de botones y chips |
| `accent` | `#a8553a` | Terracota: eyebrows, ofertas, hovers, "Oportunidades" |
| `accent-light` | `#d99b7c` | Eyebrow sobre fondo oscuro |
| `placeholder-stripe` | `#e7dccb` sobre `#efe7da` | Rayas del placeholder de foto |
| `whatsapp` | `#25d366`, hover `#1fbb59`, texto `#0b2b15` | Botón WhatsApp |

**Tipografía**
- Titulares: **Instrument Serif** 400 (Google Fonts), roman e itálica.
- Interfaz y cuerpo: **Jost** 400 / 500 / 600 (Google Fonts).
- Monospace: stack del sistema (`ui-monospace, Menlo, monospace`), solo para el placeholder.
- Escala: h1 `clamp(52px, 6.2vw, 96px)` / `line-height 0.98` / `letter-spacing -0.015em`; h2 `clamp(36px, 3.6vw, 54px)` / `1.02`; h3 de familia `38px` / `1`; precio `24px`; cuerpo `17–18px` / `1.55–1.6`; UI `13–16px`; eyebrow `12px` / `0.28em`; micro `10–11px` / `0.16–0.2em`.
- Todo lo uppercase lleva `letter-spacing` positivo (0.08em a 0.28em). Los titulares serif nunca van en uppercase.

**Espaciado** — escala de 4px. Valores en uso: 5, 6, 10, 12, 14, 16, 22, 26, 30, 32, 34, 38, 40, 44, 52, 56, 64, 74, 80, 96, 112. Padding lateral de sección: 44px. Separación entre secciones: 112px.

**Radios** — `0` en todo, salvo círculos (`border-radius: 50%`) para el ícono de WhatsApp. Los cantos rectos son parte de la identidad del rediseño; no redondear.

**Sombras** — `0 28px 60px rgba(28,24,21,0.28)` en la foto superpuesta del hero. Fuera de eso, no hay sombras.

**Relaciones de aspecto** — producto `4/5`; tarjeta de familia `3/4`; hero `min-height: 640px`.

## Assets
Todo lo visual sale del sitio actual; nada fue creado nuevo.
- `hippiechic-logo-v2.png` — header y footer.
- `hero-1.jpg` — foto principal del hero y tarjeta de familia "Ropa".
- `hero-3.jpg` — una tarjeta de producto y tarjeta de familia "Accesorios".
- `hero-4.jpg` — foto superpuesta del hero y tarjeta de familia "Cueros & Denim".
- `catalog-images/hero/1787151207065.jpeg` (Supabase) — una tarjeta de producto.
- `about.jpg` — bloque "detrás de".
- Ícono de WhatsApp: SVG inline en el mock. Usar el del sistema de iconos del repo.

Dos assets de hero de Supabase (`1787150998119.jpeg` y `1787151038583.jpeg`) fueron descartados: no son fotos de prenda (uno es el logo con flechas, el otro un patrón de corazones) y quedaban como imagen rota dentro de una tarjeta de producto.

**Faltan:** fotos de producto reales en 4:5 para al menos 8 destacados, y 3 fotos dedicadas para las tarjetas de familia (hoy reutilizan las del hero, que ya aparecen arriba en la misma página).

## Files
- `Hippie Chic Home.dc.html` — el prototipo. Estilos inline por limitación de la herramienta; traducir al sistema de estilos del repo.
- `Hippie Chic Home.html` — el mismo diseño en un archivo único autocontenido (fuentes e imágenes embebidas). Se abre offline en cualquier navegador; útil para revisar sin levantar nada.

El sitio original de referencia: `https://by-hippiechic.vercel.app/`
