/* Laboratorio — service worker
   Gestisce solo la pagina iniziale e le sue icone: le app nelle sottocartelle hanno il loro service worker.
   Prima la rete, senza rete usa la copia salvata. */
const CACHE = 'laboratorio-app';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const mio = url => FILES.some(f => new URL(f, self.registration.scope).href === url.split('?')[0]);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !mio(r.url)) return;
  e.respondWith(
    fetch(r)
      .then(res => { if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(r, copia)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match(new URL('index.html', self.registration.scope).href)))
  );
});
