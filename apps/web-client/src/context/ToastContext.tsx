import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { X, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
    id: string;
    title: string;
    message: string;
    type?: ToastType;
    duration?: number;
    link?: string;
    onClose: (id: string) => void;
}

const Toast = ({ id, title, message, type = 'info', link, onClose }: ToastProps) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-20)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => onClose(id));
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="#10B981" />;
            case 'error': return <AlertCircle size={20} color="#EF4444" />;
            case 'warning': return <AlertCircle size={20} color="#F59E0B" />;
            default: return <MessageSquare size={20} color="#3B82F6" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'warning': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    return (
        <Animated.View style={[
            styles.toast,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }], borderLeftColor: getBorderColor() }
        ]}>
            <TouchableOpacity
                style={styles.content}
                onPress={() => {
                    if (link) window.location.href = link;
                    handleClose();
                }}
                activeOpacity={0.9}
            >
                <View style={styles.iconContainer}>
                    {getIcon()}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{message}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <X size={16} color="#94A3B8" />
            </TouchableOpacity>
        </Animated.View>
    );
};

interface ToastContextType {
    showToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

    const showToast = useCallback(({ title, message, type = 'info', duration = 5000, link }: Omit<ToastProps, 'id' | 'onClose'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, title, message, type, duration, link }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={styles.container} pointerEvents="box-none">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={removeToast} />
                ))}
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 20,
    },
    toast: {
        backgroundColor: '#FFFFFF',
        width: Platform.OS === 'web' ? 360 : Dimensions.get('window').width - 40,
        maxWidth: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderLeftWidth: 4,
        borderRadius: 0, // Strict No Corners
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#64748B',
    },
    closeBtn: {
        padding: 5,
        marginLeft: 8,
    }
});
