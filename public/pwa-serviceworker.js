/*
  Weather
  homepage: <https://github.com/vladmandic/weather>
  author: <https://github.com/vladmandic>'
*/

var o="weather",l="offline.html",i=["/favicon.ico","/weather.webmanifest","/public/offline.html"],c=!1,r={hit:0,miss:0},n=(...t)=>{let e=new Date,a=`${e.getHours().toString().padStart(2,"0")}:${e.getMinutes().toString().padStart(2,"0")}:${e.getSeconds().toString().padStart(2,"0")}.${e.getMilliseconds().toString().padStart(3,"0")}`;console.log(a,"pwa",...t)};async function f(t){fetch(t).then(e=>(e.ok&&caches.open(o).then(a=>a.put(t,e)).catch(a=>n("cache update error",a)),!0)).catch(e=>(n("fetch error",e),!1))}async function h(t){return fetch(t.request)}function u(){caches.open(o).then(t=>t.addAll(i).then(()=>n("cache refresh:",i.length,"files"),e=>n("cache error",e)))}if(!c){self.addEventListener("message",e=>{n("event message:",e.data)}),self.addEventListener("install",e=>{n("install"),self.skipWaiting(),e.waitUntil(u)}),self.addEventListener("activate",e=>{n("activate"),e.waitUntil(self.clients.claim())}),self.addEventListener("fetch",e=>{let a=new URL(e.request.url);if(e.request.cache==="only-if-cached"&&e.request.mode!=="same-origin"||a.origin!==location.origin||e.request.method!=="GET"||e.request.url.includes("/api/"))return;let s=h(e);s?e.respondWith(s):n("fetch response missing")});let t=!1;self.addEventListener("controllerchange",e=>{n(`PWA: ${e.type}`),!t&&(t=!0,location.reload())}),c=!0}
//# sourceMappingURL=pwa-serviceworker.js.map
