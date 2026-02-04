import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Button, Text, Input } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { Shield, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { WizardCountrySelect } from "../components/WizardCountrySelect";
import { api } from "../../../services/api";

interface Step3PassportProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step3Passport: React.FC<Step3PassportProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [passportNumber, setPassportNumber] = useState(
    initialData?.passportNumber || "",
  );
  const [passportCountry, setPassportCountry] = useState(
    initialData?.passportCountryOfIssue || "",
  );
  const [passportIssueDate, setPassportIssueDate] = useState(
    initialData?.passportIssueDate || "",
  );
  const [passportExpiration, setPassportExpiration] = useState(
    initialData?.passportExpiration || "",
  );
  const [error, setError] = useState("");

  // Lazy load Passport data
  React.useEffect(() => {
    const fetchPassport = async () => {
      if (passportNumber) return; // Already has data

      try {
        const passport = await api.getDecryptedPassport();
        if (passport) {
          setPassportNumber(passport.number || "");
          setPassportCountry(passport.countryOfIssue || "");
          setPassportIssueDate(passport.issueDate || "");
          setPassportExpiration(passport.expirationDate || "");
        }
      } catch (error) {
        console.log("Lazy load Passport failed", error);
      }
    };
    fetchPassport();
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatMaskedDate = (val: string) => {
    const d = val.replace(/\D/g, "");
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)} / ${d.slice(2)}`;
    return `${d.slice(0, 2)} / ${d.slice(2, 4)} / ${d.slice(4, 8)}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError("");

    try {
      await api.uploadProfileDocument(file, "PASSPORT");
      setUploadSuccess(true);
    } catch (err: any) {
      console.error(err);
      setUploadError(
        t("profile_wizard.common.upload_failed", "Failed to upload document."),
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    if (
      !passportNumber ||
      !passportCountry ||
      !passportIssueDate ||
      !passportExpiration
    ) {
      setError(
        t(
          "profile_wizard.common.all_fields_required",
          "ALL FIELDS ARE REQUIRED",
        ),
      );
      return;
    }
    setError("");
    onNext({
      passportNumber,
      passportCountryOfIssue: passportCountry,
      passportIssueDate,
      passportExpiration,
    });
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*,.pdf"
          onChange={handleFileSelect}
        />
      )}

      <View style={styles.header}>
        <Shield size={24} color="#0F172A" />
        <Text style={styles.headerTitle}>
          {t("profile_wizard.step3_passport.header", "PASSPORT DETAILS")}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label={t("profile_wizard.step3_passport.number", "PASSPORT NUMBER")}
          value={passportNumber}
          onChangeText={(t: string) => {
            setPassportNumber(t.toUpperCase());
            setError("");
          }}
          placeholder={t("profile_wizard.common.enter_number", "ENTER NUMBER")}
          style={
            error && !passportNumber ? { borderColor: "#EF4444" } : undefined
          }
        />

        <View style={[styles.group, { zIndex: 100 }]}>
          <Text style={styles.label}>
            {t("profile_wizard.step3_passport.country", "COUNTRY OF ISSUE")}
          </Text>
          <WizardCountrySelect
            value={passportCountry}
            onChange={(val) => {
              setPassportCountry(val);
              setError("");
            }}
            placeholder={t(
              "profile_wizard.step3_passport.country_placeholder",
              "SELECT COUNTRY",
            )}
          />
          {!!error && !passportCountry && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 10,
                marginTop: 4,
                fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
              }}
            >
              {t("profile_wizard.common.required", "REQUIRED")}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.row,
            { zIndex: 0, flexDirection: width < 600 ? "column" : "row" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Input
              label={t("profile_wizard.step3_passport.issued", "ISSUED DATE")}
              value={formatMaskedDate(passportIssueDate)}
              onChangeText={(t: string) => {
                setPassportIssueDate(t.replace(/\D/g, "").slice(0, 8));
                setError("");
              }}
              placeholder={t(
                "profile_wizard.common.date_placeholder",
                "MM / DD / YYYY",
              )}
              style={
                error && !passportIssueDate
                  ? { borderColor: "#EF4444" }
                  : undefined
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t(
                "profile_wizard.step3_passport.expiration",
                "EXPIRATION DATE",
              )}
              value={formatMaskedDate(passportExpiration)}
              onChangeText={(t: string) => {
                setPassportExpiration(t.replace(/\D/g, "").slice(0, 8));
                setError("");
              }}
              placeholder={t(
                "profile_wizard.common.date_placeholder",
                "MM / DD / YYYY",
              )}
              style={
                error && !passportExpiration
                  ? { borderColor: "#EF4444" }
                  : undefined
              }
            />
          </View>
        </View>

        <View
          style={[
            styles.photoSection,
            uploadSuccess && styles.photoSectionSuccess,
            !!uploadError && styles.photoSectionError,
          ]}
        >
          <View style={styles.photoHeader}>
            <Text style={styles.label}>
              {t(
                "profile_wizard.step3_passport.photo_label",
                "DOCUMENT PHOTO (REQUIRED)",
              )}
            </Text>
            {isUploading && (
              <Loader2 size={16} color="#2563EB" className="animate-spin" />
            )}
            {uploadSuccess && <Check size={16} color="#16A34A" />}
          </View>

          <TouchableOpacity
            style={[styles.photoBtn, uploadSuccess && styles.photoBtnSuccess]}
            onPress={() => {
              if (uploadError) setUploadError("");
              triggerFileSelect();
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <Text style={styles.photoBtnText}>
                {t("profile_wizard.common.encrypting", "ENCRYPTING...")}
              </Text>
            ) : uploadSuccess ? (
              <>
                <Check size={20} color="#16A34A" />
                <Text style={[styles.photoBtnText, { color: "#16A34A" }]}>
                  {t(
                    "profile_wizard.common.upload_complete",
                    "UPLOAD COMPLETE",
                  )}
                </Text>
              </>
            ) : (
              <>
                <Camera size={20} color="#64748B" />
                <Text style={styles.photoBtnText}>
                  {t("profile_wizard.common.capture_photo", "CAPTURE PHOTO")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!!uploadError && (
            <View style={styles.errorRow}>
              <AlertCircle size={14} color="#EF4444" />
              <Text style={styles.errorText}>{uploadError}</Text>
            </View>
          )}
        </View>
      </View>

      {error ? (
        <Text
          style={{
            color: "#EF4444",
            textAlign: "center",
            marginBottom: 16,
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {error}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          style={styles.btn}
          textStyle={styles.btnText}
        >
          {t("profile_wizard.step3_passport.proceed", "CONFIRM & PROCEED")}
        </Button>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>
            {t("profile_wizard.common.retract_step", "RETRACT STEP")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: 0.5,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  form: { gap: 24, marginBottom: 40 },
  row: { gap: 16 },
  group: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  photoSection: {
    gap: 12,
    padding: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },
  photoSectionSuccess: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  photoSectionError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoBtn: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  photoBtnSuccess: { borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
  photoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.5,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  footer: { gap: 16, paddingBottom: 40 },
  btn: { height: 52, backgroundColor: "#0F172A", borderRadius: 0 },
  btnText: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  back: { alignItems: "center", paddingVertical: 8 },
  backText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});
