import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService implements OnModuleInit {
    private readonly logger = new Logger(PushService.name);
    private isInitialized = false;

    onModuleInit() {
        try {
            if (admin.apps.length === 0) {
                // Option 1: Env var with JSON string
                if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                    });
                    this.isInitialized = true;
                    this.logger.log('Firebase Admin initialized via environment variable');
                }
                // Option 3: Default application credentials (for cloud environments)
                else {
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                    this.isInitialized = true;
                    this.logger.log('Firebase Admin initialized via default credentials');
                }
            } else {
                this.isInitialized = true;
            }
        } catch (error) {
            this.logger.warn('Failed to initialize Firebase Admin. Push notifications will be disabled.');
            this.logger.debug(error);
        }
    }

    /**
     * Send a push notification to a specific FCM token
     */
    async sendNotification(token: string, title: string, body: string, data?: Record<string, string>) {
        if (!this.isInitialized || !token) {
            this.logger.debug(`Push skipped: ${!this.isInitialized ? 'Not initialized' : 'No token'}`);
            return;
        }

        try {
            await admin.messaging().send({
                token,
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK', // Common for cross-platform
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            });
            this.logger.log(`Push notification sent successfully to token ending in ...${token.slice(-6)}`);
        } catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`);
        }
    }

    /**
     * Send push notification to multiple tokens (batch)
     */
    async sendMulticast(tokens: string[], title: string, body: string, data?: Record<string, string>) {
        const validTokens = tokens.filter(t => !!t);
        if (!this.isInitialized || validTokens.length === 0) return;

        try {
            const response = await admin.messaging().sendEachForMulticast({
                tokens: validTokens,
                notification: { title, body },
                data,
            });
            this.logger.log(`Multicast results: ${response.successCount} success, ${response.failureCount} failure`);
        } catch (error) {
            this.logger.error(`Failed to send multicast push: ${error.message}`);
        }
    }
}
