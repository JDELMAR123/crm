"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

export type NavItem = {
  href: string;
  label: string;
  /** Para el enlace de Creador: se distingue incluso cuando no está activo. */
  special?: boolean;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Menú con un indicador que se desliza hasta la pestaña activa. */
export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative rounded-md px-3 py-1.5"
          >
            {active && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-md bg-brand/10"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span
              className={`relative ${
                active
                  ? "font-medium text-brand"
                  : item.special
                    ? "font-medium text-blue-600 opacity-90 hover:opacity-100 dark:text-blue-400"
                    : "opacity-70 hover:opacity-100"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
