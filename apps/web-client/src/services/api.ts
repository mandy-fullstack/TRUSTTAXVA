import { getToken } from '../lib/cookies';
import type { Service } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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

        const response = await this.request<{ driverLicense: {
            number: string;
            stateCode: string;
            stateName: string;
            expirationDate: string;
        } | null }>('/auth/profile/decrypt-driver-license', {
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

        const response = await this.request<{ passport: {
            number: string;
            countryOfIssue: string;
            expirationDate: string;
        } | null }>('/auth/profile/decrypt-passport', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.passport;
    }

    // Add future modules here (Orders, Appointments, etc.)
}

export const api = new ApiService();
