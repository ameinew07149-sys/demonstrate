// 離線備援：有網路時一律抓最新版本，網路斷掉時才用上次存下的頁面。
// 讓導播台在飯店網路不穩時，重新整理頁面也能開得起來。素材本來就存在本機瀏覽器，不受影響。
const CACHE = 'amei-demo-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const allowed = url.origin === self.location.origin ||
    /(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$|(^|\.)cdnjs\.cloudflare\.com$/.test(url.hostname);
  if (!allowed) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(m => m || Response.error()))
  );
});
