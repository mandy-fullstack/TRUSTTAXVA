import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface CompanyProfile {
    id: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    website: string | null;
    description: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    socialLinks: any;
    businessHours: any;
    primaryColor: string;
    secondaryColor: string;
    themeOptions: any;
}

interface CompanyContextType {
    profile: CompanyProfile | null;
    isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            const root = document.documentElement;
            root.style.setProperty('--primary-color', profile.primaryColor || '#0F172A');
            root.style.setProperty('--secondary-color', profile.secondaryColor || '#2563EB');

            // Inject theme options if available
            if (profile.themeOptions) {
                const t = profile.themeOptions;
                if (t.background) root.style.setProperty('--bg-color', t.background);
                if (t.surface) root.style.setProperty('--surface-color', t.surface);
                // Also standard light blue for primaryLight
                root.style.setProperty('--primary-light', profile.secondaryColor ? profile.secondaryColor + '1A' : '#EFF6FF');
            }
        }
    }, [profile]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await api.getCompanyProfile();
                setProfile(data);
            } catch (err) {
                console.error('Failed to load company profile', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    return (
        <CompanyContext.Provider value={{ profile, isLoading }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
