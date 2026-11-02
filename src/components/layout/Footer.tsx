import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p><strong>ORBIT BLR</strong><span>Built in Bengaluru. Discover across India.</span></p>
        <nav aria-label="Footer"><Link href="/about">About</Link><Link href="/about#verification">Our checks</Link><Link href="/privacy">Privacy</Link></nav>
        <Link href="/about#creator" className="mt-3 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 transition-colors hover:border-violet-400/60">
          <img src="/tejas-profile.svg" alt="" width="38" height="38" loading="lazy" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-left text-xs leading-5"><span className="block opacity-70">Created by</span><strong className="block">Tejas Handigol ↗</strong></span>
        </Link>
        <nav aria-label="Creator social profiles" className="mt-3 flex flex-wrap gap-4 text-xs">
          <a href="https://www.linkedin.com/in/tejashandigol" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/tejas-ai" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href="https://www.instagram.com/tejas__8055/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
        </nav>
        <p className="footer-credit">© {new Date().getFullYear()} ORBIT BLR · By Tejas Handigol</p>
      </div>
    </footer>
  );
}
