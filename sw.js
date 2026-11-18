/* keeps a copy of the page on the device, so the station can be opened with no network.
   online it always asks the site for the fresh page, past the browser's own cache, because everyone has to be running the same music */
const CACHE = 'galaverna-1';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('galaverna-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), keep = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => res.ok ? keep(res) : res).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(keep)));
  }
});
