export type BuiltinLanguage = 'mr' | 'hi' | 'en';
export type Language = string; // 'mr' | 'hi' | 'en' or user-added custom language code

export interface LanguageDefinition {
  code: string;
  nativeLabel: string;
  shortLabel: string;
  locale: string;
  isCustom?: boolean;
  useDevanagariDigits?: boolean;
}

export type AccountType = 'bank' | 'savings' | 'cash';

export interface Account {
  id: string;
  name: string;
  nameLocalized?: Record<string, string>;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  targetAmount?: number; // Savings Goal / FD target amount in INR
  createdAt: string;
}

export type CategoryKind = 'expense' | 'revenue' | 'both';

/**
 * Module 4.4: Unified Backend ID
 * All language variations map to a single backend category ID,
 * guaranteeing correct financial aggregation regardless of active UI language.
 */
export interface Category {
  id: string;
  icon: string;
  kind: CategoryKind;
  isCustom: boolean;
  labels: Record<string, string>;
}

export type TransactionType = 'revenue' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  amount: number;
  note?: string;
  timestamp: string;
}

export interface RecurringTemplate {
  id: string;
  title: string;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  amount: number;
  note?: string;
}

export interface HabitTriggerConfig {
  morningIntention: boolean; // 9:00 AM
  eveningReflection: boolean; // 9:00 PM
  patternLearning: boolean; // On-Device Pattern Learning
}

export type LockMethod = 'passcode' | 'pattern' | 'fingerprint' | 'faceid';

export type ExpenseInstrumentStyle = 'tuntune_bansuri' | 'sambhal_chipli' | 'santoor_tanpura';
export type RevenueInstrumentStyle = 'taal_pakhawaj_tutari' | 'dhol_tasha';

export interface LocalSecuritySettings {
  preferredLockMethod: LockMethod;
  patternEnabled: boolean;
  patternSequence: number[]; // e.g. [0, 1, 4, 7, 8] on 3x3 grid (0..8)
  fingerprintEnabled: boolean;
  faceIdEnabled: boolean;
  biometricCredentialId?: string;
  expenseInstrument: ExpenseInstrumentStyle;
  revenueInstrument: RevenueInstrumentStyle;
  voiceNarrationEnabled: boolean;
}

export interface LocalAuthRecord {
  userId: string;
  saltHex: string;
  hashHex: string;
  cipherPreview: string;
  createdAt: string;
}

export interface AcousticToastCue {
  id: string;
  type: TransactionType;
  instrumentTitle: string;
  bolNotation: string;
  description: string;
  amount: number;
  categoryLabel: string;
}

export type CategoryBudgetMap = Record<string, number>; // categoryId -> monthly limit in INR

export interface SimulatedNotification {
  id: string;
  lang: Language;
  triggerType: 'morning' | 'evening' | 'pattern';
  title: string;
  body: string;
  timeLabel: string;
}
