export type ServiceCategory = 'TAX' | 'BUSINESS' | 'LEGAL';

export interface ServiceStep {
    id: string;
    orderIndex: number;
    title: string;
    description?: string;
    formConfig?: Array<{
        name: string;
        label: string;
        type: 'text' | 'boolean' | 'number';
        required?: boolean;
        placeholder?: string;
    }>;
}

export interface ServiceDocType {
    id: string;
    docType: string;
    isRequired: boolean;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    price: number | string;
    originalPrice?: number | string;
    category: ServiceCategory;
    isActive: boolean;
    steps?: ServiceStep[];
    docTypes?: ServiceDocType[];
    reviews?: any[];
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role: 'ADMIN' | 'CLIENT' | 'PREPARER';
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface Order {
    id: string;
    userId: string;
    serviceId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    service?: Service;
    user?: User;
}

export interface CreateOrderPayload {
    serviceId: string;
    metadata?: Record<string, any>; // Intake answers
}
