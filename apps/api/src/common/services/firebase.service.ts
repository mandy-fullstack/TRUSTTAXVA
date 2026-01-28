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
                notification: {
                    icon: '/vite.svg',
                    badge: '/favicon.svg',
                },
                fcm_options: {
                    link: data.link || '/'
                }
            }
        };

        try {
            const response = await admin.messaging().send(message as any);
            console.log('Successfully sent push notification:', response);
            return response;
        } catch (error) {
            console.error('Error sending push notification:', error);
            return null;
        }
    }
}
