/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as cookieStorage from '../lib/cookies';
import { api, AuthenticationError, NotFoundError, NetworkError } from '../services/api';
import { AlertDialog } from '../components/AlertDialog';

interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    countryOfBirth?: string;
    primaryLanguage?: string;
    ssnMasked?: string | null;
    driverLicenseMasked?: string | null;
    passportMasked?: string | null;
    profileComplete?: boolean;
    termsAcceptedAt?: string;
}

interface GlobalAlert {
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning';
    onConfirm?: () => void;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    globalAlert: GlobalAlert;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    showAlert: (alert: Omit<GlobalAlert, 'isOpen'>) => void;
    hideAlert: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [globalAlert, setGlobalAlert] = useState<GlobalAlert>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'info'
    });

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = cookieStorage.getToken();
            if (!storedToken) {
                setIsLoading(false);
                return;
            }
            try {
                const userData = await api.getMe();
                setToken(storedToken);
                setUser(userData);
                setError(null);
            } catch (err) {
                if (err instanceof AuthenticationError) {
                    cookieStorage.clearAuth();
                    setToken(null);
                    setUser(null);
                    setError(null);
                    return;
                }
                if (err instanceof NotFoundError) {
                    setError('Your account is no longer active. Please contact support.');
                    cookieStorage.clearAuth();
                    setToken(null);
                    setUser(null);
                    return;
                }
                if (err instanceof NetworkError) {
                    setError('Connection issue. Retrying...');
                    setTimeout(() => {
                        setError(null);
                        initAuth();
                    }, 3000);
                    return;
                }
                console.error('Failed to restore session:', err);
                cookieStorage.clearAuth();
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        setError(null);
        cookieStorage.setToken(newToken);
        cookieStorage.setUser(newUser as unknown as Record<string, unknown>);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        cookieStorage.clearAuth();
    };

    const clearError = () => {
        setError(null);
    };

    const showAlert = (alert: Omit<GlobalAlert, 'isOpen'>) => {
        setGlobalAlert({ ...alert, isOpen: true });
    };

    const hideAlert = () => {
        setGlobalAlert(prev => ({ ...prev, isOpen: false }));
    };

    const refreshUser = async () => {
        if (token) {
            try {
                const userData = await api.getMe();
                setUser(userData);
            } catch (err) {
                console.error('Failed to refresh user data:', err);
                if (err instanceof AuthenticationError) {
                    logout();
                    showAlert({
                        title: 'Session Expired',
                        message: 'Your session has expired. Please sign in again.',
                        variant: 'warning'
                    });
                }
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                error,
                globalAlert,
                login,
                logout,
                clearError,
                refreshUser,
                showAlert,
                hideAlert,
                isAuthenticated: !!token,
                isAdmin: user?.role === 'ADMIN'
            }}
        >
            {children}
            <AlertDialog
                isOpen={globalAlert.isOpen}
                onClose={hideAlert}
                title={globalAlert.title}
                message={globalAlert.message}
                variant={globalAlert.variant}
                buttons={globalAlert.onConfirm ? [
                    { text: 'Cancel', onPress: hideAlert, style: 'cancel' },
                    { text: 'Confirm', onPress: () => { globalAlert.onConfirm?.(); hideAlert(); } }
                ] : undefined}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
