import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input } from '@trusttax/ui';

interface Step1Props {
    onNext: (data: any) => void;
    initialData?: any;
}

export const Step1Identity: React.FC<Step1Props> = ({ onNext, initialData }) => {
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [middleName, setMiddleName] = useState(initialData?.middleName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');

    // Synchronize state if initialData is loaded asynchronously
    React.useEffect(() => {
        if (initialData?.firstName !== undefined) setFirstName(initialData.firstName.toUpperCase());
        if (initialData?.middleName !== undefined) setMiddleName(initialData.middleName.toUpperCase());
        if (initialData?.lastName !== undefined) setLastName(initialData.lastName.toUpperCase());
    }, [initialData]);

    const isValid = firstName.trim().length > 1 && lastName.trim().length > 1;

    return (
        <View style={styles.container}>
            <View style={styles.stack}>
                <Input
                    label="LEGAL FIRST NAME"
                    value={firstName}
                    onChangeText={(t: string) => setFirstName(t.replace(/\s/g, '').toUpperCase())}
                    placeholder="E.G. ARMANDO"
                    autoCapitalize="characters"
                />

                <Input
                    label="MIDDLE NAME (OPTIONAL)"
                    value={middleName}
                    onChangeText={(t: string) => setMiddleName(t.replace(/\s/g, '').toUpperCase())}
                    placeholder="E.G. DAVID"
                    autoCapitalize="characters"
                />

                <Input
                    label="LEGAL LAST NAME"
                    value={lastName}
                    onChangeText={(t: string) => setLastName(t.replace(/\s/g, '').toUpperCase())}
                    placeholder="E.G. FERRO"
                    autoCapitalize="characters"
                />
            </View>

            <Button
                onPress={() => onNext({ firstName, middleName, lastName })}
                disabled={!isValid}
                style={styles.btn}
                textStyle={styles.btnText}
            >
                PROCEED TO BIRTH RECORDS
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    stack: {
        gap: 24, // Standard system gap
        marginBottom: 40,
    },
    btn: {
        height: 52, // Standard system button height
        backgroundColor: '#0F172A',
        borderRadius: 0,
    },
    btnText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
});
