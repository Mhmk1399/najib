"use client";

import Link from "next/link";
import { Images, LayoutTemplate, Package } from "lucide-react";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/catalog/products", label: "Products", detail: "The ledger", icon: Package },
  { href: "/catalog/content", label: "Page composer", detail: "Campaign pages", icon: LayoutTemplate },
  { href: "/catalog/images", label: "Image stories", detail: "Assets & hotspots", icon: Images },
];

export function CatalogSectionNav() {
  const pathname = usePathname();
  return (
    <nav className="catalog-section-nav" aria-label="Catalog workspaces">
      <span className="catalog-section-nav__label">Catalog desk</span>
      <div>
        {destinations.map(({ href, label, detail, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link href={href} key={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <Icon size={15} strokeWidth={1.6} />
              <span><strong>{label}</strong><small>{detail}</small></span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
