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

// ISO 3166-1 alpha-2 codes (fallback when Intl.supportedValuesOf('region') is unavailable)
// Keep as codes-only to stay small; names are resolved via Intl.DisplayNames when possible.
const ISO_COUNTRY_CODES: string[] = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ",
  "CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ",
  "EC","EE","EG","EH","ER","ES","ET",
  "FI","FJ","FK","FM","FO","FR",
  "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY",
  "HK","HM","HN","HR","HT","HU",
  "ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT",
  "JE","JM","JO","JP",
  "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ",
  "OM",
  "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY",
  "QA",
  "RE","RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","UM","US","UY","UZ",
  "VA","VC","VE","VG","VI","VN","VU",
  "WF","WS",
  "YE","YT",
  "ZA","ZM","ZW",
];

const countriesCache = new Map<string, CountryOption[]>();

export function getCountries(locale?: string): CountryOption[] {
  const resolvedLocale =
    locale ||
    (typeof navigator !== "undefined" ? navigator.language : "en-US");

  const cached = countriesCache.get(resolvedLocale);
  if (cached) return cached;

  // Prefer native ICU data when available, but some browsers expose supportedValuesOf()
  // without supporting the "region" key (throws RangeError).
  const supportedValuesOf = (Intl as any).supportedValuesOf as
    | ((type: string) => string[])
    | undefined;

  let codes: string[] = ISO_COUNTRY_CODES;
  if (supportedValuesOf) {
    try {
      const regionCodes = supportedValuesOf("region");
      if (Array.isArray(regionCodes) && regionCodes.length > 0) {
        codes = regionCodes;
      }
    } catch {
      // Fallback to ISO_COUNTRY_CODES
    }
  }

  const displayNames =
    typeof (Intl as any).DisplayNames === "function"
      ? new Intl.DisplayNames([resolvedLocale], { type: "region" })
      : null;

  const list = codes.map((isoCode) => {
    const name = displayNames ? displayNames.of(isoCode) : undefined;
    return { isoCode, name: name || isoCode };
  });

  // Sort for better UX
  list.sort((a, b) => a.name.localeCompare(b.name));

  countriesCache.set(resolvedLocale, list);
  return list;
}

