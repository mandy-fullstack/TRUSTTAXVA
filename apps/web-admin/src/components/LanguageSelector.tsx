import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "@trusttax/ui";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const flagStyles = StyleSheet.create({
  wrapper: {
    width: 24,
    height: 18,
    borderRadius: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  image: {
    width: "100%" as const,
    height: "100%" as const,
  },
});

function FlagIcon({ lang }: { lang: string }) {
  const isEn = lang.startsWith("en");
  const flagUrl = isEn
    ? "https://flagcdn.com/w80/us.png"
    : "https://flagcdn.com/w80/es.png";
  return (
    <View style={flagStyles.wrapper}>
      <Image
        source={{ uri: flagUrl }}
        style={flagStyles.image}
        resizeMode="cover"
      />
    </View>
  );
}

interface LanguageSelectorProps {
  variant?: "desktop" | "mobile";
  showChevron?: boolean;
}

export const LanguageSelector = ({
  variant = "desktop",
  showChevron = true,
}: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const isMobile = variant === "mobile";

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("en") ? "es" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      style={isMobile ? styles.mobileSelector : styles.desktopSelector}
      activeOpacity={0.7}
    >
      <FlagIcon lang={i18n.language} />
      <Text
        style={[
          isMobile ? styles.mobileText : styles.desktopText,
          { color: "#0F172A" },
        ]}
      >
        {i18n.language.startsWith("en") ? "EN" : "ES"}
      </Text>
      {showChevron && !isMobile && <ChevronDown size={14} color="#64748B" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  desktopSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  desktopText: {
    fontSize: 13,
    fontWeight: "700",
  },
  mobileSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 0,
  },
  mobileText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
