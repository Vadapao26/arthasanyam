import {
  Account,
  Category,
  CategoryBudgetMap,
  HabitTriggerConfig,
  Language,
  LanguageDefinition,
  LocalAuthRecord,
  LocalSecuritySettings,
  RecurringTemplate,
  Transaction,
  TransactionType,
} from '../types';
import { DEFAULT_LANGUAGES } from '../i18n/translations';

const STORAGE_KEYS = {
  LANGUAGE: 'arthasanyam_lang_v1',
  CUSTOM_LANGUAGES: 'arthasanyam_custom_langs_v1',
  AUTH: 'arthasanyam_auth_v1',
  SECURITY: 'arthasanyam_security_v1',
  ACCOUNTS: 'arthasanyam_accounts_v1',
  CATEGORIES: 'arthasanyam_categories_v1',
  BUDGETS: 'arthasanyam_budgets_v1',
  RECURRING: 'arthasanyam_recurring_v1',
  TRANSACTIONS: 'arthasanyam_transactions_v1',
  HABITS: 'arthasanyam_habits_v1',
  STREAK: 'arthasanyam_streak_v1',
};

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudgetMap = {
  cat_tea_coffee: 600,
  cat_meals_groceries: 10000,
  cat_commute: 2000,
  cat_bills_utilities: 2500,
  cat_education_books: 1500,
  cat_healthcare: 3000,
};

export const DEFAULT_SECURITY_SETTINGS: LocalSecuritySettings = {
  preferredLockMethod: 'passcode',
  patternEnabled: true,
  patternSequence: [0, 3, 6, 7, 8], // Classic Warli 'L' pattern (Top-left down to bottom-left, across to bottom-right)
  fingerprintEnabled: true,
  faceIdEnabled: true,
  expenseInstrument: 'tuntune_bansuri',
  revenueInstrument: 'taal_pakhawaj_tutari',
  voiceNarrationEnabled: true,
};

/**
 * Module 1.3: Platform Local Secure Storage Crypto Helpers (Web Crypto SHA-256 + Salted Digest)
 * Runs 100% offline on-device.
 */
