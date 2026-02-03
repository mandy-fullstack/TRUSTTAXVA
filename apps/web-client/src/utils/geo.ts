export type CountryOption = { isoCode: string; name: string };
export type StateOption = { isoCode: string; name: string };

// Small, local list to avoid pulling heavy geo datasets into the bundle.
export const US_STATES: StateOption[] = [
  { isoCode: "AL", name: "Alabama" },
  { isoCode: "AK", name: "Alaska" },
  { isoCode: "AZ", name: "Arizona" },
  { isoCode: "AR", name: "Arkansas" },
  { isoCode: "CA", name: "California" },
  { isoCode: "CO", name: "Colorado" },
  { isoCode: "CT", name: "Connecticut" },
  { isoCode: "DE", name: "Delaware" },
  { isoCode: "DC", name: "District of Columbia" },
  { isoCode: "FL", name: "Florida" },
  { isoCode: "GA", name: "Georgia" },
  { isoCode: "HI", name: "Hawaii" },
  { isoCode: "ID", name: "Idaho" },
  { isoCode: "IL", name: "Illinois" },
  { isoCode: "IN", name: "Indiana" },
  { isoCode: "IA", name: "Iowa" },
  { isoCode: "KS", name: "Kansas" },
  { isoCode: "KY", name: "Kentucky" },
  { isoCode: "LA", name: "Louisiana" },
  { isoCode: "ME", name: "Maine" },
  { isoCode: "MD", name: "Maryland" },
  { isoCode: "MA", name: "Massachusetts" },
  { isoCode: "MI", name: "Michigan" },
  { isoCode: "MN", name: "Minnesota" },
  { isoCode: "MS", name: "Mississippi" },
  { isoCode: "MO", name: "Missouri" },
  { isoCode: "MT", name: "Montana" },
  { isoCode: "NE", name: "Nebraska" },
  { isoCode: "NV", name: "Nevada" },
  { isoCode: "NH", name: "New Hampshire" },
  { isoCode: "NJ", name: "New Jersey" },
  { isoCode: "NM", name: "New Mexico" },
  { isoCode: "NY", name: "New York" },
  { isoCode: "NC", name: "North Carolina" },
  { isoCode: "ND", name: "North Dakota" },
  { isoCode: "OH", name: "Ohio" },
  { isoCode: "OK", name: "Oklahoma" },
  { isoCode: "OR", name: "Oregon" },
  { isoCode: "PA", name: "Pennsylvania" },
  { isoCode: "RI", name: "Rhode Island" },
  { isoCode: "SC", name: "South Carolina" },
  { isoCode: "SD", name: "South Dakota" },
  { isoCode: "TN", name: "Tennessee" },
  { isoCode: "TX", name: "Texas" },
  { isoCode: "UT", name: "Utah" },
  { isoCode: "VT", name: "Vermont" },
  { isoCode: "VA", name: "Virginia" },
  { isoCode: "WA", name: "Washington" },
  { isoCode: "WV", name: "West Virginia" },
  { isoCode: "WI", name: "Wisconsin" },
  { isoCode: "WY", name: "Wyoming" },
];

const countriesCache = new Map<string, CountryOption[]>();

export function getCountries(locale?: string): CountryOption[] {
  const resolvedLocale =
    locale ||
    (typeof navigator !== "undefined" ? navigator.language : "en-US");

  const cached = countriesCache.get(resolvedLocale);
  if (cached) return cached;

  // Prefer native ICU data instead of shipping a large dataset.
  const supportedValuesOf = (Intl as any).supportedValuesOf as
    | ((type: string) => string[])
    | undefined;
  const codes = supportedValuesOf ? supportedValuesOf("region") : ["US"];

  const displayNames = new Intl.DisplayNames([resolvedLocale], {
    type: "region",
  });

  const list = codes
    .map((isoCode) => {
      const name = displayNames.of(isoCode);
      return name ? { isoCode, name } : null;
    })
    .filter(Boolean) as CountryOption[];

  // Sort for better UX
  list.sort((a, b) => a.name.localeCompare(b.name));

  countriesCache.set(resolvedLocale, list);
  return list;
}

