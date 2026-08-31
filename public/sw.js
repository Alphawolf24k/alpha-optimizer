self.addEventListener('install', (event) => {
  console.log('Service Worker installed')
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Alpha Optimizer'
  const options = {
    body: data.body || 'New update available!',
    icon: '/icon.png',
    badge: '/icon.png'
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})