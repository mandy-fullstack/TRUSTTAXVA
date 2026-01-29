export type ServiceCategory = 'TAX' | 'BUSINESS' | 'LEGAL';

export type FieldType =
    | 'text' | 'textarea' | 'number' | 'phone' | 'email' | 'date'
    | 'select' | 'checkbox' | 'ssn' | 'file_upload' | 'image_upload' | 'signature';

/** Show field only when another field has a given value (e.g. checkbox true, select option). */
export interface ShowWhenRule {
    field: string;
    value: boolean | string | number;
}

export interface FormFieldRules {
    showWhen?: ShowWhenRule;
}

export interface FormField {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string | null;
    helpText?: string | null;
    required: boolean;
    order: number;
    rules?: FormFieldRules | null;
    options?: Array<{ value: string; label: string }> | null;
    accept?: string | null;
    maxFiles?: number | null;
    maxSize?: number | null;
}

export interface FormSection {
    id: string;
    title: string;
    order: number;
    fields: FormField[];
}

export interface Form {
    id: string;
    name: string;
    sections: FormSection[];
    fields: FormField[]; // form-level (no section)
}

export interface ServiceStep {
    id: string;
    orderIndex: number;
    title: string;
    description?: string | null;
    formConfig?: Array<{
        name: string;
        label: string;
        type: string;
        required?: boolean;
        placeholder?: string;
        options?: { value: string; label: string }[];
    }>;
    formId?: string | null;
    form?: Form | null;
}

export interface ServiceDocType {
    id: string;
    docType: string;
    isRequired: boolean;
}

export interface Service {
    id: string;
    name: string; // Legacy field, kept for backward compatibility
    description: string; // Legacy field, kept for backward compatibility
    nameI18n?: { en?: string; es?: string };
    descriptionI18n?: { en?: string; es?: string };
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
    isProfileComplete?: boolean;
    profileCompleted?: boolean;
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
