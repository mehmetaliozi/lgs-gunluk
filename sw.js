/* LGS Hazırlık: uygulama olarak yüklenebilmesi ve bildirimler için. Dosya saklamaz; her şey her zaman güncel olarak internetten gelir. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(){});
self.addEventListener('push', function(e){
  var d = {}; try{ d = e.data ? e.data.json() : {}; }catch(x){ d = { body: e.data ? e.data.text() : '' }; }
  self.clients.matchAll({ type:'window' }).then(function(l){ l.forEach(function(c){ c.postMessage({ lgs:'push' }); }); });
  e.waitUntil(self.registration.showNotification(d.title || 'LGS Hazırlık', {
    body: d.body || '', icon: '/icons/icon-192.png', badge: '/icons/favicon-48.png',
    tag: d.tag || 'lgs', data: { url: d.url || '/' }
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(list){
    for(var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
