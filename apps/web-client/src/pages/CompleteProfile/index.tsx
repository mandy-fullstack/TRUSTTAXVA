import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { CompleteProfileLayout } from "./CompleteProfileLayout";
import { Step1Identity } from "./steps/Step1Identity";
import { Step1bBirth } from "./steps/Step1bBirth";
import { Step1cOrigin } from "./steps/Step1cOrigin";
import { Step2Security } from "./steps/Step2Security";
import { Step3DocumentType } from "./steps/Step3DocumentType";
import { Step3DriverLicense } from "./steps/Step3DriverLicense";
import { Step3Passport } from "./steps/Step3Passport";
// Step3Verification is deprecated
import { Step4Authorization } from "./steps/Step4Authorization";

const CompleteProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // Only fetch basic profile data initially to unblock UI
        const me = await api.getMe();

        // Decrypted data (SSN, DL, Passport) will be lazy-loaded in their respective steps
        // to prevent loading bottlenecks.


        const initialData = {
          firstName: me.firstName || "",
          middleName: me.middleName || "",
          lastName: me.lastName || "",
          dateOfBirth: me.dateOfBirth
            ? new Date(me.dateOfBirth).toISOString().split("T")[0]
            : "",
          countryOfBirth: me.countryOfBirth || "",
          primaryLanguage: me.primaryLanguage || "EN",
          taxIdType: me.taxIdType || "SSN",
          // Sensitive data will be hydrated by step components
          ssn: "",
          driverLicenseNumber: "",
          driverLicenseStateCode: "",
          driverLicenseStateName: "",
          driverLicenseIssueDate: "",
          driverLicenseExpiration: "",
          passportNumber: "",
          passportCountryOfIssue: "",
          passportIssueDate: "",
          passportExpiration: "",
          acceptTerms: !!me.termsAcceptedAt,
          // Default to undefined ID type
          idType: undefined,
        };

        setFormData(initialData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [navigate]);

  const handleNext = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async (data: any) => {
    const rawData = { ...formData, ...data };

    // Sanitize data for API
    const finalData: any = {};
    const validKeys = [
      "firstName",
      "middleName",
      "lastName",
      "dateOfBirth",
      "countryOfBirth",
      "primaryLanguage",
      "taxIdType",
      "ssn",
      "driverLicenseNumber",
      "driverLicenseStateCode",
      "driverLicenseIssueDate",
      "driverLicenseExpiration",
      "passportNumber",
      "passportCountryOfIssue",
      "passportIssueDate",
      "passportExpiration",
      "acceptTerms",
    ];

    validKeys.forEach((key) => {
      if (
        rawData[key] !== "" &&
        rawData[key] !== undefined &&
        rawData[key] !== null
      ) {
        finalData[key] = rawData[key];
      }
    });

    // Specific fix for dateOfBirth if empty string
    if (finalData.dateOfBirth === "") delete finalData.dateOfBirth;

    // STRICTLY CLEAN UNSELECTED DOCUMENT DATA
    // If user chose Passport, remove all Driver License fields
    if (
      finalData.taxIdType === "PASSPORT" ||
      (formData.idType === "PASSPORT" && !finalData.idType)
    ) {
      delete finalData.driverLicenseNumber;
      delete finalData.driverLicenseStateCode;
      delete finalData.driverLicenseIssueDate;
      delete finalData.driverLicenseExpiration;
    }
    // If user chose Driver License (DL), remove all Passport fields
    else if (
      finalData.taxIdType === "DL" ||
      (formData.idType === "DL" && !finalData.idType)
    ) {
      delete finalData.passportNumber;
      delete finalData.passportCountryOfIssue;
      delete finalData.passportIssueDate;
      delete finalData.passportExpiration;
    }

    setIsSubmitting(true);
    try {
      await api.updateProfile(finalData);
      navigate("/profile");
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const TOTAL_STEPS = 7;

  switch (step) {
    case 1:
      return (
        <CompleteProfileLayout
          currentStep={1}
          totalSteps={TOTAL_STEPS}
          title={t("profile_wizard.step1.title", "IDENTIFY")}
          subtitle={t(
            "profile_wizard.step1.subtitle",
            "ESTABLISH YOUR OFFICIAL LEGAL NOMENCLATURE.",
          )}
        >
          <Step1Identity onNext={handleNext} initialData={formData} />
        </CompleteProfileLayout>
      );
    case 2:
      return (
        <CompleteProfileLayout
          currentStep={2}
          totalSteps={TOTAL_STEPS}
          title={t("profile_wizard.step1b.title", "BIRTH")}
          subtitle={t(
            "profile_wizard.step1b.subtitle",
            "CHRONOLOGICAL VERIFICATION FOR IRS COMPLIANCE.",
          )}
        >
          <Step1bBirth
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        </CompleteProfileLayout>
      );
    case 3:
      return (
        <CompleteProfileLayout
          currentStep={3}
          totalSteps={TOTAL_STEPS}
          title={t("profile_wizard.step1c.title", "ORIGIN")}
          subtitle={t(
            "profile_wizard.step1c.subtitle",
            "GEOGRAPHICAL AND LINGUISTIC BASELINE.",
          )}
        >
          <Step1cOrigin
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        </CompleteProfileLayout>
      );
    case 4:
      return (
        <CompleteProfileLayout
          currentStep={4}
          totalSteps={TOTAL_STEPS}
          title={t("profile_wizard.step2.title", "SECURITY")}
          subtitle={t(
            "profile_wizard.step2.subtitle",
            "ENCRYPTED TAX IDENTIFICATION PROTOCOL.",
          )}
        >
          <Step2Security
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        </CompleteProfileLayout>
      );
    case 5:
      return (
        <CompleteProfileLayout
          currentStep={5}
          totalSteps={TOTAL_STEPS}
          title={t("profile_wizard.step3_type.title", "DOCUMENT")}
          subtitle={t(
            "profile_wizard.step3_type.subtitle",
            "SELECT VERIFICATION METHOD.",
          )}
        >
          <Step3DocumentType
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        </CompleteProfileLayout>
      );
    case 6:
      // Dynamic render based on selection in Step 5
      const isPassport = formData.idType === "PASSPORT";
      return (
        <CompleteProfileLayout
          currentStep={6}
          totalSteps={TOTAL_STEPS}
          title={
            isPassport
              ? t("profile_wizard.step3_passport.title", "PASSPORT")
              : t("profile_wizard.step3_dl.title", "LICENSE")
          }
          subtitle={
            isPassport
              ? t(
                "profile_wizard.step3_passport.subtitle",
                "SECURE ENCRYPTED UPLOAD & VERIFICATION.",
              )
              : t(
                "profile_wizard.step3_dl.subtitle",
                "SECURE ENCRYPTED UPLOAD & VERIFICATION.",
              )
          }
        >
          {isPassport ? (
            <Step3Passport
              onNext={handleNext}
              onBack={handleBack}
              initialData={formData}
            />
          ) : (
            <Step3DriverLicense
              onNext={handleNext}
              onBack={handleBack}
              initialData={formData}
            />
          )}
        </CompleteProfileLayout>
      );
    case 7:
      return (
        <CompleteProfileLayout
          currentStep={7}
          totalSteps={TOTAL_STEPS}
          title={t("profile_wizard.step4.title", "PROTOCOL")}
          subtitle={t(
            "profile_wizard.step4.subtitle",
            "FINAL DEPLOYMENT AND SECURE ACTIVATION.",
          )}
        >
          <Step4Authorization
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        </CompleteProfileLayout>
      );
    default:
      return null;
  }
};

export default CompleteProfilePage;
