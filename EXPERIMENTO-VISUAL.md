# Experimento: rediseño visual

Rama `experimento/rediseño-visual`. No mergeado. `main` queda intacta en `40290f5`.

Este archivo vive solo en la rama del experimento — PROGRESS.md sigue siendo el
historial de lo que está en producción, y no se tocó.

---

## Dirección: "Cuero, óxido y última luz"

La paleta anterior (beige `#ede4d3` de fondo, acento caramel desaturado) tenía
dos problemas. Uno de marca: es exactamente el combo "warm cream + serif +
terracota" que se volvió el default de todo sitio boho, así que se veía prolijo
pero intercambiable con cualquier otro. Uno funcional, más importante: las
prendas reales son cueros, gamuzas y denim fotografiados sobre fondos claros, y
un beige medio detrás les baja el contraste y las apaga.

La apuesta es invertir la jerarquía: **fondo casi-papel para que las fotos
manden**, y concentrar el color en un **óxido saturado** que sí tiene presencia,
con un **oliva apagado** de contrapunto — un tono que ya aparece en las fotos
reales del showroom (plantas secas, follaje) y que rompe el monótono tierra sin
traicionar la marca.

---

## Decisiones grandes

### 1. Paleta: papel + óxido + oliva

| token | valor | rol |
|---|---|---|
| `card` | `#fffcf8` | superficie elevada |
| `sand` | `#f7f2ea` | fondo de página — papel cálido |
| `dune` | `#eadfd0` | bloque tonal, da ritmo entre secciones |
| `ink` | `#2b211c` | espresso (más cálido que un negro) |
| `caramel` | `#b4562e` | óxido — acento sobre fondo claro |
| `ember` | `#d98a5f` | óxido luminoso — acento sobre fondo oscuro |
| `olive` | `#6b6a4b` | secundario |
| `rose` | `#c0705c` | errores y acciones destructivas |
| `caramel-deep` / `rose-deep` | `#7d3a1d` / `#9c4b38` | texto de chips de estado |

**Por qué dos versiones del óxido:** uno solo no alcanza para los dos fondos.
Sobre papel hace falta el oscuro (4.4:1); sobre espresso, el claro (5.8:1).
Usar el mismo en ambos deja uno ilegible — es el tipo de detalle que en la
paleta anterior estaba resuelto por casualidad, porque el caramel era tan
desaturado que "funcionaba mal parejo" en los dos lados.

**Por qué `caramel-deep` y `rose-deep`:** los chips de estado del admin pintan
el fondo con el acento al 15-20% y el texto con el acento pleno encima. Ahí el
óxido cae a 3.6:1 y el arcilla a 3.3:1, por debajo del 4.5:1 que pide texto de
12px. Las variantes oscurecidas suben a 5.6:1 y 5.4:1 manteniendo el mismo
código de color por estado.

**Se mantuvieron los nombres de token existentes** (`sand`, `ink`, `caramel`…)
en vez de renombrarlos a algo más literal. Cambiar los nombres obligaba a tocar
cada archivo del proyecto para un experimento que quizá se descarta; mantenerlos
hace que todo el código que no toqué herede la paleta nueva sin riesgo de
romperse.

### 2. Tipografía: de tres familias a dos con más rango

Antes: Cormorant Garamond (display) + Work Sans (body) + Caveat (manuscrita).

Ahora: **Fraunces** (display y acento) + **Karla** (body).

- **Fraunces** es una serif variable con ejes `SOFT` y `WONK` además del grosor.
  `SOFT` redondea los terminales, `WONK` cambia a glifos alternativos con
  inclinaciones raras. Con eso, una sola familia cubre dos voces: títulos
  editoriales (`SOFT 40, WONK 0`) y momentos de acento (`SOFT 100, WONK 1` +
  itálica). Es setentosa y artesanal, que es exactamente el registro
  boho-rockero de la marca — donde Cormorant, siendo bellísima, es la serif que
  ya usa todo el mundo.
- **Eliminé la manuscrita.** Era la solución fácil para "calidez de marca
  chica", pero Caveat es una handwriting genérica de Google y competía por
  atención con los títulos. Resolver el acento con la itálica wonky de la misma
  familia es una decisión más madura: una familia menos que cargar, y más
  coherencia.
- **Karla** para el cuerpo: grotesca con detalles peculiares que aguanta bien
  en tamaños chicos, sin la neutralidad total de Work Sans (ni el default de
  Inter).

### 3. Motion: `motion` (framer-motion), con red de seguridad

Se instaló `motion` para reveals al scrollear y micro-interacciones.

**El detalle importante no es la animación, es cómo falla.** El patrón habitual
(`initial={{opacity: 0}}` + `whileInView`) tiene una falla fea: si el
IntersectionObserver no reporta —hidratación rota, pestaña abierta en segundo
plano, navegador sin soporte— el contenido queda invisible **para siempre**. En
un catálogo eso es una grilla de productos en blanco: mucho peor que no tener
animación.

