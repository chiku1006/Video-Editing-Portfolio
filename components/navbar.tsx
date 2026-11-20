"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import localFont from "next/font/local";
import Link from "next/link";
import { usePathname } from "next/navigation";
const satoshi = localFont({
  src: "../public/fonts/Satoshi-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-satoshi",
});
const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "My Work" },
  { href: "/info", label: "Info" },
  { href: "/hire", label: "Hire Me ↗" },
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        header.current,
        { y: -12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
    });
    return () => media.revert();
  }, []);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 641px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", resize);
    window.addEventListener("popstate", close);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", resize);
      window.removeEventListener("popstate", close);
    };
  }, [open]);
  return (
    <header className={`site-header ${satoshi.variable}`} ref={header}>
      <nav aria-label="Main navigation" className="nav-shell">
        <Link
          href="/"
          className="logo"
          data-magnetic=""
          aria-label="Soumen Mandal — Home"
          onClick={() => setOpen(false)}
        >
          sm.
        </Link>
        <div className="desktop-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.href === "/hire" ? "nav-cta" : "nav-link"}
              aria-current={pathname === link.href ? "page" : undefined}
              data-magnetic=""
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <span
            className={`menu-icon ${open ? "is-open" : ""}`}
            aria-hidden="true"
          >
            <i />
            <i />
          </span>
        </button>
      </nav>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className="mobile-links"
        hidden={!open}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
