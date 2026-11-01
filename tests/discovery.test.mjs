import test from 'node:test';
import assert from 'node:assert/strict';
import { filterDiscovery, matchesDate, priceLabel, priceStatus, eventCity, eventFormat, readDiscoveryParams } from '../src/lib/discovery.ts';
import { isHackathonEvent } from '../src/lib/hackathons.ts';
const now = Date.parse('2026-11-01T00:15:00+05:30'); // Sunday, still Saturday in UTC.
const base = { id: 'event', name: 'AI workshop', category: 'Developer', organizer: 'Community', description: 'Discuss hackathon projects', city: 'Bengaluru', venue: 'Campus', area: 'Indiranagar', address: 'Bengaluru', topics_covered: ['AI'], start_at: '2026-11-01T10:00:00+05:30', end_at: '2026-11-01T18:00:00+05:30', is_free: true, is_in_person: true, last_verified_at: '2026-10-31T12:00:00Z', publication_status: 'published' };
const fixtures = [base, { ...base, id: 'hack-free', category: 'Hackathons' }, { ...base, id: 'event-paid', is_free: false }, { ...base, id: 'hack-paid', category: 'Hackathons', is_free: false }];
for (const [type, price, expected] of [['events','free','event'], ['hackathons','free','hack-free'], ['events','paid','event-paid'], ['hackathons','paid','hack-paid']]) {
  test(`${price} ${type} combine without contamination`, () => assert.deepEqual(filterDiscovery(fixtures, { type, price }, now).map(e=>e.id), [expected]));
}
test('all five conditions combine including topic/organiser/location', () => {
  assert.deepEqual(filterDiscovery(fixtures, { search: 'AI Community Bengaluru', city: 'Bangalore', type: 'hackathons', price: 'paid', dateFilter: 'today' }, now).map(e=>e.id), ['hack-paid']);
});
test('IST midnight is used instead of UTC day', () => assert.equal(matchesDate(base, 'today', now), true));
test('today excludes tomorrow and past records', () => {
  assert.equal(matchesDate({...base,start_at:'2026-11-02T01:00:00+05:30',end_at:'2026-11-02T02:00:00+05:30'},'today',now),false);
  assert.equal(filterDiscovery([{...base,end_at:'2026-10-31T23:59:00+05:30'}],{},now).length,0);
});
test('weekend is Saturday/Sunday and includes a Friday-to-Sunday event', () => {
  assert.equal(matchesDate({...base,start_at:'2026-10-30T10:00:00+05:30'},'weekend',now),true);
  assert.equal(matchesDate({...base,start_at:'2026-11-02T10:00:00+05:30',end_at:'2026-11-02T18:00:00+05:30'},'weekend',now),false);
});
test('weekday includes a Sunday-to-Monday event and excludes Sunday-only', () => {
  assert.equal(matchesDate({...base,end_at:'2026-11-02T18:00:00+05:30'},'weekday',now),true);
  assert.equal(matchesDate(base,'weekday',now),false);
});
test('next seven days include today plus six days, exclusive final midnight', () => {
  assert.equal(matchesDate(base,'next_7_days',now),true);
  assert.equal(matchesDate({...base,start_at:'2026-11-07T23:30:00+05:30',end_at:'2026-11-08T02:00:00+05:30'},'next_7_days',now),true);
  assert.equal(matchesDate({...base,start_at:'2026-11-08T00:00:00+05:30',end_at:'2026-11-08T02:00:00+05:30'},'next_7_days',now),false);
});
test('multi-day overlap and end-exclusive midnight', () => {
  assert.equal(matchesDate({...base,start_at:'2026-10-31T10:00:00+05:30',end_at:'2026-11-02T18:00:00+05:30'},'today',now),true);
  assert.equal(matchesDate({...base,start_at:'2026-11-06T10:00:00+05:30',end_at:'2026-11-07T00:00:00+05:30'},'weekend',now),false);
});
test('no unsupported amounts or prizes displayed as fees', () => {
  assert.equal(priceLabel({...base,is_free:false,hackathon_details:{total_prize_pool:'₹50,000'}}),'Price not confirmed');
  assert.equal(priceLabel({...base,is_free:false,fee_amount:499,fee_currency:'INR'}),'Price not confirmed');
  assert.equal(priceLabel({...base,is_free:false,fee_amount:499,fee_currency:'INR',fee_source_url:'https://example.org/event',fee_verified_at:base.last_verified_at}),'₹499.00');
  assert.equal(priceStatus({...base,price_status:'unknown'}),'unknown');
  assert.equal(priceStatus({...base,last_verified_at:null}),'unknown');
});
test('city is data-driven; missing city never defaults to Bengaluru', () => {
  assert.equal(eventCity({...base,city:'Mysuru'}),'Mysuru');
  assert.equal(eventCity({...base,city:null,address:'',venue:'TBA',area:'TBA'}),null);
  assert.equal(eventCity({...base,city:null,address:'Noida, India'}),'Delhi NCR');
});
test('online and hybrid formats stay distinct', () => {
  assert.equal(eventFormat({...base,event_format:'hybrid'}),'hybrid');
  assert.equal(filterDiscovery([{...base,event_format:'online',city:null}],{city:'Bengaluru'},now).length,1); // explicit legacy Bengaluru address remains a city fact
  assert.equal(filterDiscovery([{...base,event_format:'online',city:null,address:'',venue:'Online',area:''}],{city:'online'},now).length,1);
});
test('unpublished/cancelled/archived never shown; no search matches yields empty', () => {
  for (const publication_status of ['pending_review','archived','cancelled']) assert.equal(filterDiscovery([{...base,publication_status}],{},now).length,0);
  assert.equal(filterDiscovery(fixtures,{search:'zzzz no match'},now).length,0);
});
test('description mentioning hackathons is not classification', () => {
  assert.equal(isHackathonEvent(base),false);
  assert.equal(isHackathonEvent({...base,event_type:'events',name:'How to host a hackathon'}),false);
  assert.equal(isHackathonEvent({...base,hackathon_details:{team_size:'2–4'}}),true);
});
test('URLs preserve type/price/date and legacy hackathon links', () => {
  assert.deepEqual(readDiscoveryParams(new URLSearchParams('q=AI&city=Mumbai&type=hackathons&price=paid&when=weekday')), {search:'AI',city:'Mumbai',type:'hackathons',price:'paid',dateFilter:'weekday'});
  assert.equal(readDiscoveryParams(new URLSearchParams('category=Hackathons')).type,'hackathons');
});
