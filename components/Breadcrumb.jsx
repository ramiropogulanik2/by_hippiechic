import Link from "next/link";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center font-body text-[11px] uppercase tracking-[0.14em]">
        {items.map((item, index) => (
          <li key={item.href ?? item.label} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="px-2.5 text-ink/40">
                /
              </span>
            )}

            {item.href ? (
              <Link
                href={item.href}
                className="link-underline text-ink/70 transition-colors hover:text-caramel"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
