"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// Aparición al entrar en viewport. Se usa en las secciones y en los items de
// las grillas (con `delay` incremental para que entren escalonados).
//
// El movimiento es corto a propósito (16px): el objetivo es que el contenido
// "asiente" al llegar, no que se note una animación. Curvas más largas o
// desplazamientos más grandes se leen como demora, sobre todo en el catálogo
// donde se scrollea rápido buscando una prenda.
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  // Red de seguridad. El patrón habitual (initial opacity 0 + whileInView)
  // tiene una falla fea: si el IntersectionObserver no reporta —hidratación
  // que se rompe, pestaña abierta en segundo plano, un navegador que no lo
  // soporta— el contenido queda invisible PARA SIEMPRE. En un catálogo eso
  // significa una grilla de productos en blanco, mucho peor que no tener
  // animación. Pasado el timeout se muestra igual, con la misma transición,
  // así que en el peor caso se ve intencional y no roto.
  const [fallbackVisible, setFallbackVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFallbackVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Con "reducir movimiento" activado no se anima nada: se renderiza en su
  // estado final, sin pasar por opacity 0 en ningún momento.
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const MotionTag = motion[as] ?? motion.div;
  const show = isInView || fallbackVisible;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
