import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as isMessagingSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analyticsPromise =
  typeof window !== "undefined"
    ? isAnalyticsSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : Promise.resolve(null);

// Initialize Messaging
export const messagingPromise =
  typeof window !== "undefined"
    ? isMessagingSupported().then((yes) => (yes ? getMessaging(app) : null))
    : Promise.resolve(null);

export const requestFCMToken = async (vapidKey: string) => {
  try {
    const messaging = await messagingPromise;
    if (!messaging) return null;

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    return currentToken;
  } catch (err) {
    console.error("An error occurred while retrieving FCM token:", err);
    return null;
  }
};

export const onMessageListener = async (callback: (payload: any) => void) => {
  const messaging = await messagingPromise;
  if (!messaging) return;
  return onMessage(messaging, callback);
};

export default app;
