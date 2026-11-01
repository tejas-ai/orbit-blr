"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Menu, Orbit, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import UserMenu from "@/components/auth/UserMenu";
import { useSavedEvents } from "@/lib/useSavedEvents";
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { savedCount } = useSavedEvents();
  const ref = useRef<HTMLElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); menu.current?.focus(); } };
    const outside = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", key); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header ref={ref} className="site-header">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="header-inner"><Link href="/" className="orbit-brand" aria-label="ORBIT BLR home"><span className="brand-mark"><Orbit size={24} /></span><span>ORBIT <b>BLR</b></span></Link>
      <nav aria-label="Main navigation" className="desktop-navigation"><Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Discover</Link><Link href="/suggest">Submit an event <span aria-hidden="true">↗</span></Link></nav>
      <div className="header-actions"><Link href="/saved" className="icon-button" aria-label={`Saved events${savedCount ? `, ${savedCount} saved` : ""}`}><Bookmark size={20} />{savedCount > 0 && <span className="saved-dot" />}</Link><UserMenu />
        <button ref={menu} type="button" className="icon-button mobile-menu-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-navigation"><Link href="/" onClick={() => setOpen(false)}>Discover</Link><Link href="/suggest" onClick={() => setOpen(false)}>Submit an event</Link><Link href="/about" onClick={() => setOpen(false)}>About ORBIT BLR</Link></nav>}
  </header>;
}
