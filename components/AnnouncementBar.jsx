// Cambio #5 del handoff: barra de anuncio en negro arriba de todo.
//
// No es sticky a propósito: se lee una vez al entrar y después deja el
// espacio libre para el header, que sí queda fijo. Si las dos se pegaran
// arriba, el hero perdería ~120px de alto útil en mobile.
export default function AnnouncementBar() {
  return (
    <div className="bg-ink px-5 py-2.5 text-center font-body text-[10px] uppercase tracking-[0.2em] text-sand sm:py-3 sm:text-[11px] sm:tracking-[0.22em]">
      Envíos a todo el país · Showroom en Córdoba con cita previa
    </div>
  );
}
