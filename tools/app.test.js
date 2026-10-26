// Tallyo logic tests: node --test tools/
// Runs app.js in a sandbox with a tiny DOM stub and checks the pure parts through window.__tallyo.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = name => fs.readFileSync(path.join(root, name), 'utf8');

function boot(state, search = '') {
  const el = () => ({ innerHTML: '', hidden: true, textContent: '', firstChild: null, dataset: {}, classList: { add() {}, remove() {} }, addEventListener() {}, setAttribute() {}, removeAttribute() {} });
  const els = {};
  const store = state ? { 'moi-dengi-v2': JSON.stringify(state) } : {};
  const window = {
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    location: { href: 'https://x.test/tallyo/' + search, search, pathname: '/tallyo/', protocol: 'https:' },
    history: { replaceState() {} },
    navigator: { language: 'ru-RU' },
    document: {
      querySelector: s => els[s] || (els[s] = el()),
      addEventListener() {},
      documentElement: el(),
      createElement: el,
      body: el(),
    },
    setTimeout: () => 0, clearTimeout() {}, scrollTo() {},
    URLSearchParams, atob, escape, Date, Math, JSON, String, Number, Object, Array, RegExp, Promise,
    addEventListener() {},
  };
  window.window = window; window.self = window;
  vm.createContext(window);
  vm.runInContext(src('i18n.js'), window);
  vm.runInContext(src('app.js'), window);
  return { T: window.__tallyo, store };
}
const acc = [{ id: 'a1', name: 'MBank', cur: 'KGS', open: 0 }, { id: 'a2', name: 'USD card', cur: 'USD', open: 0 }];

test('start_param shortcuts parse into amount, method and kind', () => {
  const { T } = boot();
  const q = T.parseStart('qr-350');
  assert.strictEqual(q.get('amt'), '350'); assert.strictEqual(q.get('method'), 'qr');
  const ti = T.parseStart('ti-12d5');
  assert.strictEqual(ti.get('amt'), '12.5'); assert.strictEqual(ti.get('kind'), 'inc');
  assert.strictEqual(T.parseStart('nope'), null);
  const b = T.parseStart('b_' + Buffer.from('amt=99&note=Globus').toString('base64url'));
  assert.strictEqual(b.get('note'), 'Globus');
});

test('auto-category uses learned shops before rules, ignores generic notes', () => {
  const { T } = boot();
  assert.strictEqual(T.autoCat('Glovo order', 'exp'), 'food');
  T.learn('Coffee Point', 'exp', 'fun');
  assert.strictEqual(T.autoCat('coffee point', 'exp'), 'fun');
  assert.strictEqual(T.learn('QR', 'exp', 'food'), 0);
  assert.strictEqual(T.autoCat('QR', 'exp'), 'other');
});

test('duplicates are rejected', () => {
  const { T } = boot();
  const o = { ts: '2026-01-02 10:00', kind: 'exp', amt: 5, acc: 'a1', cat: 'food', note: 'x' };
  assert.ok(T.addTx(o)); assert.strictEqual(T.addTx(o), null);
});

test('cross-currency transfer credits the converted amount', () => {
  const { T } = boot({ accounts: acc, rates: { USD: 87, EUR: 0, RUB: 0, KZT: 0 } });
  assert.strictEqual(T.conv(870, 'KGS', 'USD'), 10);
  T.addTx({ ts: '2026-01-02 10:00', kind: 'tr', amt: 870, acc: 'a1', acc2: 'a2', amt2: 10, cat: 'transfers' });
  T.addTx({ ts: '2026-01-03 10:00', kind: 'tr', amt: 87, acc: 'a1', acc2: 'a2', cat: 'transfers' });
  assert.strictEqual(T.balance(T.S.accounts[0]), -957);
  assert.strictEqual(T.balance(T.S.accounts[1]), 11);
});

test('forecast: average, projection and daily allowance for the current month only', () => {
  const { T } = boot({ limit: 3000 });
  const now = new Date(2026, 9, 10);
  const f = T.forecast({ exp: 1000 }, 2026, 9, now);
  assert.strictEqual(f.avg, 100); assert.strictEqual(f.proj, 3100);
  assert.strictEqual(f.perDay, 2000 / 22);
  assert.strictEqual(T.forecast({ exp: 1000 }, 2026, 8, now), null);
  assert.strictEqual(T.forecast({ exp: 0 }, 2026, 9, now), null);
});

test('recurring payment on day 31 lands on the last day of short months', () => {
  const now = new Date();
  const ly = now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
  const lm = (now.getMonth() + 10) % 12; // two months ago
  const { T } = boot({ rec: [{ id: 'r1', name: 'Rent', amt: 100, kind: 'exp', cat: 'home', acc: 'a1', day: 31, last: ly + '-' + String(lm + 1).padStart(2, '0') }] });
  const prev = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month
  const want = prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0') + '-' + String(prev.getDate()).padStart(2, '0');
  assert.ok(T.S.tx.some(x => x.ts.slice(0, 10) === want), 'previous month entry on its last day');
});

test('pasted text lines import with sign and account', () => {
  const { T } = boot({ accounts: acc });
  const o = T.parseLine('2026-03-04 12:30;+1500;cash;Salary;usd card');
  assert.strictEqual(o.kind, 'inc'); assert.strictEqual(o.amt, 1500); assert.strictEqual(o.acc, 'a2');
  assert.strictEqual(T.parseLine('garbage'), null);
});

test('history shows day totals and pages long lists', () => {
  const { T } = boot();
  for (let i = 0; i < 250; i++) T.addTx({ ts: '2025-05-' + String(1 + (i % 28)).padStart(2, '0') + ' 10:' + String(i % 60).padStart(2, '0'), kind: 'exp', amt: 10, acc: 'a1', cat: 'food', note: 'n' + i });
  const h = T.opsList();
  assert.match(h, /data-act="more_ops"/);
  assert.match(h, /−\d/);
  T.ui.q = 'n249'; assert.doesNotMatch(T.opsList(), /more_ops/); T.ui.q = '';
});

test('broken saved records are dropped, string amounts kept, language survives wipe', () => {
  const { T } = boot({ lang: 'en', tx: [{ id: 'a', ts: '2026-01-01 10:00', kind: 'exp', amt: '12,5', acc: 'a1', cat: 'food' }, { id: 'b' }, null, { id: 'c', ts: 'bad', amt: 5, acc: 'a1' }] });
  assert.strictEqual(T.S.tx.length, 1); assert.strictEqual(T.S.tx[0].amt, 12.5); assert.strictEqual(T.S.tx[0].method, 'other');
  T.ui.armed = 'w'; T.A.wipe({ textContent: '' });
  assert.strictEqual(T.S.lang, 'en'); assert.strictEqual(T.S.tx.length, 0);
});

test('unknown payment method in pasted text becomes other', () => {
  const { T } = boot();
  assert.strictEqual(T.parseLine('2026-03-04 12:30;-15;bitcoin;Tea').method, 'other');
  assert.strictEqual(T.parseLine('2026-03-04 12:30;-15;qr;Tea').method, 'qr');
});
