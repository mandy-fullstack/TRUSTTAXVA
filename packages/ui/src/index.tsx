import { useState, useRef, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  TouchableOpacity as RNTouchableOpacity,
  ActivityIndicator,
  TextInput,
  Animated,
} from "react-native";
import { spacing, space, type SpaceKey } from "./spacing";

export { spacing, space } from "./spacing";

// Professional Design System Constants
const theme = {
  colors: {
    primary: "var(--primary-color, #2563EB)",
    primaryLight: "var(--primary-light, #EFF6FF)",
    secondary: "var(--secondary-color, #0F172A)",
    neutral: "#0F172A",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    dangerLight: "#FEF2F2",
    slate: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
  },
  radius: 0,
  spacing,
  space,
  fonts: {
    inter: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
};

const toPx = (v: SpaceKey | number) => (typeof v === "number" ? v : space[v]);

/** Vertical or horizontal spacer. Use for consistent gaps. */
export const Spacer = ({
  size = "lg",
  direction = "vertical",
  style,
}: {
  size?: SpaceKey | number;
  direction?: "vertical" | "horizontal";
  style?: any;
}) => {
  const px = toPx(size);
  return (
    <View
      style={[
        { [direction === "vertical" ? "height" : "width"]: px, flexShrink: 0 },
        style,
      ]}
    />
  );
};

/** Vertical stack with gap between children. */
export const Stack = ({
  gap = "md",
  children,
  style,
}: {
  gap?: SpaceKey | number;
  children?: React.ReactNode;
  style?: any;
}) => (
  <View style={[{ flexDirection: "column", gap: toPx(gap) }, style]}>
    {children}
  </View>
);

/** Horizontal row with gap between children. */
export const Inline = ({
  gap = "md",
  wrap,
  children,
  style,
}: {
  gap?: SpaceKey | number;
  wrap?: boolean;
  children?: React.ReactNode;
  style?: any;
}) => (
  <View
    style={[
      {
        flexDirection: "row",
        alignItems: "center",
        gap: toPx(gap),
        flexWrap: wrap ? "wrap" : "nowrap",
      },
      style,
    ]}
  >
    {children}
  </View>
);

// --- TYPOGRAPHY ---
export const H1 = ({ children, style }: any) => (
  <RNText style={[styles.h1, style]}>{children}</RNText>
);
export const H2 = ({ children, style }: any) => (
  <RNText style={[styles.h2, style]}>{children}</RNText>
);
export const H3 = ({ children, style }: any) => (
  <RNText style={[styles.h3, style]}>{children}</RNText>
);
export const H4 = ({ children, style }: any) => (
  <RNText style={[styles.h4, style]}>{children}</RNText>
);
export const Subtitle = ({ children, style }: any) => (
  <RNText style={[styles.subtitle, style]}>{children}</RNText>
);
export const Text = ({ children, style }: any) => (
  <RNText style={[styles.text, style]}>{children}</RNText>
);

// --- CARD ---
export const Card = ({
  children,
  style,
  padding = spacing[6],
  elevated = true,
}: any) => (
  <View style={[styles.card, { padding }, elevated && styles.elevated, style]}>
    {children}
  </View>
);

// --- INPUT ---
export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  icon,
  iconPosition = "left",
  style,
  keyboardType,
  maxLength,
  autoCapitalize,
  labelStyle,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputGroup, style]}>
      {label && <RNText style={[styles.inputLabel, labelStyle]}>{label}</RNText>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          { flexDirection: "row", alignItems: "center", gap: spacing[3] },
        ]}
      >
        {icon && iconPosition === "left" && icon}
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
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
        {icon && iconPosition === "right" && icon}
      </View>
    </View>
  );
};

// --- BADGE ---
export const Badge = ({ label, variant = "neutral", style }: any) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return { bg: "#EFF6FF", text: "#2563EB" };
      case "success":
        return { bg: "#DCFCE7", text: "#15803D" };
      case "warning":
        return { bg: "#FEF3C7", text: "#B45309" };
      case "danger":
        return { bg: "#FEE2E2", text: "#B91C1C" };
      default:
        return { bg: "#F1F5F9", text: "#475569" };
    }
  };
  const v = getVariantStyle();
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <RNText style={[styles.badgeText, { color: v.text }]}>{label}</RNText>
    </View>
  );
};

// --- BUTTON ---
export const Button = ({
  title,
  children,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  iconPosition = "left",
  style,
  textStyle,
}: any) => {
  const getButtonStyle = () => {
    if (variant === "primary") return styles.btnPrimary;
    if (variant === "secondary") return styles.btnSecondary;
    if (variant === "neutral") return styles.btnNeutral;
    if (variant === "danger") return styles.btnDanger;
    if (variant === "ghost") return styles.btnGhost;
    return styles.btnOutline;
  };

  const getTextStyle = () => {
    if (variant === "primary") return styles.btnTextPrimary;
    if (variant === "secondary") return styles.btnTextSecondary;
    if (variant === "neutral") return styles.btnTextNeutral;
    if (variant === "danger") return styles.btnTextDanger;
    if (variant === "ghost") return styles.btnTextGhost;
    return styles.btnTextOutline;
  };

  const getActivityIndicatorColor = () => {
    if (variant === "primary") return "#FFF";
    return theme.colors.primary;
  };

  return (
    <RNTouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        getButtonStyle(),
        (loading || disabled) && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} />
      ) : (
        <View style={[styles.btnContent, { gap: spacing[3] }]} key={variant}>
          {icon && iconPosition === "left" && icon}
          <RNText style={[styles.btnText, getTextStyle(), textStyle]}>
            {title || children}
          </RNText>
          {icon && iconPosition === "right" && icon}
        </View>
      )}
    </RNTouchableOpacity>
  );
};

