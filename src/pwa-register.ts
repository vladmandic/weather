import { log } from './log';

const cacheName = 'weather';

export async function registerPWA(path) {
  if ('serviceWorker' in navigator) {
    try {
      let found;
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        log('pwa found:', reg.scope);
        if (reg.scope.startsWith(window.location.origin)) found = reg;
      }
      if (!found) {
        const reg = await navigator.serviceWorker.register(path, { scope: '/' });
        found = reg;
        log('pwa registered:', reg.scope);
      }
    } catch (err) {
      // @ts-ignore
      if (err.name === 'SecurityError') log('pwa error: ssl certificate is untrusted');
      else log('pwa error:', err);
    }
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({});
      log('pwa active:', navigator.serviceWorker.controller.scriptURL);
      const cache = await caches.open(cacheName);
      if (cache) {
        const content = await cache.matchAll();
        log('pwa cache:', content.length, 'files');
      }
    }
  } else {
    log('pwa inactive');
  }
}
