import { useEffect, useMemo } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { H4, Text } from "@trusttax/ui";
import { Clock, Plus, Trash2 } from "lucide-react";

interface HourEntry {
  id: string;
  label: string; // e.g. "Weekdays"
  value: string; // e.g. "9:00 AM - 5:00 PM"
}

interface HoursFormProps {
  hours: HourEntry[];
  onChange: (hours: HourEntry[]) => void;
}

export const HoursForm = ({ hours, onChange }: HoursFormProps) => {
  const makeId = () => {
    // Prefer crypto UUID when available
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c: any = typeof crypto !== "undefined" ? crypto : undefined;
      if (c?.randomUUID) return String(c.randomUUID());
    } catch {
      // ignore
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const { normalizedHours, changed } = useMemo(() => {
    const seen = new Set<string>();
    let didChange = false;

    const normalized: HourEntry[] = (hours || []).map((raw: any, idx) => {
      // Support legacy format: [label, value]
      let entry: Partial<HourEntry>;
      if (Array.isArray(raw)) {
        entry = {
          id: undefined,
          label: String(raw[0] ?? ""),
          value: String(raw[1] ?? ""),
        };
        didChange = true;
      } else if (raw && typeof raw === "object") {
        entry = raw as Partial<HourEntry>;
      } else {
        entry = { id: undefined, label: "", value: "" };
        didChange = true;
      }

      let id = typeof entry.id === "string" && entry.id.trim() ? entry.id : "";
      if (!id || seen.has(id)) {
        id = `${makeId()}-${idx}`;
        didChange = true;
      }
      seen.add(id);

      const label = typeof entry.label === "string" ? entry.label : "";
      const value = typeof entry.value === "string" ? entry.value : "";
      if (label !== entry.label || value !== entry.value) didChange = true;

      return { id, label, value };
    });

    return { normalizedHours: normalized, changed: didChange };
  }, [hours]);

  // If we had to normalize (missing/duplicate ids, legacy formats), persist it back up.
  useEffect(() => {
    if (changed) onChange(normalizedHours);
  }, [changed, normalizedHours, onChange]);

  const addEntry = () => {
    const newEntry: HourEntry = {
      id: makeId(),
      label: "",
      value: "",
    };
    onChange([...normalizedHours, newEntry]);
  };

  const removeEntry = (id: string) => {
    onChange(normalizedHours.filter((h) => h.id !== id));
  };

  const updateEntry = (id: string, field: "label" | "value", text: string) => {
    onChange(
      normalizedHours.map((h) => (h.id === id ? { ...h, [field]: text } : h)),
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Clock size={18} color="#64748B" />
        <H4>Business Hours</H4>
      </View>
      <Text style={styles.helperText}>
        Add as many time slots as needed (e.g. "Weekdays", "Holidays").
      </Text>

      <View style={styles.list}>
        {normalizedHours.map((entry) => (
          <View key={entry.id} style={styles.row}>
            <View style={styles.fieldCol}>
              <Text style={styles.label}>Label (e.g. Mon-Fri)</Text>
              <TextInput
                style={styles.input}
                value={entry.label}
                onChangeText={(t) => updateEntry(entry.id, "label", t)}
                placeholder="Day(s)"
              />
            </View>
            <View style={styles.fieldCol}>
              <Text style={styles.label}>Hours</Text>
              <TextInput
                style={styles.input}
                value={entry.value}
                onChangeText={(t) => updateEntry(entry.id, "value", t)}
                placeholder="9:00 AM - 5:00 PM"
              />
            </View>
            <TouchableOpacity
              onPress={() => removeEntry(entry.id)}
              style={styles.deleteBtn}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={addEntry}>
        <Plus size={16} color="#2563EB" />
        <Text style={styles.addBtnText}>Add Time Slot</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  helperText: { fontSize: 13, color: "#64748B", marginBottom: 16 },

  list: { gap: 12, marginBottom: 16 },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fieldCol: { flex: 1 },

  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    padding: 8,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#0F172A",
  },

  deleteBtn: {
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  addBtnText: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
});
