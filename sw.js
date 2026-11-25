/* LGS Hazırlık: uygulama olarak yüklenebilmesi ve bildirimler için. Dosya saklamaz; her şey her zaman güncel olarak internetten gelir. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(){});
self.addEventListener('push', function(e){
  var d = {}; try{ d = e.data ? e.data.json() : {}; }catch(x){ d = { body: e.data ? e.data.text() : '' }; }
  self.clients.matchAll({ type:'window' }).then(function(l){ l.forEach(function(c){ c.postMessage({ lgs:'push' }); }); });
  e.waitUntil(lgsBadgeAdd(1));
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

/* Ana ekran simgesindeki sayı (rozet): yeni bildirimde bir artır; uygulama açılınca gerçek sayıyla güncellenir */
function lgsBadgeAdd(k){
  if(!self.navigator || !self.navigator.setAppBadge) return Promise.resolve();
  return caches.open('lgs-badge').then(function(c){
    return c.match('/__badge').then(function(r){ return r ? r.text() : '0'; }).then(function(t){
      var n = Math.max(0, (parseInt(t,10)||0) + k);
      return c.put('/__badge', new Response(String(n))).then(function(){ return n ? self.navigator.setAppBadge(n) : self.navigator.clearAppBadge(); });
    });
  }).catch(function(){});
}
self.addEventListener('message', function(e){
  if(e.data && e.data.lgsBadge !== undefined){
    var n = Math.max(0, e.data.lgsBadge|0);
    e.waitUntil(caches.open('lgs-badge').then(function(c){ return c.put('/__badge', new Response(String(n))); }).catch(function(){}));
  }
});
