import Link from "next/link";

export function LocationBreadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-[#5d6e64]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#1c2b23]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1c2b23] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
