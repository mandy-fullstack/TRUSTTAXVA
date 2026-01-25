import Cookies from 'js-cookie';
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
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'A technical error occurred' }));
                const message = error.message || 'Request failed';

                // Handle specific status codes
                if (response.status === 401) {
                    throw new AuthenticationError(message, 401);
                } else if (response.status === 404) {
                    throw new NotFoundError(message);
                } else {
                    throw new Error(message);
                }
            }

            return response.json();
        } catch (error) {
            // Network errors (no response from server)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new NetworkError('Unable to connect to server. Please check your connection.');
            }
            // Re-throw our custom errors
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
        const token = Cookies.get('token');
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
        const token = Cookies.get('token');
        if (!token) throw new AuthenticationError('Please sign in to continue');

        return this.request<any>('/orders', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ serviceId, metadata }),
        });
    }

    // Add future modules here (Orders, Appointments, etc.)
}

export const api = new ApiService();
