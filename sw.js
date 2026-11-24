/* LGS Hazırlık: uygulama olarak yüklenebilmesi için. Dosya saklamaz; her şey her zaman güncel olarak internetten gelir. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(){});
