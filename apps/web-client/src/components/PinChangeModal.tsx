import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { ShieldCheck, X, AlertTriangle } from "lucide-react";
import { api } from "../services/api";
import { Button } from "@trusttax/ui";
import { PinInput } from "./PinInput";

interface PinChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WEAK_PATTERNS = [
  "123456",
  "654321",
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "ABCDEF",
  "123123",
  "QWERTY",
  "ASDFGH",
];

export const PinChangeModal: React.FC<PinChangeModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<"verify" | "new" | "confirm">("verify");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isWeak = (pin: string) => {
    if (pin.length < 6) return false;
    if (/^(.)\1+$/.test(pin)) return true;
    if (WEAK_PATTERNS.includes(pin.toUpperCase())) return true;
    return false;
  };

  const handleVerify = async () => {
    if (oldPin.length !== 6) {
      setError(t("pin.enter_pin", "PIN must be 6 digits"));
      return;
    }

    setIsLoading(true);
    try {
      await api.verifyPin(oldPin);
      setStep("new");
      setError(null);
    } catch (err: any) {
      setError(t("pin.incorrect_old", "Incorrect current PIN"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (newPin.length !== 6) {
      setError(t("pin.enter_pin", "PIN must be 6 digits"));
      return;
    }

    if (isWeak(newPin)) {
      setWarning(
        t("pin.common_pattern", "Sequences or repetitions are not allowed"),
      );
      return;
    }

    setStep("confirm");
    setError(null);
    setWarning(null);
  };

  const handleSave = async () => {
    if (confirmPin !== newPin) {
      setError(t("pin.mismatch", "PINs do not match"));
      return;
    }

    setIsLoading(true);
    try {
      await api.changePin(oldPin, newPin);
      onSuccess();
      resetState();
    } catch (err: any) {
      setError(err.message || t("pin.change_error", "Failed to change PIN"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setStep("verify");
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
    setWarning(null);
  };

  const getCurrentValue = () => {
    if (step === "verify") return oldPin;
    if (step === "new") return newPin;
    return confirmPin;
  };

  const setCurrentValue = (val: string) => {
    if (step === "verify") setOldPin(val);
    else if (step === "new") setNewPin(val);
    else setConfirmPin(val);
    setError(null);
    setWarning(null);
  };

  const handleMainAction = () => {
    switch (step) {
      case "verify":
        handleVerify();
        break;
      case "new":
        handleNext();
        break;
      case "confirm":
        handleSave();
        break;
    }
  };

  const handleCloseModal = () => {
    resetState();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={24} color="#10B981" />
            </View>
            <TouchableOpacity onPress={handleCloseModal}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {step === "verify"
              ? t("pin.verify_old_title", "Verify Current PIN")
              : step === "new"
                ? t("pin.enter_new_title", "Enter New PIN")
                : t("pin.confirm_new_title", "Confirm New PIN")}
          </Text>

          <View style={styles.descriptionRow}>
            <Text style={styles.description}>
              {step === "verify"
                ? t(
                    "pin.verify_old_desc",
                    "Please enter your current PIN to authenticate.",
                  )
                : step === "new"
                  ? t("pin.enter_new_desc", "Choose a new 6-digit PIN.")
                  : t(
                      "pin.confirm_new_desc",
                      "Re-enter your new PIN to confirm.",
                    )}
            </Text>
            {(step === "new" || step === "confirm") && (
              <Text style={styles.tipText}>
                {t("pin.alphanumeric_tip", "You can use letters and numbers")}
              </Text>
            )}
          </View>

          <PinInput
            value={getCurrentValue()}
            onChange={setCurrentValue}
            secure={true}
          />

          {warning && (
            <View style={styles.warningBox}>
              <AlertTriangle size={16} color="#B45309" />
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            onPress={handleMainAction}
            disabled={isLoading || getCurrentValue().length !== 6}
            style={{ marginTop: 16 }}
          >
            {isLoading
              ? t("pin.processing", "Processing...")
              : step === "confirm"
                ? t("pin.save_new", "Save New PIN")
                : t("pin.continue", "Continue")}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 0,
    padding: 40,
    width: "100%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  descriptionRow: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
  },
  tipText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  warningText: {
    color: "#B45309",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },
});
