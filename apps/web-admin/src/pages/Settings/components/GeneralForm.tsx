import { View, StyleSheet, TextInput } from "react-native";
import { H4, Text } from "@trusttax/ui";
import { Building } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GeneralFormProps {
  data: any;
  onChange: (field: string, value: string) => void;
}

export const GeneralForm = ({ data, onChange }: GeneralFormProps) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Building size={18} color="#64748B" />
        <H4>{t("settings.general")}</H4>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Company Legal Name</Text>
        <TextInput
          style={styles.input}
          value={data.companyName}
          onChangeText={(t) => onChange("companyName", t)}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Doing Business As (DBA)</Text>
        <TextInput
          style={styles.input}
          value={data.dba}
          onChangeText={(t) => onChange("dba", t)}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={data.description}
          onChangeText={(t) => onChange("description", t)}
          multiline
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>{t("settings.notification_sender_name")}</Text>
        <Text style={styles.helperText}>
          {t("settings.notification_sender_name_helper")}
        </Text>
        <TextInput
          style={styles.input}
          value={data.notificationSenderName || ""}
          onChangeText={(value) => onChange("notificationSenderName", value)}
          placeholder={t("settings.notification_sender_name_placeholder")}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  group: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  textArea: { minHeight: 120, textAlignVertical: "top", fontSize: 16 },
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    lineHeight: 16,
  },
});
