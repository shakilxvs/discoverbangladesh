import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Visible breadcrumb nav. Pair with breadcrumbJsonLd() below so the
// structured data matches exactly what's rendered on screen.
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-neutral-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-river-600 dark:hover:text-river-400">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : undefined,
    })),
  };
}
