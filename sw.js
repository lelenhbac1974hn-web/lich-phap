/* Lịch Pháp — bộ đệm chạy không cần mạng. © 2026 Lê Lệnh Bắc
   Mỗi lần phát hành bản mới: đổi số phiên bản ở dòng dưới. */
const C = 'lp-v1.9.0';
const F = ['./', 'index.html', 'style.css', 'lich-phap.js', 'le-tet.js', 'ngoc-hap.js', 'bieu-tuong.js', 'ui.js', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png',
  'be-vietnam-pro-latin-300-italic.woff2', 'be-vietnam-pro-latin-400-normal.woff2',
  'be-vietnam-pro-latin-500-normal.woff2', 'be-vietnam-pro-latin-600-normal.woff2',
  'be-vietnam-pro-latin-700-normal.woff2', 'be-vietnam-pro-vietnamese-300-italic.woff2',
  'be-vietnam-pro-vietnamese-400-normal.woff2', 'be-vietnam-pro-vietnamese-500-normal.woff2',
  'be-vietnam-pro-vietnamese-600-normal.woff2', 'be-vietnam-pro-vietnamese-700-normal.woff2',
  'bodoni-moda-latin-700-normal.woff2', 'bodoni-moda-latin-900-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(F)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
/* Có mạng thì lấy bản mới nhất và cập nhật bộ đệm; mất mạng thì dùng bộ đệm */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
