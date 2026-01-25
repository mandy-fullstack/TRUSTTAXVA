import { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Country } from 'country-state-city';

interface CountrySelectProps {
    value: string; // ISO code
    onChange: (isoCode: string, name: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    hasError?: boolean; // Indica si hay un error de validación
}

const countries = Country.getAllCountries();

export const CountrySelect = ({
    value,
    onChange,
    placeholder,
    label,
    required,
    hasError = false,
}: CountrySelectProps) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return countries.slice(0, 100);
        const q = query.toLowerCase();
        return countries
            .filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.isoCode.toLowerCase().includes(q)
            )
            .slice(0, 100);
    }, [query]);

    const selected = countries.find((c) => c.isoCode === value);

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={styles.label}>
                    {label}{required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
                </Text>
            )}
            <TouchableOpacity
                style={[styles.trigger, hasError && styles.triggerError]}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.7}
            >
                <Text style={styles.triggerText} numberOfLines={1}>
                    {selected ? `${selected.name} (${selected.isoCode})` : placeholder || t('profile.select_country', 'Select country')}
                </Text>
                <ChevronDown
                    size={18}
                    color="#64748B"
                    style={Platform.OS === 'web' && isOpen ? ({ transform: 'rotate(180deg)' } as any) : undefined}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdown}>
                    <View style={styles.searchRow}>
                        <Search size={16} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            value={query}
                            onChangeText={setQuery}
                            placeholder={t('profile.search_country', 'Search country...')}
                            placeholderTextColor="#94A3B8"
                            autoFocus
                        />
                    </View>
                    <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                        {filtered.map((c) => (
                            <TouchableOpacity
                                key={c.isoCode}
                                style={[styles.option, value === c.isoCode && styles.optionActive]}
                                onPress={() => {
                                    onChange(c.isoCode, c.name);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionText}>
                                    {c.name} ({c.isoCode})
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {filtered.length === 0 && (
                            <Text style={styles.empty}>{t('profile.no_countries', 'No countries found')}</Text>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    requiredAsterisk: {
        color: '#DC2626',
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    } as any,
    triggerError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    triggerText: {
        fontSize: 16,
        color: '#0F172A',
        flex: 1,
    },
    dropdown: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        maxHeight: 280,
        ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}),
    } as any,
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        paddingVertical: 6,
    } as any,
    list: {
        maxHeight: 220,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    optionActive: {
        backgroundColor: '#EFF6FF',
    },
    optionText: {
        fontSize: 15,
        color: '#1E293B',
    },
    empty: {
        fontSize: 14,
        color: '#94A3B8',
        padding: 20,
        textAlign: 'center',
    },
});
