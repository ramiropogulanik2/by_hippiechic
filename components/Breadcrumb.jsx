import Link from "next/link";
import Arrow from "@/components/ui/Arrow";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center gap-3 text-sm">
        {items.map((item, index) => (
          <li key={item.href ?? item.label} className="flex items-center gap-3">
            {index > 0 && <Arrow className="h-2 w-8 shrink-0 text-caramel" />}

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
