import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api, AuthenticationError, NotFoundError, NetworkError, ForbiddenError } from '../services/api';

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
            const storedToken = Cookies.get('admin_token');
            if (storedToken) {
                try {
                    setToken(storedToken);
                    const userData = await api.getMe();

                    // Verify user has ADMIN role
                    if (userData.role !== 'ADMIN') {
                        setError('Access denied. Admin privileges required.');
                        logout();
                        return;
                    }

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
                        // Retry after 3 seconds
                        setTimeout(() => {
                            initAuth();
                        }, 3000);
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
        // Verify ADMIN role before setting session
        if (newUser.role !== 'ADMIN') {
            setError('Access denied. Admin privileges required.');
            return;
        }

        setToken(newToken);
        setUser(newUser);
        setError(null);
        Cookies.set('admin_token', newToken, { expires: 7, secure: true, sameSite: 'strict' });
        Cookies.set('admin_user', JSON.stringify(newUser), { expires: 7, secure: true, sameSite: 'strict' });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('admin_token');
        Cookies.remove('admin_user');
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
                isAuthenticated: !!token && !!user && user.role === 'ADMIN'
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
