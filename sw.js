// 앱 셸 서비스 워커. 빌드 때 vite.config.js의 sw-precache 플러그인이 아래 자리표시자를 실제 파일 목록·버전으로 바꾼다.
// 모델 파일(huggingface.co)은 Transformers.js가 자체 캐시하므로 여기서는 같은 출처 요청만 다룬다.
const VERSION = 'c227616e2428';
const PRECACHE = ["./","./assets/index-CFttXW0Q.css","./assets/index-DRKHKb99.js","./assets/ort-wasm-simd-threaded.jsep-B0T3yYHD.wasm","./assets/pcm-worklet-D9Fv27wc.js","./assets/transcriber.worker-Ch3QaFEy.js","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest","./robots.txt"];
const CACHE = `shell-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('shell-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // 새 버전을 우선, 오프라인이면 캐시된 index.html
    e.respondWith(fetch(req).catch(() => caches.match('./index.html', { ignoreSearch: true, ignoreVary: true })));
    return;
  }
  // ignoreVary: crossorigin 모듈 요청은 Origin 헤더가 붙어 Vary: Origin 응답과 어긋날 수 있다
  e.respondWith(caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || fetch(req)));
});
