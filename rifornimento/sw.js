/* Rifornimento — service worker
   Prima la rete (gli aggiornamenti arrivano da soli), senza rete usa la copia salvata.
   Lavora solo dentro la cartella /rifornimento/. I dati restano in localStorage, non passano da qui. */
const CACHE = 'rifornimento-app';
const nellaCartella = url => url.startsWith(self.registration.scope);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png']).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n.startsWith('rifornimento-') && n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !nellaCartella(r.url)) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
        return res;
      })
      .catch(() => caches.open(CACHE).then(c =>
        c.match(r).then(m => m || c.match(new URL('index.html', self.registration.scope).href))))
  );
});
