import { useEffect, useMemo, useState, createElement } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { Text } from "@trusttax/ui";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

interface PhoneNumberInputProps {
    value?: string;
    onChangeText?: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

export const PhoneNumberInput = ({
    value = "",
    onChangeText,
    placeholder = "Enter phone number",
    label,
    error,
    disabled = false,
    required = false,
}: PhoneNumberInputProps) => {
    const [phoneValue, setPhoneValue] = useState<string>(value || "");
    const [isValid, setIsValid] = useState<boolean>(true);
    const [WebPhoneInput, setWebPhoneInput] = useState<any>(null);
    const [webFlags, setWebFlags] = useState<any>(null);

    useEffect(() => {
        if (value !== phoneValue) {
            setPhoneValue(value || "");
        }
    }, [value]);

    // Web-only: load react-phone-number-input dynamically (Vite doesn't support require()).
    useEffect(() => {
        if (Platform.OS !== "web" || typeof window === "undefined") return;
        let cancelled = false;

        (async () => {
            try {
                const mod = await import("react-phone-number-input");
                const flagsMod = await import("react-phone-number-input/flags");
                if (cancelled) return;
                setWebPhoneInput(() => (mod as any).default || mod);
                setWebFlags(() => (flagsMod as any).default || flagsMod);
            } catch (e) {
                // Keep a safe fallback input if the web library can't load
                // eslint-disable-next-line no-console
                console.warn("Failed to load react-phone-number-input:", e);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (val: string | undefined) => {
        const newValue = val || "";
        setPhoneValue(newValue);

        // Validate if there's a value
        if (newValue) {
            try {
                const isValidNum = isValidPhoneNumber(newValue);
                setIsValid(isValidNum);
            } catch {
                setIsValid(false);
            }
        } else {
            setIsValid(true);
        }

        // Always call onChangeText with E.164 format if valid, or raw value
        if (onChangeText) {
            if (newValue) {
                try {
                    const parsed = parsePhoneNumber(newValue);
                    if (parsed && parsed.isValid()) {
                        onChangeText(parsed.number); // E.164 format
                    } else {
                        onChangeText(newValue); // Raw value while typing
                    }
                } catch {
                    onChangeText(newValue); // Raw value if parsing fails
                }
            } else {
                onChangeText("");
            }
        }
    };

    const webClassName = useMemo(() => {
        return [
            "tt-phone-input",
            error ? "tt-phone-input--error" : "",
            !error && !isValid && phoneValue ? "tt-phone-input--warning" : "",
            disabled ? "tt-phone-input--disabled" : "",
        ]
            .filter(Boolean)
            .join(" ");
    }, [disabled, error, isValid, phoneValue]);

    // WEB VERSION - Use createElement with data-rnw-ignore to prevent React Native Web from processing
    if (Platform.OS === "web" && typeof document !== "undefined") {
        const containerProps: any = {
            style: { width: "100%", marginBottom: "16px" },
            "data-rnw-ignore": true,
            suppressHydrationWarning: true,
        };

        const labelElement = label
            ? createElement(
                "div",
                { style: { marginBottom: "8px" } },
                createElement(
                    "span",
                    {
                        style: {
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#334155",
                            fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
                        },
                    },
                    label,
                    required
                        ? createElement("span", { style: { color: "#EF4444" } }, " *")
                        : null,
                ),
            )
            : null;

        const inputElement = WebPhoneInput
            ? createElement(WebPhoneInput, {
                international: true,
                defaultCountry: "US",
                value: phoneValue || undefined,
                onChange: handleChange,
                placeholder,
                disabled,
                flags: webFlags || undefined,
                countrySelectProps: { className: "tt-phone-input__country" },
                numberInputProps: {
                    className: "tt-phone-input__number",
                    style: { fontSize: "16px" },
                },
            })
            : createElement("input", {
                className: "tt-phone-input__number",
                type: "tel",
                value: phoneValue,
                placeholder,
                disabled,
                onChange: (e: any) => handleChange(e.target.value),
                style: {
                    width: "100%",
                    border: "none",
                    outline: "none",
                    padding: "12px",
                    fontSize: "16px",
                    background: "transparent",
                    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
                },
            });

        const inputWrapper = createElement(
            "div",
            {
                className: webClassName,
                "data-rnw-ignore": true,
                suppressHydrationWarning: true,
            },
            inputElement,
        );

        const errorElement = error
            ? createElement(
                "div",
                {
                    style: {
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#EF4444",
                        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
                    },
                },
                error,
            )
            : !isValid && phoneValue
                ? createElement(
                    "div",
                    {
                        style: {
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#F59E0B",
                            fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
                        },
                    },
                    "Please enter a valid phone number",
                )
                : null;

        return createElement("div", containerProps, labelElement, inputWrapper, errorElement);
    }

    // NATIVE VERSION (mobile)
    const styles = nativeStyles;

    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    error && styles.inputWrapperError,
                    !isValid && phoneValue && styles.inputWrapperWarning,
                    disabled && styles.inputWrapperDisabled,
                ]}
            >
                <TextInput
                    style={styles.fallbackInput}
                    value={phoneValue}
                    onChangeText={handleChange}
                    placeholder={placeholder}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    editable={!disabled}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {!isValid && phoneValue && !error && (
                <Text style={styles.warningText}>Please enter a valid phone number</Text>
            )}
        </View>
    );
};

const nativeStyles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 8,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    required: {
        color: "#EF4444",
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },
    inputWrapperError: {
        borderColor: "#EF4444",
    },
    inputWrapperWarning: {
        borderColor: "#F59E0B",
    },
    inputWrapperDisabled: {
        backgroundColor: "#F8FAFC",
        opacity: 0.6,
    },
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 4,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    warningText: {
        fontSize: 12,
        color: "#F59E0B",
        marginTop: 4,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    fallbackInput: {
        padding: 12,
        fontSize: 16,
        color: "#0F172A",
        backgroundColor: "transparent",
        borderRadius: 0,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        width: "100%",
    },
});