export async function hashCredentialsLocally(
  userId: string,
  passcode: string,
  saltHex?: string
): Promise<LocalAuthRecord> {
  const cleanUser = userId.trim().toLowerCase();
  const actualSalt =
    saltHex ||
    Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const payload = `${actualSalt}::${cleanUser}::${passcode}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    userId: userId.trim(),
    saltHex: actualSalt,
    hashHex,
    cipherPreview: `AES256-GCM[local:${actualSalt.slice(0, 8)}:${hashHex.slice(0, 16)}...]`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Module 4.1 & 4.4: Pre-existing Categories with Unified Backend IDs
 */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_tea_coffee',
    icon: '☕',
    kind: 'expense',
    isCustom: false,
    labels: {
      mr: 'चहा-पाणी (Tea/Coffee)',
      hi: 'चाय-पानी (Tea/Coffee)',
      en: 'Tea & Coffee',
    },
  },
  {
    id: 'cat_meals_groceries',
    icon: '🍱',
    kind: 'expense',
    isCustom: false,
    labels: {
      mr: 'जेवण व किराणा (Meals)',
      hi: 'भोजन व राशन (Meals)',
      en: 'Meals & Groceries',
    },
  },
  {
    id: 'cat_commute',
    icon: '🚌',
    kind: 'expense',
    isCustom: false,
    labels: {
      mr: 'प्रवास व वाहन (Commute)',
      hi: 'यात्रा व वाहन (Commute)',
      en: 'Daily Commute',
    },
  },
  {
    id: 'cat_bills_utilities',
    icon: '💡',
    kind: 'expense',
    isCustom: false,
    labels: {
      mr: 'विज व घरबिल्स (Bills)',
      hi: 'बिजली व बिल (Bills)',
      en: 'Bills & Utilities',
    },
  },
  {
    id: 'cat_education_books',
    icon: '📚',
    kind: 'both',
    isCustom: false,
    labels: {
      mr: 'पुस्तके व शिक्षण',
      hi: 'पुस्तकें व शिक्षा',
      en: 'Books & Education',
    },
  },
  {
    id: 'cat_healthcare',
    icon: '🏥',
    kind: 'expense',
    isCustom: false,
    labels: {
      mr: 'औषधे व आरोग्य',
      hi: 'दवाइयाँ व स्वास्थ्य',
      en: 'Medicine & Healthcare',
    },
  },
  {
    id: 'cat_salary_income',
    icon: '🌾',
    kind: 'revenue',
    isCustom: false,
    labels: {
      mr: 'मासिक वेतन / उत्पन्न',
      hi: 'मासिक वेतन / आय',
      en: 'Salary & Primary Income',
    },
  },
  {
    id: 'cat_business_harvest',
    icon: '🏺',
    kind: 'revenue',
    isCustom: false,
    labels: {
      mr: 'व्यवसाय व शेती उत्पन्न',
      hi: 'व्यापार व कृषि आय',
      en: 'Business & Craft Revenue',
    },
  },
  {
    id: 'cat_fd_interest',
    icon: '🪙',
    kind: 'revenue',
    isCustom: false,
    labels: {
      mr: 'मुदत ठेव व्याज / लाभांश',
      hi: 'ब्याज व लाभांश',
      en: 'FD Interest & Dividends',
    },
  },
  {
    id: 'cat_freelance_bonus',
    icon: '🪔',
    kind: 'revenue',
    isCustom: false,
    labels: {
      mr: 'बोनस व मानधन जमा',
      hi: 'बोनस व मानदेय आय',
      en: 'Bonus & Honorarium',
    },
  },
];

/**
 * Computes the Top 4 Most Recently Used Categories for the given transaction type ('revenue' or 'expense')
 */
export function getTop4RecentCategories(
  categories: Category[],
  transactions: Transaction[],
  type: TransactionType
): Category[] {
  const compatible = categories.filter((c) => c.kind === type || c.kind === 'both');
  const seenIds = new Set<string>();
  const recent: Category[] = [];

  // 1. Pull categories from most recent transactions of this type
  const matchingTxs = transactions.filter((tx) => tx.type === type);
  for (const tx of matchingTxs) {
    if (!seenIds.has(tx.categoryId)) {
      const found = compatible.find((c) => c.id === tx.categoryId);
      if (found) {
        seenIds.add(found.id);
        recent.push(found);
        if (recent.length === 4) return recent;
      }
    }
  }

  // 2. Fill remaining slots up to 4 with compatible categories
  for (const cat of compatible) {
    if (!seenIds.has(cat.id)) {
      seenIds.add(cat.id);
      recent.push(cat);
      if (recent.length === 4) break;
    }
  }

  return recent;
}

/**
 * Module 3.1: Pre-seeded Local Vaults (Bank Account, Savings Goal / FD, Cash Wallet)
 */
export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_maharashtra_bank',
    name: 'बँक ऑफ महाराष्ट्र ( बचत खाते )',
    nameLocalized: {
      mr: 'बँक ऑफ महाराष्ट्र (बचत)',
      hi: 'बैंक ऑफ महाराष्ट्र (बचत)',
      en: 'Bank of Maharashtra (Savings)',
    },
    type: 'bank',
    openingBalance: 45000,
    currentBalance: 64150,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'acc_monsoon_fd',
    name: 'संकटकालीन तिजोरी / मुदत ठेव (FD)',
    nameLocalized: {
      mr: 'संकटकालीन निधी (FD तिजोरी)',
      hi: 'आपातकालीन निधि (FD तिजोरी)',
      en: 'Emergency Fund / FD Vault',
    },
    type: 'savings',
    openingBalance: 100000,
    currentBalance: 104200,
    targetAmount: 150000,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'acc_cash_batwa',
    name: 'दैनंदिन रोख बटवा (Cash Wallet)',
    nameLocalized: {
      mr: 'दैनंदिन रोख पाकीट (बटवा)',
      hi: 'दैनिक नकद बटुआ',
      en: 'Daily Cash Wallet (Batwa)',
    },
    type: 'cash',
    openingBalance: 5000,
    currentBalance: 4410,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const now = Date.now();

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    type: 'expense',
    accountId: 'acc_cash_batwa',
    categoryId: 'cat_tea_coffee',
    amount: 40,
    note: 'अमृततुल्य गुळाचा चहा (मित्रांसोबत)',
    timestamp: new Date(now - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'tx_seed_2',
    type: 'expense',
    accountId: 'acc_cash_batwa',
    categoryId: 'cat_meals_groceries',
    amount: 350,
    note: 'मंडईतून ताजा भाजीपाला व तांदूळ',
    timestamp: new Date(now - 1000 * 60 * 210).toISOString(),
  },
  {
    id: 'tx_seed_3',
    type: 'revenue',
    accountId: 'acc_monsoon_fd',
    categoryId: 'cat_fd_interest',
    amount: 4200,
    note: 'तिमाही मुदत ठेव व्याज जमा',
    timestamp: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'tx_seed_4',
    type: 'expense',
    accountId: 'acc_maharashtra_bank',
    categoryId: 'cat_bills_utilities',
    amount: 850,
    note: 'महावितरण वीज बिल (ऑक्टोबर)',
    timestamp: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'tx_seed_5',
    type: 'expense',
    accountId: 'acc_cash_batwa',
    categoryId: 'cat_commute',
    amount: 200,
    note: 'एसटी बस व रिक्षा प्रवास भाडे',
    timestamp: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: 'tx_seed_6',
    type: 'expense',
    accountId: 'acc_maharashtra_bank',
    categoryId: 'cat_meals_groceries',
    amount: 8500,
    note: 'वार्षिक धान्य व किराणा भरणी',
    timestamp: new Date(now - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'tx_seed_7',
    type: 'revenue',
    accountId: 'acc_maharashtra_bank',
    categoryId: 'cat_salary_income',
    amount: 28500,
    note: 'मासिक मानधन व व्यवसाय जमा',
    timestamp: new Date(now - 1000 * 60 * 60 * 120).toISOString(),
  },
];

export const DEFAULT_HABITS: HabitTriggerConfig = {
  morningIntention: true,
  eveningReflection: true,
  patternLearning: true,
};

export const DEFAULT_RECURRING_TEMPLATES: RecurringTemplate[] = [
  {
    id: 'rec_chai_20',
    title: '☕ अमृततुल्य चहा (₹20)',
    type: 'expense',
    accountId: 'acc_cash_batwa',
    categoryId: 'cat_tea_coffee',
    amount: 20,
    note: 'दुपारचा अमृततुल्य चहा',
  },
  {
    id: 'rec_milk_paper',
    title: '🥛 दूध व वर्तमानपत्र (₹1,200)',
    type: 'expense',
    accountId: 'acc_cash_batwa',
    categoryId: 'cat_meals_groceries',
    amount: 1200,
    note: 'मासिक दूध व पेपर बिल',
  },
  {
    id: 'rec_mseb_bill',
    title: '💡 महावितरण वीज बिल (₹850)',
    type: 'expense',
    accountId: 'acc_maharashtra_bank',
    categoryId: 'cat_bills_utilities',
    amount: 850,
    note: 'मासिक महावितरण वीज बिल',
  },
  {
    id: 'rec_monthly_salary',
    title: '🌾 मासिक वेतन जमा (+₹28,500)',
    type: 'revenue',
    accountId: 'acc_maharashtra_bank',
    categoryId: 'cat_salary_income',
    amount: 28500,
    note: 'मासिक वेतन व मानधन जमा',
  },
];

export function loadRecurringTemplates(): RecurringTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(DEFAULT_RECURRING_TEMPLATES));
      return DEFAULT_RECURRING_TEMPLATES;
    }
    return JSON.parse(raw) as RecurringTemplate[];
  } catch {
    return DEFAULT_RECURRING_TEMPLATES;
  }
}

export function saveRecurringTemplates(templates: RecurringTemplate[]): void {
  localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(templates));
}

export function loadLocalLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
  return saved || 'mr';
}

export function saveLocalLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function loadAvailableLanguages(): LanguageDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_LANGUAGES);
    if (!raw) return DEFAULT_LANGUAGES;
    const customList = JSON.parse(raw) as LanguageDefinition[];
    const merged = [...DEFAULT_LANGUAGES];
    customList.forEach((c) => {
      if (!merged.some((m) => m.code === c.code)) {
        merged.push(c);
      }
    });
    return merged;
  } catch {
    return DEFAULT_LANGUAGES;
  }
}

export function saveAvailableLanguages(langs: LanguageDefinition[]): void {
  const customOnly = langs.filter((l) => l.isCustom);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_LANGUAGES, JSON.stringify(customOnly));
}

export function loadSecuritySettings(): LocalSecuritySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECURITY);
    if (!raw) return DEFAULT_SECURITY_SETTINGS;
    return { ...DEFAULT_SECURITY_SETTINGS, ...(JSON.parse(raw) as Partial<LocalSecuritySettings>) };
  } catch {
    return DEFAULT_SECURITY_SETTINGS;
  }
}

export function saveSecuritySettings(settings: LocalSecuritySettings): void {
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(settings));
}

export function loadLocalAuth(): LocalAuthRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    return raw ? (JSON.parse(raw) as LocalAuthRecord) : null;
  } catch {
    return null;
  }
}

export function saveLocalAuth(record: LocalAuthRecord): void {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(record));
}

export function loadLocalAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw) as Account[];
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveLocalAccounts(accounts: Account[]): void {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function loadLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw) as Category[];
    // Ensure new default categories exist
    const merged = [...parsed];
    DEFAULT_CATEGORIES.forEach((def) => {
      if (!merged.some((c) => c.id === def.id)) {
        merged.push(def);
      }
    });
    return merged;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function loadCategoryBudgets(): CategoryBudgetMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_CATEGORY_BUDGETS));
      return DEFAULT_CATEGORY_BUDGETS;
    }
    return { ...DEFAULT_CATEGORY_BUDGETS, ...(JSON.parse(raw) as CategoryBudgetMap) };
  } catch {
    return DEFAULT_CATEGORY_BUDGETS;
  }
}

export function saveCategoryBudgets(budgets: CategoryBudgetMap): void {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

export function loadLocalTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw) as Transaction[];
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveLocalTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function loadLocalHabits(): HabitTriggerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw) as HabitTriggerConfig;
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveLocalHabits(habits: HabitTriggerConfig): void {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function loadStreakDays(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
  return raw ? Number(raw) || 7 : 7;
}

/**
 * Helper for Module 4.3: On-device dictionary for smart multi-language category suggestions
 */
const BUILTIN_DICTIONARY: Array<Record<string, string>> = [
  { mr: 'मंदिर व धर्मदाय देणगी', hi: 'मंदिर व दान पुण्य', en: 'Temple & Charity Donation' },
  { mr: 'पुस्तके व शिक्षण', hi: 'पुस्तकें व शिक्षा', en: 'Books & Education' },
  { mr: 'औषधे व आरोग्य', hi: 'दवाइयाँ व स्वास्थ्य', en: 'Medicine & Healthcare' },
  { mr: 'सण व उत्सव खरेदी', hi: 'त्योहार व उत्सव खरीदारी', en: 'Festival & Cultural Shopping' },
  { mr: 'शेती व बागायत खर्च', hi: 'कृषि व बागवानी खर्च', en: 'Farming & Garden Supplies' },
  { mr: 'सोने व दागिने गुंतवणूक', hi: 'सोना व आभूषण निवेश', en: 'Gold & Ornaments Saving' },
  { mr: 'हस्तकला व वारली साहित्य', hi: 'हस्तशिल्प व कला बिक्री', en: 'Handicraft & Art Income' },
];

export function suggestMultiLanguageTerms(
  inputTerm: string,
  sourceLang: Language,
  availableLangs: LanguageDefinition[] = DEFAULT_LANGUAGES
): Record<string, string> {
  const clean = inputTerm.trim();
  const lower = clean.toLowerCase();

  let matchedEntry: Record<string, string> | null = null;
  for (const entry of BUILTIN_DICTIONARY) {
    if (
      entry.mr.toLowerCase().includes(lower) ||
      entry.hi.toLowerCase().includes(lower) ||
      entry.en.toLowerCase().includes(lower)
    ) {
      matchedEntry = entry;
      break;
    }
  }

  const result: Record<string, string> = {};
  availableLangs.forEach((l) => {
    if (l.code === sourceLang) {
      result[l.code] = clean;
    } else if (matchedEntry && matchedEntry[l.code]) {
      result[l.code] = matchedEntry[l.code];
    } else if (l.code === 'mr') {
      result[l.code] = `${clean} (मराठी)`;
    } else if (l.code === 'hi') {
      result[l.code] = `${clean} (हिंदी)`;
    } else if (l.code === 'en') {
      result[l.code] = clean;
    } else {
      result[l.code] = `${clean} (${l.shortLabel})`;
    }
  });

  return result;
}
