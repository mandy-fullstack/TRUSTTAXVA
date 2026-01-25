import { useState } from 'react';
import { View, Text as RNText, StyleSheet, TouchableOpacity as RNTouchableOpacity, ActivityIndicator, TextInput } from 'react-native';

// Professional Design System Constants
const theme = {
    colors: {
        primary: 'var(--primary-color, #2563EB)',
        primaryLight: 'var(--primary-light, #EFF6FF)',
        secondary: 'var(--secondary-color, #1E293B)',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
        }
    },
    radius: 0,
};

// --- TYPOGRAPHY ---
export const H1 = ({ children, style }: any) => <RNText style={[styles.h1, style]}>{children}</RNText>;
export const H2 = ({ children, style }: any) => <RNText style={[styles.h2, style]}>{children}</RNText>;
export const H3 = ({ children, style }: any) => <RNText style={[styles.h3, style]}>{children}</RNText>;
export const H4 = ({ children, style }: any) => <RNText style={[styles.h4, style]}>{children}</RNText>;
export const Subtitle = ({ children, style }: any) => <RNText style={[styles.subtitle, style]}>{children}</RNText>;
export const Text = ({ children, style }: any) => <RNText style={[styles.text, style]}>{children}</RNText>;

// --- CARD ---
export const Card = ({ children, style, padding = 24, elevated = true }: any) => (
    <View style={
        [
            styles.card,
            { padding },
            elevated && styles.elevated,
            style
        ]} >
        {children}
    </View>
);

// --- INPUT ---
export const Input = ({ label, placeholder, value, onChangeText, secureTextEntry, icon, iconPosition = 'left', style }: any) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.inputGroup, style]}>
            {label && <RNText style={styles.inputLabel}>{label}</RNText>}
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                { flexDirection: 'row', alignItems: 'center', gap: 12 }
            ]}>
                {icon && iconPosition === 'left' && icon}
                <TextInput
                    style={styles.inputText}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    underlineColorAndroid="transparent"
                />
                {icon && iconPosition === 'right' && icon}
            </View>
        </View>
    );
};

// --- BADGE ---
export const Badge = ({ label, variant = 'neutral', style }: any) => {
    const getVariantStyle = () => {
        switch (variant) {
            case 'primary': return { bg: '#EFF6FF', text: '#2563EB' };
            case 'success': return { bg: '#DCFCE7', text: '#15803D' };
            case 'warning': return { bg: '#FEF3C7', text: '#B45309' };
            case 'danger': return { bg: '#FEE2E2', text: '#B91C1C' };
            default: return { bg: '#F1F5F9', text: '#475569' };
        }
    };
    const v = getVariantStyle();
    return (
        <View style={[styles.badge, { backgroundColor: v.bg }, style]} >
            <RNText style={[styles.badgeText, { color: v.text }]}>{label}</RNText>
        </View>
    );
};

// --- BUTTON ---
export const Button = ({ title, onPress, variant = 'primary', loading, disabled, icon, iconPosition = 'left', style, textStyle }: any) => (
    <RNTouchableOpacity
        onPress={onPress}
        disabled={loading || disabled}
        activeOpacity={0.7}
        style={
            [
                styles.button,
                variant === 'primary' ? styles.btnPrimary : styles.btnOutline,
                style
            ]}
    >
        {loading ? (
            <ActivityIndicator color={variant === 'primary' ? '#FFF' : theme.colors.primary} />
        ) : (
            <View style={styles.btnContent}>
                {icon && iconPosition === 'left' && icon}
                <RNText style={[
                    styles.btnText,
                    variant === 'primary' ? styles.btnTextPrimary : styles.btnTextOutline,
                    textStyle
                ]}>{title}</RNText>
                {icon && iconPosition === 'right' && icon}
            </View>
        )}
    </RNTouchableOpacity>
);

// --- TABLE ---
export const Table = ({ headers, data, renderRow, style }: any) => (
    <View style={[styles.table, style]}>
        <View style={styles.tableHeader}>
            {headers.map((h: any, i: number) => (
                <RNText key={i} style={[styles.th, h.style]}>{h.label}</RNText>
            ))}
        </View>
        <View>
            {data.map((item: any, index: number) => (
                <View key={index} style={[styles.tr, index === data.length - 1 && { borderBottomWidth: 0 }]}>
                    {renderRow(item, index)}
                </View>
            ))}
        </View>
    </View>
);

