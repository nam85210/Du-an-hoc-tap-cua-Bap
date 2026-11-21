// Lưu tạm các file để app mở được cả khi mạng yếu.
// Mỗi lần sửa code, tăng số phiên bản này lên để điện thoại tải bản mới.
const CACHE = "bap-hoc-vui-v1";
const FILES = [
  "./", "./index.html", "./css/style.css", "./manifest.webmanifest",
  "./js/data.js", "./js/vietnamese.js", "./js/speech.js", "./js/math.js", "./js/app.js",
  "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Ưu tiên mạng (luôn có bản mới nhất), mất mạng thì dùng bản đã lưu
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
