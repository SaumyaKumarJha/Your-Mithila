import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span style={{ color: "var(--border)" }}>›</span>}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-[var(--primary)] transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
