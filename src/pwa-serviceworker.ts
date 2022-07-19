/// <reference lib="webworker" />

const cacheActive = false;
const cacheName = 'weather';
const offlinePage = 'offline.html';
const cacheFiles = ['/favicon.ico', '/weather.webmanifest', '/public/offline.html']; // assets and models are cached on first access

let listening = false;
const stats = { hit: 0, miss: 0 };

const log = (...msg) => {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  console.log(ts, 'pwa', ...msg); // eslint-disable-line no-console
};

async function updateCached(req) {
  fetch(req)
    .then((update) => {
      // update cache if request is ok
      if (update.ok) {
        caches
          .open(cacheName)
          .then((cache) => cache.put(req, update))
          .catch((err) => log('cache update error', err));
      }
      return true;
    })
    .catch((err) => {
      log('fetch error', err);
      return false;
    });
}

async function getCached(evt) {
  if (!cacheActive) return fetch(evt.request); // just fetch
  let found = await caches.match(evt.request); // get from cache or fetch if not in cache
  if (found && found.ok) {
    stats.hit += 1;
  } else {
    stats.miss += 1;
    found = await fetch(evt.request);
  }
  if (!found || !found.ok) found = await caches.match(offlinePage); // if still don't have it, return offline page
  if (found && found.type === 'basic' && found.ok) updateCached(evt.request); // update cache in the background
  return found;
}

function cacheInit() {
  caches.open(cacheName)
    .then((cache) => cache.addAll(cacheFiles)
      .then(
        () => log('cache refresh:', cacheFiles.length, 'files'),
        (err) => log('cache error', err),
      ));
}

if (!listening) {
  self.addEventListener('message', (evt: MessageEvent) => { // eslint-disable-line no-restricted-globals
    // get messages from main app to update configuration
    log('event message:', evt.data);
  });

  self.addEventListener('install', (evt) => { // eslint-disable-line no-restricted-globals
    log('install');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-restricted-globals
    (self as any).skipWaiting();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (evt as any).waitUntil(cacheInit);
  });

  self.addEventListener('activate', (evt) => { // eslint-disable-line no-restricted-globals
    log('activate');
    (evt as any).waitUntil((self as any).clients.claim()); // eslint-disable-line @typescript-eslint/no-explicit-any, no-restricted-globals
  });

  self.addEventListener('fetch', (evt) => { // eslint-disable-line no-restricted-globals
    const uri = new URL(evt.request.url);
    // if (uri.pathname === '/') { log('cache skip /', evt.request); return; } // skip root access requests
    if (evt.request.cache === 'only-if-cached' && evt.request.mode !== 'same-origin') return; // required due to chrome bug
    // eslint-disable-next-line no-restricted-globals
    if (uri.origin !== location.origin) return; // skip non-local requests
    if (evt.request.method !== 'GET') return; // only cache get requests
    if (evt.request.url.includes('/api/')) return; // don't cache api requests, failures are handled at the time of call

    const response = getCached(evt);
    if (response) evt.respondWith(response);
    else log('fetch response missing');
  });

  // only trigger controllerchange once
  let refreshed = false;
  self.addEventListener('controllerchange', (evt) => { // eslint-disable-line no-restricted-globals
    log(`PWA: ${evt.type}`);
    if (refreshed) return;
    refreshed = true;
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  });

  listening = true;
}
