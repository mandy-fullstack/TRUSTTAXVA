import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";

interface WizardDateSelectProps {
  value?: string; // ISO format: YYYY-MM-DD
  onChange?: (isoDate: string) => void;
  label?: string;
  error?: string;
  minAge?: number; // Minimum age in years (default: 18)
  maxAge?: number; // Maximum age in years (default: 100)
}

const getMonths = (t: any) => [
  { value: 1, label: t("common.months.january", "JANUARY") },
  { value: 2, label: t("common.months.february", "FEBRUARY") },
  { value: 3, label: t("common.months.march", "MARCH") },
  { value: 4, label: t("common.months.april", "APRIL") },
  { value: 5, label: t("common.months.may", "MAY") },
  { value: 6, label: t("common.months.june", "JUNE") },
  { value: 7, label: t("common.months.july", "JULY") },
  { value: 8, label: t("common.months.august", "AUGUST") },
  { value: 9, label: t("common.months.september", "SEPTEMBER") },
  { value: 10, label: t("common.months.october", "OCTOBER") },
  { value: 11, label: t("common.months.november", "NOVEMBER") },
  { value: 12, label: t("common.months.december", "DECEMBER") },
];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const getYears = (minAge: number, maxAge: number): number[] => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - maxAge;
  const maxYear = currentYear - minAge;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }
  return years;
};

