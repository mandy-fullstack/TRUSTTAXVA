import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api, AuthenticationError, NotFoundError, NetworkError } from '../services/api';

interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = Cookies.get('token');
            if (storedToken) {
                try {
                    setToken(storedToken);
                    const userData = await api.getMe();
                    setUser(userData);
                    setError(null);
                } catch (err) {
                    console.error('Failed to restore session:', err);

                    // Handle different error types
                    if (err instanceof AuthenticationError || err instanceof NotFoundError) {
                        // Token invalid or user deleted - clear session
                        if (err instanceof NotFoundError) {
                            setError('Your account is no longer active. Please contact support.');
                        }
                        logout();
                    } else if (err instanceof NetworkError) {
                        // Network issue - keep session but show error
                        setError('Connection issue. Retrying...');
                        setIsLoading(false);
                        // Retry after 3 seconds
                        setTimeout(() => {
                            setError(null);
                            initAuth();
                        }, 3000);
                        return;
                    } else {
                        // Unknown error - clear session to be safe
                        logout();
                    }
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        setError(null);
        Cookies.set('token', newToken, { expires: 7, secure: true, sameSite: 'strict' });
        Cookies.set('user', JSON.stringify(newUser), { expires: 7, secure: true, sameSite: 'strict' });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('token');
        Cookies.remove('user');
    };

    const clearError = () => {
        setError(null);
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
