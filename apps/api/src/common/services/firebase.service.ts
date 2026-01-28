import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private isInitialized = false;

    onModuleInit() {
        if (admin.apps.length === 0) {
            try {
                const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
                    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
                    : null;

                if (serviceAccount) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                    });
                    this.isInitialized = true;
                    console.log('Firebase Admin initialized with Service Account');
                } else if (process.env.FIREBASE_PROJECT_ID) {
                    admin.initializeApp({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                    });
                    this.isInitialized = true;
                    console.log('Firebase Admin initialized with Project ID:', process.env.FIREBASE_PROJECT_ID);
                } else {
                    console.warn('Firebase configuration not found. Push notifications will be limited or disabled.');
                }
            } catch (error) {
                console.error('Error initializing Firebase Admin:', error);
            }
        } else {
            this.isInitialized = true;
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
