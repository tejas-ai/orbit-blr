import { NextRequest, NextResponse } from "next/server";
import pg from "pg";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const trusted = new Set(["luma.com","lu.ma","fossunited.org","meetup.com","www.meetup.com","yugaantar.org"]);
const imageHosts = new Set(["images.lumacdn.com","fossunited.org","secure.meetupstatic.com","yugaantar.org"]);
function hostAllowed(host: string, domains: Set<string>) { return domains.has(host.toLowerCase()); }
async function publicUrl(value: string, domains: Set<string>) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !hostAllowed(url.hostname,domains) || url.username || url.password || url.port) throw Error("Untrusted URL");
  const addresses = await lookup(url.hostname,{all:true});
  if (!addresses.length || addresses.some(a=>isIP(a.address)===4 ? /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(a.address) : /^(::1|fc|fd|fe80)/i.test(a.address))) throw Error("Nonpublic host");
  return url;
}
async function fetchSafe(url: URL, domains: Set<string>) {
  await publicUrl(url.toString(),domains);
  const res = await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(7000),headers:{"User-Agent":"ORBIT-BLR-PosterVerifier/1.0"}});
  if (!res.ok || res.status>=300) throw Error("Fetch rejected");
  return res;
}
function meta(html:string, property:string) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  for(const tag of tags) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));
    if(attrs.property===property || attrs.name===property) return attrs.content;
  }
  return null;
}
export async function POST(req:NextRequest) {
  if(!process.env.THUMBNAIL_CRON_SECRET || req.headers.get("authorization")!==`Bearer ${process.env.THUMBNAIL_CRON_SECRET}`) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!process.env.DATABASE_URL) return NextResponse.json({error:"Database not configured"},{status:503});
  const pool = new pg.Pool({connectionString:process.env.DATABASE_URL,max:1});
  const results:Record<string,string>={};
  try {
    const {rows}=await pool.query("SELECT id,name,registration_url FROM events WHERE publication_status='published' AND (thumbnail_url IS NULL OR thumbnail_verification_status='unverified') ORDER BY start_at LIMIT 20");
    for(const row of rows) {
      try {
        const page=await publicUrl(row.registration_url,trusted);
        const html=(await (await fetchSafe(page,trusted)).text()).slice(0,500000);
        const raw=meta(html,"og:image") || meta(html,"twitter:image");
        if(!raw) {results[row.id]="no official image";continue;}
        const imageUrl=await publicUrl(new URL(raw,page).toString(),imageHosts);
        const image=await fetchSafe(imageUrl,imageHosts);
        if(!(image.headers.get("content-type")||"").startsWith("image/")) throw Error("Not an image");
        const bytes=Number(image.headers.get("content-length")||0);
        if(bytes>10000000) throw Error("Image too large");
        // Metadata discovery is not sufficient to establish exact-event identity or rights.
        // Store candidate only in verification_notes, never publish an unreviewed thumbnail.
        await pool.query("UPDATE events SET verification_notes=concat_ws(E'\\n',verification_notes,$2),updated_at=now() WHERE id=$1 AND thumbnail_url IS NULL",[row.id,`Thumbnail candidate (review required): ${imageUrl.toString()} | source: ${page.toString()}`]);
        results[row.id]="candidate saved for review";
      }catch(e){results[row.id]=e instanceof Error?e.message:"failed";}
    }
    return NextResponse.json({processed:rows.length,results});
  } finally {await pool.end();}
}
