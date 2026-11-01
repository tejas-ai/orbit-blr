import Link from "next/link";
export default function Footer() {
  return <footer className="site-footer"><div><p><strong>ORBIT BLR</strong><span>Built in Bengaluru. Discover across India.</span></p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/about#verification">Our checks</Link><Link href="/privacy">Privacy</Link></nav><p className="footer-credit">© {new Date().getFullYear()} ORBIT BLR · By Tejas Handigol</p></div></footer>;
}
