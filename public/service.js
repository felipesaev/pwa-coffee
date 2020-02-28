(async () => {
  if('serviceWorker' in navigator) {
    // We first get the registration
    const registration = await navigator.serviceWorker.ready;
    // Asking for the subscription object
    let subscription = await registration.pushManager.getSubscription();

    // If we don't have a subscription we have to create and register it!
    if (!subscription) {
      subscription = await subscribe(registration);
    }
    // Implementing an unsubscribe button
    document.getElementById('unsubscribe').onclick = () => unsubscribe();
  }
})()

// We use this function to subscribe to our push notifications
// As soon as you run this code once, it shouldn't run again if the initial subscription went well
// Except if you clear your storage
const subscribe = async (registration) => {
  // First get a public key from our Express server
  const response = await fetch('/vapid-public-key');
  const body = await response.json();
  const publicKey = body.publicKey;

  // this is an annoying part of the process we have to turn our public key
  // into a Uint8Array
  const Uint8ArrayPublicKey = urlBase64ToUint8Array(publicKey);

  // registering a new subscription to our service worker's Push manager
  const subscription = await registration.pushManager.subscribe({
    // don't worry about the userVisible only atm
    userVisibleOnly: true,
    applicationServerKey: Uint8ArrayPublicKey
  });

  // Sending the subscription object to our Express server
  await fetch('/subscribe',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON())
    }
  );
  return subscription;
};

// Let's create an unsubscribe function as well
const unsubscribe = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  // This tells our browser that we want to unsubscribe
  await subscription.unsubscribe();

  // This tells our Express server that we want to unsubscribe
  await fetch("/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON())
  });
  writeSubscriptionStatus("Unsubscribed");
};

// This simply shows our user that they are unsubscribed
const writeSubscriptionStatus = subscriptionStatus => {
  document.getElementById("status").innerHTML = subscriptionStatus;
};

// I have found this code (or variations of) from; multiple sources
// but I could not find the original author
// here's one such source:
// https://stackoverflow.com/questions/42362235/web-pushnotification-unauthorizedregistration-or-gone-or-unauthorized-sub
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};