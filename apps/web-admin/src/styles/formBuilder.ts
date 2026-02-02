import { StyleSheet } from "react-native";
import { spacing } from "@trusttax/ui";

const s = spacing;

/**
 * Global form-builder styles.
 * Uses design-system spacing scale. No rounded corners (borderRadius: 0).
 */
export const formBuilder = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    padding: s[5],
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    padding: s[3],
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFF",
    minHeight: 44,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: s[3],
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: s[2],
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s[2],
    paddingVertical: s[3],
    paddingHorizontal: s[5],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  btnPrimary: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  select: {
    width: "100%",
    padding: s[3],
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    color: "#0F172A",
  },
  section: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    padding: s[4],
    marginBottom: s[4],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: s[3],
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: s[3],
  },
  fieldType: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    width: 90,
  },
  fieldLabel: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  iconBtn: {
    padding: s[2],
  },
  btnIcon: {
    padding: s[2],
    alignSelf: "center",
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[2],
    paddingVertical: s[3],
    paddingHorizontal: s[4],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[2],
    marginBottom: s[2],
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s[2],
  },
  paletteItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    gap: s[2],
  },
  paletteItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
});
