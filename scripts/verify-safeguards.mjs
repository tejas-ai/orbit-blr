async function verify() {
  const eventsRes = await fetch('http://localhost:3000/api/events');
  const eventsData = await eventsRes.json();
  const events = eventsData.events || eventsData;
  console.log('Events Count:', events.length);
  const expectedSlugs = [
    'hacktoberfest-hack-day-bengaluru-aws-atria-2026',
    'owasp-null-bangalore-monthly-meet-2026-10-24',
    'blrdroid-blrkotlin-october-2026-meetup-133',
    'software-architects-meetup-2026-10-24',
    'bangpypers-functional-programming-india-oct-24-2026',
    'hackman-x-2026-dsce-bengaluru',
    'gears-2026-global-higher-education-ai-readiness-summit',
    'beyond-llms-world-models-physical-ai-2026-10-31',
    'devforge-hackathon-yugaantar-2026'
  ];
  const allMatched = expectedSlugs.every(slug => events.some(e => e.slug === slug));
  console.log('All 9 published events match expected slugs:', allMatched);

  const adminRes = await fetch('http://localhost:3000/admin');
  console.log('/admin HTTP status:', adminRes.status);

  const adminApiRes = await fetch('http://localhost:3000/api/admin/events');
  console.log('/api/admin/events HTTP status:', adminApiRes.status);

  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  console.log('Has canonical tag:', homeHtml.includes('<link rel="canonical" href="https://orbit-blr.vercel.app"/>'));
  console.log('Has og:image:', homeHtml.includes('<meta property="og:image" content="https://orbit-blr.vercel.app/og-image.png"/>'));
  console.log('Has og:url:', homeHtml.includes('<meta property="og:url" content="https://orbit-blr.vercel.app"/>'));
  console.log('Has zero-FOIT script:', homeHtml.includes('localStorage.getItem(\'orbit_theme\')'));
}
verify();
