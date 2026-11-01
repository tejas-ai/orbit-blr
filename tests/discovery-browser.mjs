import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { filterDiscovery } from '../src/lib/discovery.ts';
import { isHackathonEvent } from '../src/lib/hackathons.ts';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const out = 'qa-results/india-discovery';
fs.mkdirSync(out,{recursive:true});
const report = { base, checks: [], viewports: [], accessibility: [], errors: [] };
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const check = (label, condition) => { assert.ok(condition,label); report.checks.push(label); };
try {
  const page = await browser.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  const response = await fetch(`${base}/api/events`);
  check('public API available',response.ok);
  const all = await response.json();
  check('API envelope preserved',all.success && all.count === all.events.length);
  check('no expired/unpublished records',all.events.every(e=>e.publication_status === 'published' && Date.parse(e.end_at)>Date.now()));
  for(const type of ['events','hackathons']) for(const price of ['free','paid']) {
    const data = await (await fetch(`${base}/api/events?type=${type}&price=${price}`)).json();
    check(`${price} ${type} API`,JSON.stringify(data.events.map(e=>e.id))===JSON.stringify(filterDiscovery(all.events,{type,price}).map(e=>e.id)));
  }
  for(const dateFilter of ['today','weekend','weekday','next_7_days']) {
    const data = await (await fetch(`${base}/api/events?when=${dateFilter}`)).json();
    check(`${dateFilter} API`,JSON.stringify(data.events.map(e=>e.id))===JSON.stringify(filterDiscovery(all.events,{dateFilter}).map(e=>e.id)));
  }
  const combo = await (await fetch(`${base}/api/events?q=AI&city=Bengaluru&type=events&price=free&when=next_7_days`)).json();
  check('combined API filters',JSON.stringify(combo.events.map(e=>e.id))===JSON.stringify(filterDiscovery(all.events,{search:'AI',city:'Bengaluru',type:'events',price:'free',dateFilter:'next_7_days'}).map(e=>e.id)));
  for (const query of ['type=bad','price=bad','when=bad']) check(`invalid ${query} rejected`,(await fetch(`${base}/api/events?${query}`)).status===400);
  for (const path of ['/admin','/admin/events/new','/api/admin','/api/admin/auth','/api/admin/events','/api/admin/events/import','/api/admin/events/review','/api/admin/events/status','/api/admin/events/test','/api/admin/retired']) {
    for (const method of ['GET','POST']) check(`${method} ${path} remains retired`,(await fetch(base+path,{method})).status===404);
  }
  for(const event of all.events) check(`detail ${event.slug}`,(await fetch(`${base}/events/${event.slug}`)).ok);
  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.goto(base,{waitUntil:'networkidle0'});
  await page.waitForSelector('.discovery-control');
  const clickText = async text => { const found = await page.evaluate(t => { const el=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===t || e.textContent.trim().startsWith(t)); if(el) {el.click();return true;} return false; },text); assert.ok(found,`button ${text}`); };
  const waitDialog = () => page.waitForSelector('dialog[open]');
  check('advanced controls hidden initially',await page.$('input[name="price"]')===null);
  await page.screenshot({path:`${out}/desktop.png`,fullPage:true});
  await page.click('button[aria-controls="advanced-filter-options"]'); await waitDialog();
  check('only Type, Price, When groups',await page.$$eval('dialog legend',els=>els.map(e=>e.textContent).join(','))==='Type,Price,When');
  await page.screenshot({path:`${out}/desktop-filters.png`,fullPage:false});
  const count = await page.$$eval('[data-testid="event-card"]',els=>els.length);
  await page.click('input[name="price"][value="paid"]');
  check('draft does not change results',await page.$$eval('[data-testid="event-card"]',els=>els.length)===count);
  await page.keyboard.press('Escape'); await page.waitForSelector('dialog',{hidden:true});
  check('Escape returns focus',await page.$eval('button[aria-controls="advanced-filter-options"]',e=>document.activeElement===e));
  await page.click('button[aria-controls="advanced-filter-options"]'); await waitDialog();
  check('dismissed draft discarded',await page.$eval('input[name="price"][value="all"]',e=>e.checked));
  await page.click('input[name="type"][value="hackathons"]'); await page.click('input[name="price"][value="paid"]'); await clickText('Apply Filters');
  await page.waitForSelector('dialog',{hidden:true});
  check('Apply persists URL',page.url().includes('price=paid') && page.url().includes('type=hackathons'));
  check('empty results state',await page.$('.discovery-empty')!==null);
  await page.reload({waitUntil:'networkidle0'});
  check('refresh retains active filters',await page.$eval('.filter-count',e=>e.textContent)==='2');
  await page.goto(`${base}/?q=AI&city=Bengaluru&type=hackathons&price=paid&when=weekend`,{waitUntil:'networkidle0'});
  await page.click('button[aria-controls="advanced-filter-options"]'); await waitDialog(); await clickText('Reset');
  check('Reset preserves search and city',await page.$eval('input[type="search"]',e=>e.value)==='AI' && page.url().includes('city=Bengaluru'));
  check('Reset clears only advanced state',!page.url().includes('price=') && !page.url().includes('type=') && !page.url().includes('when='));
  await page.keyboard.press('Escape');
  await page.click('button[aria-controls="advanced-filter-options"]'); await waitDialog(); await page.mouse.click(10,10); await page.waitForSelector('dialog',{hidden:true});
  check('outside click closes dialog',await page.$('dialog[open]')===null);
  await page.goto(base,{waitUntil:'networkidle0'});
  await page.click('.location-control'); await waitDialog();
  await page.type('input[placeholder="Search any Indian city"]','Mysuru'); await page.keyboard.press('Enter');
  await page.waitForSelector('dialog',{hidden:true});
  check('custom city supported',page.url().includes('city=Mysuru'));
  await page.goto(base,{waitUntil:'networkidle0'});
  check('saved city restored',await page.$eval('.location-control',e=>e.textContent)==='Mysuru');
  await page.goto(`${base}/?city=all`,{waitUntil:'networkidle0'});
  if(all.events.length) {
    const save = '[data-testid="event-card"] button[aria-pressed]';
    await page.click(save); check('save updates',await page.$eval(save,e=>e.getAttribute('aria-pressed'))==='true');
    await page.goto(`${base}/saved`,{waitUntil:'networkidle0'}); check('bookmark survives navigation',await page.$('[data-testid="event-card"]')!==null);
  }
  await page.goto(`${base}/hackathons`,{waitUntil:'networkidle0'});
  check('legacy hackathon route preserved',page.url().includes('type=hackathons'));
  check('hackathon directory correct',await page.$$eval('.event-kind',els=>els.every(e=>e.textContent==='Hackathon')));
  for(const [width,height] of [[320,640],[375,667],[390,844],[430,932],[768,1024],[1024,768],[1440,1000],[1920,1080]]) {
    await page.setViewport({width,height,deviceScaleFactor:1,isMobile:width<640,hasTouch:width<640});
    await page.goto(`${base}/?city=all`,{waitUntil:'networkidle0'});
    const overflow = await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth,offenders:[...document.querySelectorAll('main *,header *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left < -1||r.right>innerWidth+1);}).map(e=>e.tagName+'.'+e.className).slice(0,10)}));
    check(`no horizontal overflow at ${width}`,overflow.document<=width && overflow.offenders.length===0);
    const targets = await page.$$eval('.discovery-control,.event-discovery-card button,.header-actions button,.header-actions > a',els=>els.map(e=>({label:e.getAttribute('aria-label')||e.textContent,h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})).filter(e=>e.h>0 && e.w>0 && (e.h<44||e.w<44)));
    check(`44px primary targets at ${width}`,targets.length===0);
    if(width===390) await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
    if(width<640) await page.tap('button[aria-controls="advanced-filter-options"]'); else await page.click('button[aria-controls="advanced-filter-options"]');
    await waitDialog();
    const rect=await page.$eval('dialog',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scroll:e.scrollWidth,client:e.clientWidth};});
    check(`filter fits at ${width}`,rect.x>=0 && rect.y>=0 && rect.x+rect.width<=width+1 && rect.y+rect.height<=height+1 && rect.scroll<=rect.client);
    report.viewports.push({width,height,dialog:rect});
    if(width===390) await page.screenshot({path:`${out}/mobile-filters.png`,fullPage:false});
    if(width===390 || width===1440) {
      if(fs.existsSync('node_modules/axe-core/axe.min.js')) {
        await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
        const axe=await page.evaluate(async()=>{const r=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
        report.accessibility.push({width,state:'filter-open',violations:axe});
      }
    }
    await page.keyboard.press('Escape');
    if((width===390 || width===1440) && fs.existsSync('node_modules/axe-core/axe.min.js')) {
      const axe=await page.evaluate(async()=>{const r=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
      report.accessibility.push({width,state:'closed',violations:axe});
    }
  }
  check('no browser runtime errors',report.errors.length===0);
  check('axe has no violations',report.accessibility.every(a=>a.violations.length===0));
  console.log(JSON.stringify({checks:report.checks.length,viewports:report.viewports.length,accessibility:report.accessibility,errors:report.errors},null,2));
} catch(e) { report.failure=e.stack; console.error(e); process.exitCode=1; }
finally { fs.writeFileSync(`${out}/browser-report.json`,JSON.stringify(report,null,2)); await browser.close(); }
