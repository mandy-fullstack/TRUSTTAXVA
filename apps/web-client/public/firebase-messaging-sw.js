/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// These values are public and safe to include in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyCwzZpVfKA5belcGGmez_Sfwx9p0LXCmlY",
    authDomain: "trusttax-df737.firebaseapp.com",
    projectId: "trusttax-df737",
    storageBucket: "trusttax-df737.firebasestorage.app",
    messagingSenderId: "336648492475",
    appId: "1:336648492475:web:a7e90aa0869774d03d609e",
    measurementId: "G-EK06H8L43H"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg',
        badge: '/favicon.svg',
        data: payload.data?.link || '/',
        tag: 'fcm-notification'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Generic push event handler for non-FCM or legacy pushes
self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const data = event.data.json();
            // Only show if it's NOT an FCM notification (which is handled by messaging.onBackgroundMessage)
            // Or if we specifically want to handle legacy pushes
            if (!data.fcm_message_id) {
                const options = {
                    body: data.body || 'Nuevo mensaje de TrustTax',
                    icon: '/vite.svg',
                    badge: '/favicon.svg',
                    data: data.link || '/',
                    tag: 'legacy-notification',
                    actions: [
                        { action: 'open', title: 'Ver ahora' }
                    ]
                };
                event.waitUntil(self.registration.showNotification(data.title || 'TrustTax', options));
            }
        } catch (e) {
            console.log('Non-JSON push received');
        }
    }
});

// Notification click behavior
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = new URL(event.notification.data || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // Check if the client is at the same URL
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no exact match, check if any client belongs to the app and could be navigated?
            // For now, if no exact match, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
