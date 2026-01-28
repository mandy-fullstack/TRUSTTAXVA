import { getToken } from '../lib/cookies';
import type { Service } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://trusttax-api.onrender.com' : 'http://localhost:4000');

// Custom error classes
export class AuthenticationError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 401) {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = statusCode;
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

class ApiService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(typeof options.headers === 'object' && !(options.headers instanceof Headers)
                ? (options.headers as Record<string, string>)
                : {}),
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'A technical error occurred' }));
                const message = (error && typeof error === 'object' && 'message' in error && error.message) || 'Request failed';

                if (response.status === 401) {
                    throw new AuthenticationError(String(message), 401);
                }
                if (response.status === 404) {
                    throw new NotFoundError(String(message));
                }
                throw new Error(String(message));
            }

            return response.json();
        } catch (error) {
            if (error instanceof AuthenticationError || error instanceof NotFoundError || error instanceof NetworkError) {
                throw error;
            }
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new NetworkError('Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    }

    // --- Auth ---
    async login(email: string, password: string): Promise<any> {
        return this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(data: any): Promise<any> {
        return this.request<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async requestPasswordReset(email: string): Promise<{ message: string }> {
        return this.request<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async verifyResetToken(token: string): Promise<{ valid: boolean; email: string }> {
        return this.request<{ valid: boolean; email: string }>(`/auth/verify-reset-token/${token}`);
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        return this.request<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        });
    }

    async verifyEmail(token: string): Promise<{ access_token: string; user: any; message: string }> {
        return this.request<{ access_token: string; user: any; message: string }>(`/auth/verify-email/${token}`);
    }

    // --- Services ---
    async getServices(): Promise<Service[]> {
        return this.request<Service[]>('/services');
    }

    async getServiceById(id: string): Promise<Service> {
        return this.request<Service>(`/services/${id}`);
    }

    async getServiceReviews(id: string): Promise<any[]> {
        return this.request<any[]>(`/services/${id}/reviews`);
    }

    async getTopReviews(): Promise<any[]> {
        return this.request<any[]>('/services/top-reviews');
    }

    async getMe(): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('No authentication token found');
        return this.request<any>('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async getCompanyProfile(): Promise<any> {
        return this.request<any>('/company/public');
    }

    // --- Orders ---
    async createOrder(serviceId: string, metadata: any = {}): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        return this.request<any>('/orders', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ serviceId, metadata }),
        });
    }

    async getOrderById(id: string): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        return this.request<any>(`/orders/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async getOrders(): Promise<any[]> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        return this.request<any[]>('/orders', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async respondToApproval(approvalId: string, status: 'APPROVED' | 'REJECTED', clientNote?: string): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        return this.request<any>(`/orders/approvals/${approvalId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status, clientNote }),
        });
    }

    // --- Profile ---
    async updateProfile(data: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        dateOfBirth?: string;
        countryOfBirth?: string;
        primaryLanguage?: string;
        taxIdType?: 'SSN' | 'ITIN';
        ssn?: string;
        driverLicenseNumber?: string;
        driverLicenseStateCode?: string;
        driverLicenseStateName?: string;
        driverLicenseExpiration?: string;
        passportNumber?: string;
        passportCountryOfIssue?: string;
        passportExpiration?: string;
        acceptTerms?: boolean;
        termsVersion?: string;
    }): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        return this.request<any>('/auth/profile', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
    }

    async updateFCMToken(token: string | null): Promise<any> {
        const authToken = getToken();
        if (!authToken) return;
        return this.request<any>('/auth/fcm-token', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token }),
        });
    }

    async getDecryptedSSN(): Promise<string | null> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        const response = await this.request<{ ssn: string | null }>('/auth/profile/decrypt-ssn', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.ssn;
    }

    async getDecryptedDriverLicense(): Promise<{
        number: string;
        stateCode: string;
        stateName: string;
        expirationDate: string;
    } | null> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        const response = await this.request<{
            driverLicense: {
                number: string;
                stateCode: string;
                stateName: string;
                expirationDate: string;
            } | null
        }>('/auth/profile/decrypt-driver-license', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.driverLicense;
    }

    async getDecryptedPassport(): Promise<{
        number: string;
        countryOfIssue: string;
        expirationDate: string;
    } | null> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');

        const response = await this.request<{
            passport: {
                number: string;
                countryOfIssue: string;
                expirationDate: string;
            } | null
        }>('/auth/profile/decrypt-passport', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.passport;
    }

    // --- Admin ---
    async adminGetOrders(): Promise<any[]> {
        const token = getToken();
        return this.request<any[]>('/admin/orders', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async adminGetOrderById(id: string): Promise<any> {
        const token = getToken();
        return this.request<any>(`/admin/orders/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async adminUpdateOrderStatus(id: string, status: string, notes?: string): Promise<any> {
        const token = getToken();
        return this.request<any>(`/admin/orders/${id}/status`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status, notes }),
        });
    }

    async adminAddOrderTimelineEntry(id: string, title: string, description: string): Promise<any> {
        const token = getToken();
        return this.request<any>(`/admin/orders/${id}/timeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, description }),
        });
    }

    async adminCreateOrderApproval(id: string, type: string, title: string, description?: string): Promise<any> {
        const token = getToken();
        return this.request<any>(`/admin/orders/${id}/approvals`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type, title, description }),
        });
    }

    // --- Chat ---
    async getConversations(): Promise<any[]> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');
        return this.request<any[]>('/chat/conversations', {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    async getConversation(id: string): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');
        return this.request<any>(`/chat/conversations/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    async createConversation(subject?: string): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');
        return this.request<any>('/chat/conversations', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ subject })
        });
    }

    async sendMessage(conversationId: string, content: string): Promise<any> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');
        return this.request<any>(`/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
    }

    async deleteConversation(id: string): Promise<void> {
        const token = getToken();
        if (!token) throw new AuthenticationError('Please sign in to continue');
        return this.request<void>(`/chat/conversations/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // --- FAQs ---
    async getFAQs(): Promise<any[]> {
        return this.request<any[]>('/faq');
    }

    // Add future modules here (Orders, Appointments, etc.)
}

export const api = new ApiService();
