/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as cookieStorage from '../lib/cookies';
import { api, AuthenticationError, NotFoundError, NetworkError } from '../services/api';

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

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    clearError: () => void;
    refreshUser: () => Promise<void>; // Método para actualizar los datos del usuario
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const refreshUser = async () => {
        if (token) {
            try {
                const userData = await api.getMe();
                setUser(userData);
            } catch (err) {
                console.error('Failed to refresh user data:', err);
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
                login,
                logout,
                clearError,
                refreshUser,
                isAuthenticated: !!token
            }}
        >
            {children}
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
