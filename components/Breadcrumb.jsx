import Link from "next/link";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center text-sm">
        {items.map((item, index) => (
          <li key={item.href ?? item.label} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="px-2 text-ink/40">
                /
              </span>
            )}

            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-caramel"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