// --- TABLE ---
export const Table = ({ headers, data, renderRow, style }: any) => (
  <View style={[styles.table, style]}>
    <View style={styles.tableHeader}>
      {headers.map((h: any, i: number) => (
        <RNText key={i} style={[styles.th, h.style]}>
          {h.label}
        </RNText>
      ))}
    </View>
    <View>
      {data.map((item: any, index: number) => (
        <View
          key={index}
          style={[
            styles.tr,
            index === data.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
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

// --- SWITCH ---
export const Switch = ({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) => {
  const translateX = useRef(new Animated.Value(value ? 23 : 3)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 23 : 3,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <RNTouchableOpacity
      activeOpacity={0.9}
      onPress={() => !disabled && onValueChange(!value)}
      style={[
        styles.switchTrack,
        value ? styles.switchTrackOn : styles.switchTrackOff,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Animated.View
        style={[styles.switchThumb, { transform: [{ translateX }] }]}
      />
    </RNTouchableOpacity>
  );
};

export const StatsCard = ({
  label,
  value,
  trend,
  trendValue,
  trendColor,
  trendLabel,
  style,
}: any) => (
  <Card style={[styles.statsCard, style]}>
    <RNText style={styles.statsLabel}>{label}</RNText>
    <RNText style={styles.statsValue}>{value}</RNText>
    {trend && (
      <View style={styles.trendRow}>
        <RNText
          style={[
            styles.trendValue,
            { color: trendColor || theme.colors.success },
          ]}
        >
          {trendValue}
        </RNText>
        {trendLabel && <RNText style={styles.trendText}>{trendLabel}</RNText>}
      </View>
    )}
  </Card>
);

const s = spacing;
const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.slate[900],
    letterSpacing: -0.8,
    marginBottom: s[2],
    fontFamily: theme.fonts.inter,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.slate[900],
    letterSpacing: -0.5,
    marginBottom: s[1],
    fontFamily: theme.fonts.inter,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.slate[900],
    letterSpacing: -0.3,
    fontFamily: theme.fonts.inter,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.slate[900],
    fontFamily: theme.fonts.inter,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.slate[500],
    lineHeight: 24,
    fontFamily: theme.fonts.inter,
  },
  text: {
    fontSize: 14,
    color: theme.colors.slate[600],
    lineHeight: 22,
    fontFamily: theme.fonts.inter,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.slate[100],
    overflow: "hidden",
    borderRadius: 0,
  },
  elevated: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: s[1],
    alignSelf: "flex-start",
    borderRadius: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: theme.fonts.inter,
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: s[8],
    minWidth: 120,
    flexShrink: 0,
    borderRadius: 0,
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimary: { backgroundColor: theme.colors.primary },
  btnSecondary: { backgroundColor: theme.colors.secondary },
  btnNeutral: { backgroundColor: theme.colors.neutral },
  btnDanger: {
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  btnGhost: { backgroundColor: "transparent", borderWidth: 0 },
  btnContent: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  btnText: {
    fontSize: 13,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    flexShrink: 0,
    fontFamily: theme.fonts.inter,
  },
  btnTextPrimary: { color: "#FFFFFF" },
  btnTextSecondary: { color: "#FFFFFF" },
  btnTextNeutral: { color: "#FFFFFF" },
  btnTextDanger: { color: theme.colors.danger },
  btnTextOutline: { color: theme.colors.primary },
  btnTextGhost: { color: theme.colors.slate[700] },
  inputGroup: { marginBottom: s[4], width: "100%" },
  inputLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.slate[700],
    marginBottom: s[2],
    fontFamily: theme.fonts.inter,
  },
  inputWrapper: {
    height: 48,
    borderWidth: 1.5,
    borderColor: theme.colors.slate[200],
    paddingHorizontal: s[4],
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    borderRadius: 0,
  },
  inputWrapperFocused: { borderColor: theme.colors.primary },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.slate[900],
    height: "100%",
    outlineStyle: "none",
    fontFamily: theme.fonts.inter,
  } as any,

  table: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: theme.colors.slate[200],
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.colors.slate[50],
    padding: s[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.slate[200],
  },
  th: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.slate[500],
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: theme.fonts.inter,
  },
  tr: {
    flexDirection: "row",
    padding: s[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.slate[100],
    alignItems: "center",
  },
  tdText: {
    fontSize: 14,
    color: theme.colors.slate[900],
    fontFamily: theme.fonts.inter,
  },

  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.slate[200],
    marginBottom: s[6],
  },
  tab: {
    paddingVertical: s[3],
    paddingHorizontal: s[4],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: theme.colors.primary },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.slate[500],
    fontFamily: theme.fonts.inter,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontFamily: theme.fonts.inter,
  },

  statsCard: { minWidth: 240, flex: 1 },
  statsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.slate[500],
    marginBottom: s[2],
    fontFamily: theme.fonts.inter,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.slate[900],
    marginBottom: s[2],
    fontFamily: theme.fonts.inter,
  },
  trendRow: { flexDirection: "row", alignItems: "center", gap: s[2] },
  trendValue: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: theme.fonts.inter,
  },
  trendText: {
    fontSize: 13,
    color: theme.colors.slate[400],
    fontFamily: theme.fonts.inter,
  },

  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 0,
    padding: 3,
    justifyContent: "center",
    borderWidth: 1,
  },
  switchTrackOn: {
    backgroundColor: theme.colors.neutral,
    borderColor: theme.colors.neutral,
  },
  switchTrackOff: {
    backgroundColor: theme.colors.slate[200],
    borderColor: theme.colors.slate[300],
  },
  switchThumb: {
    width: 16,
    height: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.slate[100],
  },
});