`components/ui/Reveal.jsx` resuelve eso con un timeout de 1200ms que muestra el
contenido igual si el observer no reportó, con la misma transición, así que en
el peor caso se ve intencional y no roto. Además respeta
`prefers-reduced-motion` renderizando directo en el estado final, sin pasar por
`opacity: 0` en ningún momento.

### 4. Hero: de tira de fotos a portada de viewport

Antes el hero eran 3 fotos en `aspect-[3/4]` con velo plano y texto centrado.
Ahora:

- **Altura de viewport** (`78vh` / `85vh`) en vez de aspect-ratio: en desktop
  ancho, el aspect-ratio dejaba el hero desproporcionadamente alto.
- **Degradado** en vez de velo parejo: las fotos se ven limpias arriba y la
  oscuridad se concentra abajo, donde va el texto.
- **Texto abajo a la izquierda**, no centrado: es la convención editorial de
  moda y deja el centro libre para que se vea la prenda.
- **El header se vuelve transparente sobre el hero** y toma fondo sólido con
  blur al scrollear. El logo se invierte a blanco mientras está encima (mismo
  filtro que usa `LogoMarquee`), porque el PNG es tinta oscura y sobre las
  fotos se perdía.
- El hero se movió entero a `HeroCarousel` (antes el texto vivía en la página y
  el carrusel en el componente, lo que obligaba a mantener dos alturas
  sincronizadas en archivos distintos — ya había causado un bug de layout).

### 5. Grillas y cards

- **ProductCard sin fondo de card**: la ficha va debajo de la foto, sin
  recuadro. La grilla se lee como una serie de fotos con su dato, no como una
  cuadrícula de cajas.
- **Hover**: zoom lento (900ms, curva `[0.22,1,0.36,1]`) + una barra "Ver
  prenda" que sube desde abajo.
- **El escalonado se reinicia por fila** (`(index % 4) * 0.08`) en vez de
  acumularse: con 10+ productos, un delay lineal dejaba el último entrando casi
  un segundo tarde.
- **Página de producto**: panel de compra `sticky` en desktop — con galerías de
  varias fotos, el selector de talle se iba de pantalla al scrollear.

---

## Qué se probó y se descartó

- **Renombrar los tokens** a nombres literales (`paper`, `espresso`, `rust`).
  Descartado: obligaba a tocar cada archivo del proyecto para un experimento
  que puede descartarse, con riesgo de romper algo no relacionado.
- **Reveal con `whileInView` puro**, sin fallback. Descartado al detectar que
  deja el contenido invisible si el observer no dispara (ver decisión 3).
- **Animar también el admin.** Descartado: la dueña carga productos ahí todos
  los días y ya se pidió explícitamente que nada haga más lento ese trabajo. El
  admin heredó paleta y tipografía por tokens, pero sin reveals ni transiciones
  largas.
- **Cursor personalizado y transiciones de página.** Descartados por costo/
  beneficio: el primero rompe en touch, el segundo es frágil con el App Router
  y el riesgo de regresión no se justificaba para un experimento visual.

---

## Verificación

`npm run build` sin errores.

**Probado en el navegador:**
- Home, categoría, producto, carrito, login del admin, dashboard, listado de
  productos y de pedidos: cargan sin errores de consola y sin scroll horizontal.
- **Flujo de compra completo**: seleccionar talle 38 → sumar cantidad a 2 →
  agregar al carrito → el item llega correcto al store (variante, talle, precio,
  cantidad) → la página de carrito muestra 1 línea con total $92.000 (2 ×
  $46.000) → inputs con labels asociados y botón "Hacer pedido" presente.
- **Estados de stock**: se montó una ruta temporal (ya borrada) que renderiza el
  selector real con stock 4, 0 y 1. Con stock: punto oliva y botón habilitado.
  Sin stock: punto arcilla, botón `disabled`, fondo atenuado. Última unidad:
  copy correcto. Hizo falta la ruta porque el único producto con stock 0 en la
  base está despublicado, y no quise tocar datos reales para un experimento.
- **Tipografía**: confirmado en el DOM que los ejes variables se aplican
  (`SOFT 40, WONK 0` en títulos; `SOFT 100, WONK 1` + itálica en acentos).
- **Contrastes**: calculados con la fórmula de WCAG antes de aplicar la paleta,
  y recalculados para los chips del admin.

**Lo que NO se pudo verificar en este entorno, y por qué:** ninguna animación.
El panel de preview no compositea, así que `document.hidden` es `true` y
`requestAnimationFrame` no corre — lo confirmé midiendo que un `rAF` no dispara
en 500ms, y que el `h1` del hero (que usa `initial`/`animate`, sin
IntersectionObserver de por medio) queda congelado en su estado inicial igual
que los reveals. Es la misma limitación del entorno ya documentada en fases
anteriores, no un problema del código: el `overflow` es `visible`, hay 3452px de
contenido contra 720px de viewport, y asignar `scrollTop` directamente tampoco
se aplica.

**Queda pendiente de mirar con ojos humanos:** que las animaciones se sientan
bien (duración, curva, si el escalonado molesta al scrollear rápido buscando una
prenda), y el cambio de estado del header al scrollear en la home.
