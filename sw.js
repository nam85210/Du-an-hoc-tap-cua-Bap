// Lưu tạm các file để app mở được cả khi mạng yếu.
// Mỗi lần sửa code: tăng APP_VERSION ở đây VÀ trong js/app.js, index.html (?v=...).
const APP_VERSION = "13";
const CACHE = "bap-hoc-vui-v" + APP_VERSION;
const FILES = [
  "./", "./index.html", "./css/style.css", "./manifest.webmanifest",
  "./js/data.js", "./js/vietnamese.js", "./js/speech.js", "./js/math.js", "./js/logic-scale.js", "./js/challenge.js", "./js/jar.js", "./js/app.js",
  "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png",
];
self.addEventListener("install", (e) => {
  // cache: "reload" = luôn tải file mới từ mạng, không lấy bản cũ trong bộ nhớ trình duyệt
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Ưu tiên mạng và luôn hỏi lại máy chủ (no-cache) để có bản mới nhất; mất mạng thì dùng bản đã lưu
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  const net = sameOrigin ? fetch(url.href, { cache: "no-cache" }) : fetch(e.request);
  e.respondWith(
    net.then((res) => {
      if (res.ok && sameOrigin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
