import { api } from './api';

export const adminApi = {
    // Clients
    async getClients() {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    async getClientDetails(id: string) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/clients/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    // Orders
    async getOrders() {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    async getOrderDetails(id: string) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/orders/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    async updateOrderStatus(id: string, status: string, notes?: string) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/orders/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, notes })
        }).then(res => res.json());
    },

    // Dashboard
    async getDashboardMetrics() {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/dashboard/metrics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    // Services
    async getServices() {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    async getServiceDetails(id: string) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    async createService(data: {
        name: string;
        description: string;
        category: string;
        price: number;
        originalPrice?: number;
    }) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json());
    },

    async updateService(id: string, data: {
        name?: string;
        description?: string;
        category?: string;
        price?: number;
        originalPrice?: number;
    }) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json());
    },

    async deleteService(id: string) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    // Service Steps
    async createServiceStep(serviceId: string, data: { title: string; description?: string; formConfig?: any }) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/${serviceId}/steps`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json());
    },

    async updateServiceStep(stepId: string, data: { title?: string; description?: string; formConfig?: any }) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/steps/${stepId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json());
    },

    async deleteServiceStep(stepId: string) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/steps/${stepId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    async reorderServiceSteps(stepIds: string[]) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/services/steps/reorder`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stepIds })
        }).then(res => res.json());
    },

    // Company Settings
    async getCompanyProfile() {
        // Use public endpoint for reading
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/company/public`).then(res => res.json());
    },

    async updateCompanyProfile(data: any) {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/company`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json());
    }
};
