import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SensitiveDataViewerProps {
  label?: string;
  maskedValue?: string | null;
  decryptedValue?: string | null; // Pass if already available (e.g. from prop)
  onDecrypt?: () => Promise<string | null>; // Callback to fetch decrypted value
  className?: string;
  canDecrypt?: boolean;
}

export const SensitiveDataViewer: React.FC<SensitiveDataViewerProps> = ({
  label,
  maskedValue = "•••• •••• •••• ••••",
  decryptedValue: initialDecryptedValue,
  onDecrypt,
  className = "",
  canDecrypt = true,
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState<string | null>(
    initialDecryptedValue || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Effect to handle countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isVisible && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time expired, hide data
      setIsVisible(false);
      setTimeLeft(null);
      setValue(null); // Clear sensitivity
    }
    return () => clearTimeout(timer);
  }, [isVisible, timeLeft]);

  const handleViewClick = async () => {
    if (!canDecrypt) return;

    if (isVisible) {
      // If already visible, hide it
      setIsVisible(false);
      setTimeLeft(null);
      return;
    }

    // If we already have the value (passed via props), just show it
    if (initialDecryptedValue) {
      setValue(initialDecryptedValue);
      setIsVisible(true);
      setTimeLeft(60); // Start 60s countdown
      return;
    }

    // Otherwise fetch it
    if (onDecrypt) {
      setIsLoading(true);
      try {
        const decrypted = await onDecrypt();
        if (decrypted) {
          setValue(decrypted);
          setIsVisible(true);
          setTimeLeft(60); // Start 60s countdown
        }
      } catch (error) {
        console.error("Failed to decrypt:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <span className="text-sm font-medium text-gray-500 mb-1">{label}</span>
      )}

      <div className="flex items-center space-x-2">
        <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm h-10 flex items-center">
          {isLoading ? (
            <span className="animate-pulse text-gray-400">Decrypting...</span>
          ) : (
            <span
              className={
                isVisible ? "text-gray-900 dark:text-white" : "text-gray-500"
              }
            >
              {isVisible ? value : maskedValue || "N/A"}
            </span>
          )}
        </div>

        {canDecrypt && (
          <button
            onClick={handleViewClick}
            disabled={isLoading}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 h-10 w-10 flex items-center justify-center ${isVisible
                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                : "text-gray-500"
              }`}
            title={
              isVisible
                ? t("hide", "Hide")
                : t("view", "View Decrypted (Audit Logged)")
            }
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isVisible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {/* Countdown / Status Line */}
      {isVisible && timeLeft !== null && (
        <div className="mt-1 flex items-center text-xs text-amber-600 animate-pulse">
          <Clock size={12} className="mr-1" />
          <span>Closing in {timeLeft}s (Audit logged)</span>
        </div>
      )}
      {!canDecrypt && (
        <div className="mt-1 text-xs text-gray-400 flex items-center">
          <Lock size={12} className="mr-1" />
          <span>Encrypted</span>
        </div>
      )}
    </div>
  );
};
