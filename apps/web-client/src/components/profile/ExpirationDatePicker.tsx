import { useTranslation } from "react-i18next";
import { DatePicker } from "./DatePicker";

interface ExpirationDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

/**
 * Mismo componente de fecha de expiración para licencia, pasaporte, etc.
 * Usa DatePicker internamente para consistencia.
 */
export const ExpirationDatePicker = ({
  value,
  onChange,
  label,
}: ExpirationDatePickerProps) => {
  const { t } = useTranslation();

  return (
    <DatePicker
      label={label ?? t("profile.expiration_date", "Expiration date")}
      value={value}
      onChange={onChange}
      placeholder="YYYY-MM-DD"
    />
  );
};
