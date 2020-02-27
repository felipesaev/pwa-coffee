 // Registering our Service worker
 if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./public/sw.js', { scope: './' })
  }