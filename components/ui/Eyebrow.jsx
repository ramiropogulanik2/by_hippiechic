// Texto manuscrito chico que va arriba de los títulos de sección.
// El caramel sobre el fondo ink del footer da 5.26:1 de contraste, así que
// pasa AA sin necesitar una variante de color aparte.
export default function Eyebrow({ children, className = "" }) {
  return (
    <p className={`mb-2 font-accent text-xl text-caramel ${className}`}>
      {children}
    </p>
  );
}
