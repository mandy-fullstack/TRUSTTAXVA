/**
 * Tax Intake Schema – Intake inteligente para 1040.
 * Cliente sube W-2; el formulario solo pregunta lo que normalmente NO viene en el W-2.
 * "Needs Info" cuando falta algo: no bloquear submit, marcar caso.
 */

/** Datos detectados del W-2 (solo lectura para confirmación). */
export interface W2Detected {
  employerName?: string;
  employerEin?: string;
  employerAddress?: string;
  wages?: number;
  federalWithholding?: number;
  socialSecurityWages?: number;
  socialSecurityWithheld?: number;
  medicareWages?: number;
  medicareWithheld?: number;
  socialSecurityTips?: number;
  allocatedTips?: number;
  dependentCareBenefits?: number;
  nonqualifiedPlans?: number;
  box12Codes?: Array<{ code: string; amount: number }>;
  statutoryEmployee?: boolean;
  retirementPlan?: boolean;
  thirdPartySickPay?: boolean;
  box14Other?: string;
  stateCode?: string;
  stateIdNumber?: string;
  stateWages?: number;
  stateWithholding?: number;
  localWages?: number;
  localTax?: number;
  localityName?: string;
  taxpayerName?: string;
  taxpayerSsnMasked?: string;
  taxpayerSsnConfirm?: string;
  address?: string;
  year?: number;
  controlNumber?: string;
}

/** Un W-2 subido (ref o mock hasta integración real). */
export interface W2Upload {
  id: string;
  fileName: string;
  status: "pending" | "uploaded" | "error";
  detected?: W2Detected;
  manualReview?: boolean;
  confirmed?: boolean;
}

/**
 * Helper function to process W-2 detection and update form data.
 * This function is intended to be called when a W-2 detection is received.
 * @param docId The ID of the W-2 document that was detected.
 * @param detection The detected data from the W-2.
 * @param currentUploads The current array of W2Uploads.
 * @param onChange A callback function to update the main TaxIntakeData.
 */
export function processW2Detection(
  docId: string,
  detection: W2Detected,
  currentUploads: W2Upload[],
  onChange: (updates: Partial<TaxIntakeData>) => void,
) {
  const next = currentUploads.map((u) => {
    if (u.id === docId) {
      return { ...u, status: "uploaded" as const, detected: detection };
    }
    return u;
  });

  // Automatically map detected values to the main form data
  const updates: Partial<TaxIntakeData> = { w2Uploads: next };
  if (detection.year && detection.year >= 2023 && detection.year <= 2025) {
    updates.taxYear = detection.year;
  }

  onChange(updates);
}

/** Dependiente (repetible). */
export interface Dependent {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  ssnOrItin: string;
  monthsLivedWithYou: number;
  fullTimeStudent: boolean;
  permanentDisability: boolean;
  someoneElseCanClaim: "yes" | "no" | "unknown";
  childcare: boolean;
  childcareProvider?: string;
  childcareEin?: string;
  childcareAddress?: string;
  childcareAmount?: number;
  noSsnYet?: boolean; // "no lo tengo" → Needs Info
}

/** Información de la Pareja (Spouse) */
export interface SpouseInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  occupation?: string;
}

/** Dirección Multinacional / USPS */
export interface MailingAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

/** Información Bancaria para Direct Deposit */
export interface BankInfo {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
}

/** Opciones de estado civil al 31 dic. */
export type FilingStatus =
  | "Single"
  | "Married Filing Jointly"
  | "Married Filing Separately"
  | "Head of Household"
  | "Qualifying Surviving Spouse";

/** Otros ingresos (checklist sí/no). Si sí → upload o mínimos. */
export interface OtherIncomeFlags {
  has1099NEC: boolean;
  has1099K: boolean;
  has1099G: boolean;
  has1099INTorDIV: boolean;
  has1099R: boolean;
  hasSSA1099: boolean;
  hasCrypto: boolean;
  hasW2G: boolean;
  has1099B: boolean;
  hasRental: boolean;
}

/** Deducciones/créditos (toggles). Si sí → doc o montos. */
export interface DeductionFlags {
  mortgageInterest: boolean;
  tuition1098T: boolean;
  studentLoanInterest: boolean;
  iraContribution: boolean;
  hsa: boolean;
  charitable: boolean;
  medical: boolean;
  energy: boolean;
}

export interface TaxIntakeData {
  /** Paso 1: W-2 upload */
  w2Uploads: W2Upload[];
  hasMoreThanOneW2: boolean;

  /** Paso 2: Confirmación W-2 */
  w2ConfirmCorrect: boolean | null;
  w2CorrectionNote?: string;

  /** Paso 3: Situación personal */
  taxYear: number;
  filingStatus: FilingStatus | "";
  filingWithSpouse: "yes" | "no" | "";
  headOfHousehold: boolean;
  paidOver50PercentHousehold: boolean;
  hasQualifyingDependent: boolean;
  claimableAsDependent: "yes" | "no" | "";

  /** Nuevos Campos Requeridos */
  mailingAddress: MailingAddress;
  bankInfo: BankInfo;
  spouseInfo?: SpouseInfo;

  /** Dependientes */
  dependents: Dependent[];

  /** Paso 4: Otros ingresos */
  otherIncome: OtherIncomeFlags;

  /** Paso 5: Deducciones/créditos */
  deductions: DeductionFlags;

  /** Faltantes generados (para paso Missing Docs) */
  missingDocs: string[];

  /** Needs Info: no bloquear submit, marcar orden */
  needsInfo: string[];
}

export const DEFAULT_OTHER_INCOME: OtherIncomeFlags = {
  has1099NEC: false,
  has1099K: false,
  has1099G: false,
  has1099INTorDIV: false,
  has1099R: false,
  hasSSA1099: false,
  hasCrypto: false,
  hasW2G: false,
  has1099B: false,
  hasRental: false,
};

export const DEFAULT_DEDUCTIONS: DeductionFlags = {
  mortgageInterest: false,
  tuition1098T: false,
  studentLoanInterest: false,
  iraContribution: false,
  hsa: false,
  charitable: false,
  medical: false,
  energy: false,
};

export const DEFAULT_TAX_INTAKE: TaxIntakeData = {
  w2Uploads: [],
  hasMoreThanOneW2: false,
  w2ConfirmCorrect: null,
  taxYear: new Date().getFullYear() - 1,
  filingStatus: "",
  filingWithSpouse: "",
  headOfHousehold: false,
  paidOver50PercentHousehold: false,
  hasQualifyingDependent: false,
  claimableAsDependent: "",
  mailingAddress: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  bankInfo: {
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "checking",
  },
  dependents: [],
  otherIncome: { ...DEFAULT_OTHER_INCOME },
  deductions: { ...DEFAULT_DEDUCTIONS },
  missingDocs: [],
  needsInfo: [],
};

export const DEPENDENT_RELATIONSHIPS = [
  { value: "child", label: "Child" },
  { value: "stepchild", label: "Stepchild" },
  { value: "grandchild", label: "Grandchild" },
  { value: "sibling", label: "Sibling" },
  { value: "parent", label: "Parent" },
  { value: "niece_nephew", label: "Niece/Nephew" },
  { value: "other", label: "Other" },
] as const;
