/* Lịch Pháp — bộ đệm chạy không cần mạng. © 2026 Lê Lệnh Bắc
   Mỗi lần phát hành bản mới: đổi số phiên bản ở dòng dưới (perl nguon-csdl/cong-cu/dat-phien-ban.pl a.b.c).
   Mở app: lấy ngay bộ đệm (nhanh cả khi sóng yếu), đồng thời tải bản mới ở nền cho lần mở sau. */
const C = 'lp-v1.43.1';
const F = ['./', 'index.html', 'style.css', 'lich-phap.js', 'le-tet.js', 'thoi-tiet.js','ngoc-hap.js', 'luan-giai.js', 'luan-sach.js', 'luan-van-mau.js', 'luan-van.js', 'gio-phep.js', 'bieu-tuong.js', 'ui-chung.js', 'ui-to-lich.js', 'ui-gio-thang.js', 'ui-sao.js', 'ui-nhac.js', 'ma-nang-cao.js', 'ui-nang-cao.js', 'ui-khoi-dong.js', 'manifest.json', 'sao-bai.json',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png',
  'be-vietnam-pro-latin-300-italic.woff2', 'be-vietnam-pro-latin-400-normal.woff2',
  'be-vietnam-pro-latin-500-normal.woff2', 'be-vietnam-pro-latin-600-normal.woff2',
  'be-vietnam-pro-latin-700-normal.woff2', 'be-vietnam-pro-vietnamese-300-italic.woff2',
  'be-vietnam-pro-vietnamese-400-normal.woff2', 'be-vietnam-pro-vietnamese-500-normal.woff2',
  'be-vietnam-pro-vietnamese-600-normal.woff2', 'be-vietnam-pro-vietnamese-700-normal.woff2',
  'bodoni-moda-latin-700-normal.woff2', 'bodoni-moda-latin-900-normal.woff2',
  'phong/lich-phap-gan-guoc-400.woff2', 'phong/lich-phap-mem-mai-400.woff2'];

/* Cài bản mới: tải lại đủ tệp từ máy chủ (bỏ qua bộ đệm HTTP của trình duyệt) */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(F.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
/* Có trong bộ đệm thì trả ngay, rồi tải bản mới ở nền để cập nhật bộ đệm; chưa có thì lấy mạng; mất mạng thì về trang chính */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const moi = caches.open(C).then(c => fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => {
    if (r && r.ok) c.put(e.request, r.clone());
    return r;
  }));
  e.waitUntil(moi.catch(() => {}));
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(cu => cu || moi.catch(() => caches.match('index.html'))));
});