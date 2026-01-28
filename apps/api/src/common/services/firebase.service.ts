import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private isInitialized = false;

    onModuleInit() {
        if (admin.apps.length === 0) {
            console.log('[FirebaseService] Initializing Firebase Admin...');
            try {
                let jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

                if (!jsonStr) {
                    console.warn('[FirebaseService] FIREBASE_SERVICE_ACCOUNT_JSON is not defined.');
                } else {
                    // Cleanup common formatting errors in environment variables
                    // 1. Remove outer quotes if they exist (sometimes added by Render/Heroku UI)
                    if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
                        jsonStr = jsonStr.slice(1, -1);
                    }
                    if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                        jsonStr = jsonStr.slice(1, -1);
                    }

                    try {
                        const serviceAccount = JSON.parse(jsonStr);
                        admin.initializeApp({
                            credential: admin.credential.cert(serviceAccount),
                        });
                        this.isInitialized = true;
                        console.log('[FirebaseService] Firebase Admin initialized with Service Account successfully.');
                        return; // Done
                    } catch (parseError: any) {
                        console.error('[FirebaseService] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseError.message);
                        // Log a snippet of the string (safely) to debug
                        const snippet = jsonStr.substring(0, 50) + '...';
                        console.log('[FirebaseService] String snippet:', snippet);
                    }
                }

                // Fallback to Project ID if Service Account fails or is missing
                if (process.env.FIREBASE_PROJECT_ID) {
                    admin.initializeApp({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                    });
                    this.isInitialized = true;
                    console.log('[FirebaseService] Firebase Admin initialized with Project ID fallback:', process.env.FIREBASE_PROJECT_ID);
                } else {
                    console.warn('[FirebaseService] CRITICAL: No Firebase configuration found (JSON or Project ID).');
                }
            } catch (error: any) {
                console.error('[FirebaseService] Unexpected error during initialization:', error);
            }
        } else {
            this.isInitialized = true;
            console.log('[FirebaseService] Firebase Admin already initialized (Apps count: ' + admin.apps.length + ')');
        }
    }

    async sendPushNotification(token: string, title: string, body: string, data: any = {}) {
        if (!this.isInitialized) {
            console.warn('Firebase Admin not initialized. Skipping push notification.');
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: data.link || '/',
            },
            token,
            webpush: {
                headers: {
                    Urgency: 'high',
                    TTL: '86400' // 24 hours persistence
                },
                notification: {
                    icon: '/vite.svg',
                    badge: '/favicon.svg',
                    requireInteraction: true,
                    silent: false,
                    tag: data.type || 'general'
                },
                fcm_options: {
                    link: data.link || '/'
                }
            },
            android: {
                priority: 'high',
                ttl: 86400000, // 24 hours in ms
                notification: {
                    sound: 'default',
                    color: '#0F172A',
                    icon: 'stock_ticker_update',
                    sticky: false,
                    visibility: 'public'
                }
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                    'apns-expiration': Math.floor(Date.now() / 1000 + 86400).toString()
                },
                payload: {
                    aps: {
                        alert: {
                            title,
                            body
                        },
                        sound: 'default',
                        badge: 1,
                        'mutable-content': 1,
                        'content-available': 1
                    }
                }
            }
        };

        try {
            const response = await admin.messaging().send(message as any);
            console.log('Successfully sent push notification:', response);
            return response;
        } catch (error) {
            console.error('Error sending push notification:', error);
            // Handle expired/invalid tokens by clearing them in DB?
            // This would require more logic to pass userId here
            return null;
        }
    }
}
