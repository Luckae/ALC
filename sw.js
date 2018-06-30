
console.log('WORKER: executing.');

var version = 'v2::';

let offlineFundamentals = [
 'https://luckae.github.io/ALC/',
 'https://luckae.github.io/ALC/images/andela.png',
 'https://luckae.github.io/ALC/css/main.css',
 'https://luckae.github.io/ALC/images/bg-01.jpg',
 'https://luckae.github.io/ALC/manifest.json',
 'https://luckae.github.io/ALC/vendor/bootstrap/css/bootstrap.min.css',
 'https://luckae.github.io/ALC/vendor/bootstrap/js/popper.js',
 'https://luckae.github.io/ALC/vendor/bootstrap/js/bootstrap.min.js',
 'https://luckae.github.io/ALC/vendor/jquery/jquery-3.2.1.min.js',
 'https://free.currencyconverterapi.com/api/v5/currencies',
 'https://luckae.github.io/ALC/js/convert.js',
 'https://luckae.github.io/ALC/js/localforage-1.7.2.min.js'
];

self.addEventListener('fetch', function(event) {
console.log(event.request.url);
});

self.addEventListener('fetch', function(event){
event.respondWith(
    fetch(event.request).then(function(response){
      //HANDLE 404 EVENTS
        if(response.status === 404){
            return new Response("Uh ...uh ... E be like say you don miss road. Try look where you dey go.");
        }
        return response;
     }).catch(function(){
            return new Response('The network totally failed');
     })
    );
 });


self.addEventListener("install", function(event) {
 console.log('WORKER: install event in progress.');
 event.waitUntil(
   caches
     .open(version + 'fundamentals')
     .then(function(cache) {
       return cache.addAll(offlineFundamentals);
     })
     .then(function() {
       console.log('WORKER: install completed');
     })
 );
});

self.addEventListener("fetch", function(event) {
 console.log('WORKER: fetch event in progress.');

 if (event.request.method !== 'GET') {
   console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
   return;
 }
 event.respondWith(
   caches
     .match(event.request)
     .then(function(cached) {
       var networked = fetch(event.request)
         // handle the network request with success and failure scenarios.
         .then(fetchedFromNetwork, unableToResolve)
         // catch errors on the fetchedFromNetwork handler as well.
         .catch(unableToResolve);
         // Return cached response
       console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
       return cached || networked;

       function fetchedFromNetwork(response) {
         /* We copy the response before replying to the network request.
            This is the response that will be stored on the ServiceWorker cache.
         */
         var cacheCopy = response.clone();

         console.log('WORKER: fetch response from network.', event.request.url);

         caches
           .open(version + 'pages')
           .then(function add(cache) {
             cache.put(event.request, cacheCopy);
           })
           .then(function() {
             console.log('WORKER: fetch response stored in cache.', event.request.url);
           });

         return response;
       }

       function unableToResolve () {
         return caches.match('images/dr-evil.png');
         console.log('WORKER: fetch request failed in both cache and network.');


         return new Response('<h1>Service Unavailable</h1>', {
           status: 503,
           statusText: 'Service Unavailable',
           headers: new Headers({
             'Content-Type': 'text/html'
           })
         });
       }
     })
 );
});

function updateIsReady(sw){
	console.log('a new SW is ready to take over !');
	sw.postMessage('message', {action: 'skipWaiting'});
	pushUpdateFound();
}

// push updates
function pushUpdateFound() {
  	alert('Found some updates.. !');
}

self.addEventListener("activate", function(event) {

 console.log('WORKER: activate event in progress.');

 event.waitUntil(
   caches
     .keys()
     .then(function (keys) {
       // return a promise that settles when all outdated caches are deleted.
       return Promise.all(
         keys
           .filter(function (key) {
             // Filter by keys that don't start with the latest version prefix.
             return !key.startsWith(version);
           })
           .map(function (key) {

             return caches.delete(key);
           })
       );
     })
     .then(function() {
       console.log('WORKER: activate completed.');
     })
 );
});
