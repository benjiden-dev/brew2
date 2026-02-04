// Paste this in your browser console to clear service worker cache
// Then refresh the page

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister()
      console.log('✅ Service worker unregistered')
    }
  })
}

if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName)
      console.log('✅ Cache deleted:', cacheName)
    })
  })
}

console.log('✅ Service worker and cache cleared! Refresh the page.')