export const WizardDateSelect: React.FC<WizardDateSelectProps> = ({
  value,
  onChange,
  label,
  error,
  minAge = 18,
  maxAge = 100,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const MONTHS = getMonths(t);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Parse initial value
  const parseValue = (): { year: number; month: number; day: number } => {
    if (value && value.includes("-")) {
      const [y, m, d] = value.split("-").map(Number);
      if (y && m && d) return { year: y, month: m, day: d };
    }
    return { year: currentYear - minAge, month: 1, day: 1 };
  };

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const parsed = parseValue();
    return parsed.year;
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const parsed = parseValue();
    return parsed.month;
  });
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const parsed = parseValue();
    return parsed.day;
  });

  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  const years = getYears(minAge, maxAge);
  const maxDays = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Update day if it exceeds max days for selected month/year
  useEffect(() => {
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear, maxDays, selectedDay]);

  // Calculate age
  const calculateAge = (): number | null => {
    if (!selectedYear || !selectedMonth || !selectedDay) return null;
    const birthDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();

  // Validate date
  const isValidDate = (): boolean => {
    if (!selectedYear || !selectedMonth || !selectedDay) return false;
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    return (
      date.getFullYear() === selectedYear &&
      date.getMonth() === selectedMonth - 1 &&
      date.getDate() === selectedDay
    );
  };

  const isAgeValid = (): boolean => {
    if (age === null) return false;
    return age >= minAge && age <= maxAge;
  };

  // Update parent when selection changes
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay && isValidDate()) {
      const isoDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      if (onChange) {
        onChange(isoDate);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay, onChange]);

  // Parse value when it changes externally
  useEffect(() => {
    if (value && value.includes("-")) {
      const [y, m, d] = value.split("-").map(Number);
      if (y && m && d) {
        setSelectedYear(y);
        setSelectedMonth(m);
        setSelectedDay(d);
      }
    }
  }, [value]);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setIsYearOpen(false);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setIsMonthOpen(false);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setIsDayOpen(false);
  };

  const selectedMonthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label || "";
  const isAnyOpen = isMonthOpen || isDayOpen || isYearOpen;
  const highestZIndex = isMonthOpen ? 3001 : isDayOpen ? 3002 : isYearOpen ? 3003 : 1;

  return (
    <View style={[styles.container, { zIndex: isAnyOpen ? 3000 : 1 }]}>
      {label && (
        <Text style={styles.label}>
          {label}
          <Text style={styles.required}> *</Text>
        </Text>
      )}

      <View style={[styles.selectorsRow, { zIndex: isAnyOpen ? highestZIndex : 1 }]}>
        {/* Month Selector */}
        <View style={[styles.selectorWrapper, { 
          flex: isMobile ? 1 : 1.2, 
          zIndex: isMonthOpen ? 3001 : 1,
          minWidth: isMobile ? 90 : 120,
          ...(isMobile ? { maxWidth: "100%" } : {}),
        }]}>
          <TouchableOpacity
            style={[
              styles.selector,
              isMonthOpen && styles.selectorActive,
              error && styles.selectorError,
            ]}
            onPress={() => {
              setIsMonthOpen(!isMonthOpen);
              setIsYearOpen(false);
              setIsDayOpen(false);
            }}
          >
            <Text style={styles.selectorText}>
              {selectedMonthLabel || t("profile_wizard.step1b.month", "MONTH")}
            </Text>
            <Text style={styles.chevron}>{isMonthOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {isMonthOpen && (
            <View style={[styles.dropdown, { zIndex: 10000 }]}>
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {MONTHS.map((month) => (
                  <TouchableOpacity
                    key={month.value}
                    style={[
                      styles.option,
                      selectedMonth === month.value && styles.optionActive,
                    ]}
                    onPress={() => handleMonthSelect(month.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedMonth === month.value && styles.optionTextActive,
                      ]}
                    >
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Day Selector */}
        <View style={[styles.selectorWrapper, { 
          flex: 1, 
          zIndex: isDayOpen ? 3002 : 1, 
          minWidth: isMobile ? 70 : 90,
          ...(isMobile ? { maxWidth: "100%" } : {}),
        }]}>
          <TouchableOpacity
            style={[
              styles.selector,
              isDayOpen && styles.selectorActive,
              error && styles.selectorError,
            ]}
            onPress={() => {
              setIsDayOpen(!isDayOpen);
              setIsYearOpen(false);
              setIsMonthOpen(false);
            }}
          >
            <Text style={styles.selectorText}>
              {selectedDay ? String(selectedDay).padStart(2, "0") : t("profile_wizard.step1b.day", "DAY")}
            </Text>
            <Text style={styles.chevron}>{isDayOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {isDayOpen && (
            <View style={[styles.dropdown, { zIndex: 10001 }]}>
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.option,
                      selectedDay === day && styles.optionActive,
                    ]}
                    onPress={() => handleDaySelect(day)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedDay === day && styles.optionTextActive,
                      ]}
                    >
                      {String(day).padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Year Selector */}
        <View style={[styles.selectorWrapper, { 
          flex: 1, 
          zIndex: isYearOpen ? 3003 : 1, 
          minWidth: isMobile ? 90 : 110,
          ...(isMobile ? { maxWidth: "100%" } : {}),
        }]}>
          <TouchableOpacity
            style={[
              styles.selector,
              isYearOpen && styles.selectorActive,
              error && styles.selectorError,
            ]}
            onPress={() => {
              setIsYearOpen(!isYearOpen);
              setIsMonthOpen(false);
              setIsDayOpen(false);
            }}
          >
            <Text style={styles.selectorText}>
              {selectedYear || t("profile_wizard.step1b.year", "YEAR")}
            </Text>
            <Text style={styles.chevron}>{isYearOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {isYearOpen && (
            <View style={[styles.dropdown, { zIndex: 10002 }]}>
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.option,
                      selectedYear === year && styles.optionActive,
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedYear === year && styles.optionTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Age Display */}
      {age !== null && isValidDate() && (
        <Text style={[styles.info, !isAgeValid() && styles.infoError]}>
          {isAgeValid()
            ? t("profile_wizard.step1b.age_display", "AGE: {{age}} YEARS OLD", { age })
            : t("profile_wizard.step1b.age_error", "AGE: {{age}} YEARS (MUST BE BETWEEN {{min}} AND {{max}} YEARS)", {
                age,
                min: minAge,
                max: maxAge,
              })}
        </Text>
      )}

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 24,
    position: "relative",
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    width: "100%",
  },
  required: {
    color: "#EF4444",
  },
  selectorsRow: {
    flexDirection: "row",
    gap: 8,
    position: "relative",
    zIndex: 1,
    flexWrap: "wrap",
    width: "100%",
  },
  selectorWrapper: {
    position: "relative",
    zIndex: 1,
    minWidth: 100,
    flex: 1,
    flexBasis: "auto",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 0,
    minHeight: 48,
  },
  selectorActive: {
    borderColor: "#0F172A",
  },
  selectorError: {
    borderColor: "#EF4444",
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0F172A",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    flex: 1,
    flexShrink: 1,
  },
  chevron: {
    fontSize: 10,
    color: "#64748B",
    marginLeft: 8,
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    top: 47,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0F172A",
    borderTopWidth: 0,
    maxHeight: 200,
    zIndex: 10000,
    elevation: 10, // Android shadow
    width: "100%",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }
      : {}),
  } as any,
  dropdownList: {
    maxHeight: 200,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    minHeight: 44,
  },
  optionActive: {
    backgroundColor: "#0F172A",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#475569",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    flexShrink: 1,
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  info: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
    fontWeight: "400",
    letterSpacing: 0.5,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  infoError: {
    color: "#EF4444",
  },
  errorText: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 8,
    fontWeight: "400",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});
