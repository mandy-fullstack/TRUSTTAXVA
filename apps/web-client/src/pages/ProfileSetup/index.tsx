import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { ProfileSetupLayout } from "./ProfileSetupLayout";
import { Step1PersonalDetails } from "./steps/Step1PersonalDetails";
import { Step2TaxID } from "./steps/Step2TaxID";
import { Step3GovernmentID } from "./steps/Step3GovernmentID";
import { Step4TermsAgreement } from "./steps/Step4TermsAgreement";

export const ProfileSetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await api.getMe();
      setFormData(userProfile);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
    setStep((prev: number) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev: number) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (finalData: any) => {
    setIsSubmitting(true);
    try {
      const completeData = { ...formData, ...finalData };
      await api.updateProfile(completeData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ProfileSetupLayout
            currentStep={1}
            totalSteps={4}
            title="Identify Yourself."
            description="Professional security begins with your legal identity."
            showBack={false}
          >
            <Step1PersonalDetails onNext={handleNext} initialData={formData} />
          </ProfileSetupLayout>
        );
      case 2:
        return (
          <ProfileSetupLayout
            currentStep={2}
            totalSteps={4}
            title="Secure Access."
            description="Encrypted Tax Identification for your protection."
            onBack={handleBack}
          >
            <Step2TaxID
              onNext={handleNext}
              onBack={handleBack}
              initialData={formData}
            />
          </ProfileSetupLayout>
        );
      case 3:
        return (
          <ProfileSetupLayout
            currentStep={3}
            totalSteps={4}
            title="Verification."
            description="Government documentation is required for activation."
            onBack={handleBack}
          >
            <Step3GovernmentID
              onNext={handleNext}
              onBack={handleBack}
              initialData={formData}
            />
          </ProfileSetupLayout>
        );
      case 4:
        return (
          <ProfileSetupLayout
            currentStep={4}
            totalSteps={4}
            title="Finalization."
            description="Review our protocol before secure activation."
            onBack={handleBack}
          >
            <Step4TermsAgreement
              onSubmit={handleSubmit}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          </ProfileSetupLayout>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, height: "100%", backgroundColor: "#FFFFFF" }}>
      {renderStep()}
    </View>
  );
};
