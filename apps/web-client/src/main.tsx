import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './global.css'
import './index.css'
import './i18n'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

// Ensure single React instance
if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  // React DevTools detected
}

createRoot(root).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)

// Register service worker if supported
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register the Firebase messaging sw.js
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then(registration => {
      console.log('FCM SW registered: ', registration);
    }).catch(registrationError => {
      console.log('FCM SW registration failed: ', registrationError);
    });
  });
}
