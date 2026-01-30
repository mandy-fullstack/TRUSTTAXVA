import { getToken } from '../lib/cookies';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://trusttax-api.onrender.com' : 'http://localhost:4000');

export class AuthenticationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
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

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

type RequestOpts = RequestInit & { skipAuth?: boolean };

async function request<T>(endpoint: string, options: RequestOpts = {}): Promise<T> {
  const { skipAuth, ...init } = options;
  const isFormData = init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(typeof init.headers === 'object' && !(init.headers instanceof Headers)
      ? (init.headers as Record<string, string>)
      : {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...init, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'A technical error occurred' }));
      const msg = (err && typeof err === 'object' && 'message' in err && err.message) || 'Request failed';
      if (res.status === 401) throw new AuthenticationError(String(msg), 401);
      if (res.status === 403) throw new ForbiddenError(String(msg));
      if (res.status === 404) throw new NotFoundError(String(msg));
      throw new Error(String(msg));
    }
    return res.json();
  } catch (e) {
    if (e instanceof AuthenticationError || e instanceof ForbiddenError || e instanceof NotFoundError || e instanceof NetworkError) throw e;
    if (e instanceof TypeError && (e.message || '').includes('fetch')) throw new NetworkError('Unable to connect to server. Please check your connection.');
    throw e;
  }
}

