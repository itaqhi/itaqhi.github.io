'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "63305d15635ad439f831d8a866b6a082",
"index.html": "4eedc0b781ddaa13721e7784d330a63c",
"/": "4eedc0b781ddaa13721e7784d330a63c",
"main.dart.js": "fe4a4b6ba84cf71a5ba8e50de1816b55",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "7b2c80ffa2aea44b608d785eae7d634f",
"assets/images/ic_service_qa_n.png": "22c456948a461bfbffb87acc29ddb047",
"assets/images/ic_park_publicity_n.png": "e7fb58cda9e1d6828fca308e34b72c0c",
"assets/images/bg_nearby_facility_title.png": "dbd98f710a29b0c289d50987dcfb315d",
"assets/images/ic_business_service_n.png": "212a1f6f295c6d1aba44dad37daffe2f",
"assets/images/ic_epidemic_policy_p.png": "ec273289e1828768f45a7683c2704392",
"assets/images/bg_nearby_facility.png": "ec6f4bff3f35ace815e57b377ba7ffae",
"assets/images/ic_law_service_n.png": "ffb8bf1a30b9b7b3c565323d3f7624c2",
"assets/images/bg_home_menu_name_n.png": "68d0408fac95a59848c73165a5c8a9dd",
"assets/images/ic_btn_back.png": "6c7d99a982ce72c4888f18e0bb1b2ab5",
"assets/images/img_home_bottom.jpg": "3c2b45b01a0a7850a2cf42b8cce19695",
"assets/images/ic_union_style_p.png": "e9fe11121b975c4c4abb75d19948d8c2",
"assets/images/bg_content.png": "5ce21a773703cd50667f8703b74f789a",
"assets/images/ic_union_style_n.png": "0e84426d0f6589b3902e4d961ecf0abe",
"assets/images/ic_voice.gif": "16e1c5d52cc0f9c5c95fe14ba3e090e3",
"assets/images/ic_service_qa_p.png": "3fe5c600749e85b599942ff07648a189",
"assets/images/ic_gov_agency.png": "10754f48a5d3ef5cb4786165173459ab",
"assets/images/ic_park_publicity_p.png": "e0dd84b67da1ce78971770ead2e087c7",
"assets/images/bg_home.png": "a1c56d97d033b574f23bdbd83f7a1265",
"assets/images/ic_business_service_p.png": "fd1022290d5494b1ba0bd707e1fac22c",
"assets/images/ic_epidemic_policy_n.png": "21798b3d1f7694814602369d61c6cfea",
"assets/images/ic_voice_wave.gif": "82cb016600d300c62d66ca30f1229d3b",
"assets/images/ic_law_service_p.png": "a6ccfe9019f51ed2f3eb53b0bf8fda8f",
"assets/images/bg_home_menu_name_p.png": "fe94c2264c93884da6b420887c0a235e",
"assets/AssetManifest.json": "ddfe18251fdaafcdc25d44f995d9f8b1",
"assets/NOTICES": "94063a9822ebddab59f3bf2d45e4b2e3",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
