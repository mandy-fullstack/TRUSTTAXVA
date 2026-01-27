/**
 * Tax Intake Schema – Intake inteligente para 1040.
 * Cliente sube W-2; el formulario solo pregunta lo que normalmente NO viene en el W-2.
 * "Needs Info" cuando falta algo: no bloquear submit, marcar caso.
 */

/** Datos detectados del W-2 (solo lectura para confirmación). */
export interface W2Detected {
  employerName?: string;
  employerEin?: string;
  wages?: number;
  federalWithholding?: number;
  stateWages?: number;
  stateWithholding?: number;
  taxpayerName?: string;
  taxpayerSsnMasked?: string;
  address?: string;
}

/** Un W-2 subido (ref o mock hasta integración real). */
export interface W2Upload {
  id: string;
  fileName: string;
  status: 'uploaded' | 'pending';
  detected?: W2Detected;
}

/** Dependiente (repetible). */
export interface Dependent {
  id: string;
  legalName: string;
  dateOfBirth: string;
  relationship: string;
  ssnOrItin: string;
  monthsLivedWithYou: number;
  fullTimeStudent: boolean;
  permanentDisability: boolean;
  someoneElseCanClaim: 'yes' | 'no' | 'unknown';
  childcare: boolean;
  childcareProvider?: string;
  childcareEin?: string;
  childcareAddress?: string;
  childcareAmount?: number;
  noSsnYet?: boolean; // "no lo tengo" → Needs Info
}

/** Opciones de estado civil al 31 dic. */
export type FilingStatus =
  | 'Single'
  | 'Married Filing Jointly'
  | 'Married Filing Separately'
  | 'Head of Household'
  | 'Qualifying Surviving Spouse';

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
  filingStatus: FilingStatus | '';
  filingWithSpouse: 'yes' | 'no' | '';
  headOfHousehold: boolean;
  paidOver50PercentHousehold: boolean;
  hasQualifyingDependent: boolean;
  claimableAsDependent: 'yes' | 'no' | '';

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
  taxYear: new Date().getFullYear(),
  filingStatus: '',
  filingWithSpouse: '',
  headOfHousehold: false,
  paidOver50PercentHousehold: false,
  hasQualifyingDependent: false,
  claimableAsDependent: '',
  dependents: [],
  otherIncome: { ...DEFAULT_OTHER_INCOME },
  deductions: { ...DEFAULT_DEDUCTIONS },
  missingDocs: [],
  needsInfo: [],
};

export const DEPENDENT_RELATIONSHIPS = [
  { value: 'child', label: 'Child' },
  { value: 'stepchild', label: 'Stepchild' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'parent', label: 'Parent' },
  { value: 'niece_nephew', label: 'Niece/Nephew' },
  { value: 'other', label: 'Other' },
] as const;