// --- TABS ---
export const Tabs = ({ tabs, activeTab, onTabChange, style }: any) => (
    <View style={[styles.tabsContainer, style]}>
        {tabs.map((tab: any) => {
            const isActive = activeTab === tab.id;
            return (
                <RNTouchableOpacity
                    key={tab.id}
                    onPress={() => onTabChange(tab.id)}
                    style={[styles.tab, isActive && styles.tabActive]}
                >
                    <RNText style={[styles.tabText, isActive && styles.tabTextActive]}>
                        {tab.label}
                    </RNText>
                </RNTouchableOpacity>
            );
        })}
    </View>
);

// --- STATS CARD ---
export const StatsCard = ({ label, value, trend, trendValue, trendColor, style }: any) => (
    <Card style={[styles.statsCard, style]}>
        <RNText style={styles.statsLabel}>{label}</RNText>
        <RNText style={styles.statsValue}>{value}</RNText>
        {trend && (
            <View style={styles.trendRow}>
                <RNText style={[styles.trendValue, { color: trendColor || theme.colors.success }]}>
                    {trendValue}
                </RNText>
                <RNText style={styles.trendText}> vs last month</RNText>
            </View>
        )}
    </Card>
);

const styles = StyleSheet.create({
    h1: { fontSize: 32, fontWeight: '700', color: theme.colors.slate[900], letterSpacing: -0.8, marginBottom: 8 },
    h2: { fontSize: 24, fontWeight: '700', color: theme.colors.slate[900], letterSpacing: -0.5, marginBottom: 4 },
    h3: { fontSize: 20, fontWeight: '600', color: theme.colors.slate[900], letterSpacing: -0.3 },
    h4: { fontSize: 18, fontWeight: '600', color: theme.colors.slate[900] },
    subtitle: { fontSize: 16, color: theme.colors.slate[500], lineHeight: 24 },
    text: { fontSize: 14, color: theme.colors.slate[600], lineHeight: 22 },
    card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: theme.colors.slate[200], overflow: 'hidden' },
    elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    button: { height: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    btnPrimary: { backgroundColor: theme.colors.primary },
    btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    btnText: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1.5 },
    btnTextPrimary: { color: '#FFFFFF' },
    btnTextOutline: { color: theme.colors.primary },
    inputGroup: { marginBottom: 16, width: '100%' },
    inputLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.slate[700], marginBottom: 6 },
    inputWrapper: { height: 48, borderWidth: 1.5, borderColor: theme.colors.slate[200], paddingHorizontal: 16, backgroundColor: '#FFFFFF', justifyContent: 'center' },
    inputWrapperFocused: { borderColor: theme.colors.primary },
    inputText: { flex: 1, fontSize: 16, color: theme.colors.slate[900], height: '100%', outlineStyle: 'none' } as any,

    // NEW SHADCN STYLES
    table: { width: '100%', borderTopWidth: 1, borderTopColor: theme.colors.slate[200] },
    tableHeader: { flexDirection: 'row', backgroundColor: theme.colors.slate[50], padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.slate[200] },
    th: { fontSize: 12, fontWeight: '700', color: theme.colors.slate[500], textTransform: 'uppercase', letterSpacing: 1 },
    tr: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.slate[100], alignItems: 'center' },
    tdText: { fontSize: 14, color: theme.colors.slate[900] },

    tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.slate[200], marginBottom: 24 },
    tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: theme.colors.primary },
    tabText: { fontSize: 14, fontWeight: '500', color: theme.colors.slate[500] },
    tabTextActive: { color: theme.colors.primary, fontWeight: '600' },

    statsCard: { minWidth: 240, flex: 1 },
    statsLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.slate[500], marginBottom: 8 },
    statsValue: { fontSize: 28, fontWeight: '700', color: theme.colors.slate[900], marginBottom: 8 },
    trendRow: { flexDirection: 'row', alignItems: 'center' },
    trendValue: { fontSize: 13, fontWeight: '600' },
    trendText: { fontSize: 13, color: theme.colors.slate[400] },
});
