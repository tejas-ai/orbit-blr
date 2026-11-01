// Local QA only: copy the previously fetched public API snapshot to an isolated SQLite file.
// No production connection or event writes. The default development database is not touched.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('qa-results/india-discovery');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'live-events.json'),'utf8'));
const file=path.join(root,'snapshot.db');
const db=new DatabaseSync(file);
const fields=Array.from(new Set(snapshot.events.flatMap(Object.keys)));
db.exec(`CREATE TABLE IF NOT EXISTS events (${fields.map(k=>`"${k}" ${['is_free','is_in_person','approval_required','featured'].includes(k)?'INTEGER':'TEXT'}`).join(',')})`);
if(db.prepare('SELECT count(*) as n FROM events').get().n===0) {
  const insert=db.prepare(`INSERT INTO events (${fields.map(k=>`"${k}"`).join(',')}) VALUES (${fields.map(()=>'?').join(',')})`);
  for(const event of snapshot.events) insert.run(...fields.map(k=>{const v=event[k];return v==null?null:typeof v==='boolean'?Number(v):typeof v==='object'?JSON.stringify(v):v;}));
}
console.log(`Isolated public snapshot: ${snapshot.events.length} events at ${file}`);
db.close();