export const api = {
  login(email: string, password: string) {
    return request<{ access_token: string; user: { id: string; email: string; name?: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },

  getMe() {
    const token = getToken();
    if (!token) throw new AuthenticationError('No authentication token found');
    return request<any>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  },

  forgotPassword(email: string) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  resetPassword(token: string, password: string) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    });
  },

  updateFcmToken(token: string) {
    return request<any>('/auth/fcm-token', {
      method: 'PATCH',
      body: JSON.stringify({ token }),
    });
  },

  getClients: () => request<any[]>('/admin/clients'),
  getClientDetails: (id: string) => request<any>(`/admin/clients/${id}`),
  sendTestPush: (id: string) => request<any>(`/admin/clients/${id}/test-push`, { method: 'POST' }),
  getClientSensitive: (id: string) =>
    request<{
      ssn: string | null;
      driverLicense: { number: string; stateCode: string; stateName: string; expirationDate: string } | null;
      passport: { number: string; countryOfIssue: string; expirationDate: string } | null;
    }>(`/admin/clients/${id}/sensitive`),
  getUserDocuments: (userId: string) => request<any[]>(`/documents/admin/user/${userId}`),
  adminDeleteDocument: (id: string) => request<void>(`/documents/admin/${id}`, { method: 'DELETE' }),

  getStaff: () => request<any[]>('/admin/staff'),

  getOrders: () => request<any[]>('/admin/orders'),
  getOrderDetails: (id: string) => request<any>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string, notes?: string) =>
    request<any>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  addOrderTimelineEntry: (id: string, title: string, description: string) =>
    request<any>(`/admin/orders/${id}/timeline`, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),
  createOrderApproval: (id: string, data: { type: string; title: string; description?: string }) =>
    request<any>(`/admin/orders/${id}/approvals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Chat
  getConversations: () => request<any[]>('/chat/conversations'),
  getConversation: (id: string) => request<any>(`/chat/conversations/${id}`),
  createConversation: (subject?: string) => request<any>('/chat/conversations', { method: 'POST', body: JSON.stringify({ subject }) }),
  sendMessage: (conversationId: string, content: string, documentId?: string) => request<any>(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ content, documentId }) }),
  uploadDocument: (file: File, title?: string, type: string = 'OTHER') => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    formData.append('type', type);
    return request<any>('/documents/upload', { method: 'POST', body: formData });
  },
  deleteConversation: (id: string) => request<void>(`/chat/conversations/${id}`, { method: 'DELETE' }),

  getDashboardMetrics: () => request<any>('/admin/dashboard/metrics'),

  getServices: () => request<any[]>('/admin/services'),
  getServiceDetails: (id: string) => request<any>(`/admin/services/${id}`),
  createService: (data: { nameI18n?: { en?: string; es?: string }; descriptionI18n?: { en?: string; es?: string }; category: string; price: number; originalPrice?: number }) =>
    request<any>('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: { nameI18n?: { en?: string; es?: string }; descriptionI18n?: { en?: string; es?: string }; category?: string; price?: number; originalPrice?: number }) =>
    request<any>(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id: string) => request<any>(`/admin/services/${id}`, { method: 'DELETE' }),

  createServiceStep: (serviceId: string, data: { title: string; description?: string; formConfig?: any; formId?: string | null }) =>
    request<any>(`/admin/services/${serviceId}/steps`, { method: 'POST', body: JSON.stringify(data) }),
  updateServiceStep: (stepId: string, data: { title?: string; description?: string; formConfig?: any; formId?: string | null }) =>
    request<any>(`/admin/services/steps/${stepId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteServiceStep: (stepId: string) =>
    request<any>(`/admin/services/steps/${stepId}`, { method: 'DELETE' }),
  reorderServiceSteps: (stepIds: string[]) =>
    request<any>('/admin/services/steps/reorder', { method: 'PUT', body: JSON.stringify({ stepIds }) }),

  getCompanyProfile: () => request<any>('/company/public', { skipAuth: true }),
  updateCompanyProfile: (data: any) => request<any>('/company', { method: 'PUT', body: JSON.stringify(data) }),

  getForms: () => request<any[]>('/admin/forms'),
  getForm: (id: string) => request<any>(`/admin/forms/${id}`),
  createForm: (data: { name: string; description?: string; version?: string; active?: boolean }) =>
    request<any>('/admin/forms', { method: 'POST', body: JSON.stringify(data) }),
  createFormFromTemplate: (template: 'tax') =>
    request<any>('/admin/forms/from-template', { method: 'POST', body: JSON.stringify({ template }) }),
  updateForm: (id: string, data: {
    name?: string;
    description?: string;
    nameI18n?: { en?: string; es?: string };
    descriptionI18n?: { en?: string; es?: string };
    version?: string;
    active?: boolean;
  }) =>
    request<any>(`/admin/forms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteForm: (id: string) => request<any>(`/admin/forms/${id}`, { method: 'DELETE' }),
  createFormSection: (formId: string, data: {
    title: string;
    order?: number;
    titleI18n?: { en?: string; es?: string };
  }) =>
    request<any>(`/admin/forms/${formId}/sections`, { method: 'POST', body: JSON.stringify(data) }),
  updateFormSection: (formId: string, sectionId: string, data: {
    title?: string;
    order?: number;
    titleI18n?: { en?: string; es?: string };
  }) =>
    request<any>(`/admin/forms/${formId}/sections/${sectionId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFormSection: (formId: string, sectionId: string) =>
    request<any>(`/admin/forms/${formId}/sections/${sectionId}`, { method: 'DELETE' }),
  createFormField: (formId: string, data: {
    sectionId?: string | null;
    type: string;
    name: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    labelI18n?: { en?: string; es?: string };
    placeholderI18n?: { en?: string; es?: string };
    helpTextI18n?: { en?: string; es?: string };
    required?: boolean;
    order?: number;
    rules?: object;
    options?: object;
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
  }) =>
    request<any>(`/admin/forms/${formId}/fields`, { method: 'POST', body: JSON.stringify(data) }),
  updateFormField: (formId: string, fieldId: string, data: Partial<{
    sectionId: string | null;
    type: string;
    name: string;
    label: string;
    placeholder: string;
    helpText: string;
    labelI18n: { en?: string; es?: string };
    placeholderI18n: { en?: string; es?: string };
    helpTextI18n: { en?: string; es?: string };
    required: boolean;
    order: number;
    rules: object;
    options: object;
    accept: string;
    maxFiles: number;
    maxSize: number;
  }>) =>
    request<any>(`/admin/forms/${formId}/fields/${fieldId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFormField: (formId: string, fieldId: string) =>
    request<any>(`/admin/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' }),

  getToken: () => getToken(),
};
