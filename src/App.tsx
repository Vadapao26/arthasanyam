import React, { useState, useEffect } from 'react';
import {
  Home,
  PieChart,
  Landmark,
  Languages,
  Bell,
  Database,
  Lock,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Settings,
} from 'lucide-react';
import {
  Account,
  AccountType,
  AcousticToastCue,
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
} from './types';
import {
  getCategoryLabel,
  toDevanagariDigits,
  TRANSLATIONS,
} from './i18n/translations';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_RECURRING_TEMPLATES,
  DEFAULT_TRANSACTIONS,
  loadAvailableLanguages,
  loadCategoryBudgets,
  loadLocalAccounts,
  loadLocalAuth,
  loadLocalCategories,
  loadLocalHabits,
  loadLocalLanguage,
  loadLocalTransactions,
  loadRecurringTemplates,
  loadSecuritySettings,
  loadStreakDays,
  saveAvailableLanguages,
  saveCategoryBudgets,
  saveLocalAccounts,
  saveLocalAuth,
  saveLocalCategories,
  saveLocalHabits,
  saveLocalLanguage,
  saveLocalTransactions,
  saveRecurringTemplates,
  saveSecuritySettings,
} from './utils/localDatabase';
import { acousticEngine, buildAcousticCueToast } from './utils/acousticEngine';
import { WarliEmblem16 } from './components/WarliArt';
import { SplashAuthScreen } from './components/SplashAuthScreen';
import { DashboardVault } from './components/DashboardVault';
import { AnalyticsBudgetModule } from './components/AnalyticsBudgetModule';
import { AccountsVaultModule } from './components/AccountsVaultModule';
import { CategoryMappingModule } from './components/CategoryMappingModule';
import { TransactionModal } from './components/TransactionModal';
import { AcousticToastBanner } from './components/AcousticToastBanner';
import { HabitTriggersModule } from './components/HabitTriggersModule';
import { SettingsModule } from './components/SettingsModule';
import { OfflinePrivacyInspector } from './components/OfflinePrivacyInspector';

type ActiveTab = 'vault' | 'analytics' | 'accounts' | 'categories' | 'habits' | 'settings' | 'db';

export function App() {
  const [lang, setLang] = useState<Language>(() => loadLocalLanguage());
  const [availableLanguages, setAvailableLanguages] = useState<LanguageDefinition[]>(() =>
    loadAvailableLanguages()
  );
  const [authRecord, setAuthRecord] = useState<LocalAuthRecord | null>(() => loadLocalAuth());
  const [securitySettings, setSecuritySettings] = useState<LocalSecuritySettings>(() =>
    loadSecuritySettings()
  );
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<Account[]>(() => loadLocalAccounts());
  const [categories, setCategories] = useState<Category[]>(() => loadLocalCategories());
  const [budgets, setBudgets] = useState<CategoryBudgetMap>(() => loadCategoryBudgets());
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>(() =>
    loadRecurringTemplates()
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLocalTransactions());
  const [habits, setHabits] = useState<HabitTriggerConfig>(() => loadLocalHabits());
  const [streakDays] = useState<number>(() => loadStreakDays());

  const [activeTab, setActiveTab] = useState<ActiveTab>('vault');
  const [useDevanagariNumerals, setUseDevanagariNumerals] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Module 5: Transaction Modal & Acoustic Cue Toast State
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const [txModalInitialType, setTxModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeAcousticCue, setActiveAcousticCue] = useState<AcousticToastCue | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    saveLocalLanguage(lang);
  }, [lang]);

  const handleLanguageChange = (nextLang: Language) => {
    setLang(nextLang);
  };

  const handleUpdateAvailableLanguages = (nextLangs: LanguageDefinition[]) => {
    setAvailableLanguages(nextLangs);
    saveAvailableLanguages(nextLangs);
  };

  const handleUpdateSecuritySettings = (nextSec: LocalSecuritySettings) => {
    setSecuritySettings(nextSec);
    saveSecuritySettings(nextSec);
  };

  const handleAuthenticated = (record: LocalAuthRecord) => {
    saveLocalAuth(record);
    setAuthRecord(record);
    setIsUnlocked(true);
  };

  const handleToggleAudioMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    acousticEngine.muted = next;
  };

  // Module 3.2: Add New Account
  const handleAddAccount = (
    name: string,
    type: AccountType,
    openingBalance: number,
    targetAmount?: number
  ) => {
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name,
      type,
      openingBalance,
      currentBalance: openingBalance,
      targetAmount,
      createdAt: new Date().toISOString(),
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveLocalAccounts(updated);
  };

  const handleUpdateAccountTarget = (accountId: string, targetAmount: number) => {
    const updated = accounts.map((a) =>
      a.id === accountId ? { ...a, targetAmount: targetAmount > 0 ? targetAmount : undefined } : a
    );
    setAccounts(updated);
    saveLocalAccounts(updated);
  };

  const handleTransferBetweenAccounts = (
    fromAccountId: string,
    toAccountId: string,
    amount: number
  ) => {
    if (fromAccountId === toAccountId || amount <= 0) return;
    const updated = accounts.map((acc) => {
      if (acc.id === fromAccountId) {
        return { ...acc, currentBalance: acc.currentBalance - amount };
      }
      if (acc.id === toAccountId) {
        return { ...acc, currentBalance: acc.currentBalance + amount };
      }
      return acc;
    });
    setAccounts(updated);
    saveLocalAccounts(updated);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (accounts.length <= 1) return;
    const updated = accounts.filter((a) => a.id !== accountId);
    setAccounts(updated);
    saveLocalAccounts(updated);
  };

  // Module 4.2 & 4.3: Add Unified Multi-Language Category
  const handleAddCategory = (newCat: Category) => {
    const updated = [newCat, ...categories];
    setCategories(updated);
    saveLocalCategories(updated);
  };

  // Module 5.2 & 5.3: Atomic Transaction Logging + Marathi Musical Instruments + Voice Cues
  const handleSubmitTransaction = (
    type: TransactionType,
    accountId: string,
    categoryId: string,
    amount: number,
    note: string,
    customDateIso?: string,
    saveAsRecurring?: boolean
  ) => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type,
      accountId,
      categoryId,
      amount,
      note: note || undefined,
      timestamp: customDateIso || new Date().toISOString(),
    };

    const nextTransactions = [newTx, ...transactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setTransactions(nextTransactions);
    saveLocalTransactions(nextTransactions);

    // Atomically update selected account's local balance
    const nextAccounts = accounts.map((acc) => {
      if (acc.id !== accountId) return acc;
      const delta = type === 'revenue' ? amount : -amount;
      return {
        ...acc,
        currentBalance: acc.currentBalance + delta,
      };
    });
    setAccounts(nextAccounts);
    saveLocalAccounts(nextAccounts);

    const cat = categories.find((c) => c.id === categoryId);
    const catLabel = getCategoryLabel(cat, lang);

    if (saveAsRecurring) {
      const sign = type === 'revenue' ? '+' : '';
      const newTpl: RecurringTemplate = {
        id: `rec_${Date.now()}`,
        title: `${cat?.icon || '🏺'} ${note || catLabel} (${sign}₹${amount})`,
        type,
        accountId,
        categoryId,
        amount,
        note: note || undefined,
      };
      const nextRecurring = [newTpl, ...recurringTemplates];
      setRecurringTemplates(nextRecurring);
      saveRecurringTemplates(nextRecurring);
    }

    if (type === 'revenue') {
      acousticEngine.playRevenueVeena();
    } else {
      acousticEngine.playExpenseTabla();
    }

    const cue = buildAcousticCueToast(type, amount, catLabel, lang);
    setActiveAcousticCue(cue);
  };

  const handleUpdateExistingTransaction = (
    txId: string,
    type: TransactionType,
    accountId: string,
    categoryId: string,
    amount: number,
    note: string,
    customDateIso: string
  ) => {
    const oldTx = transactions.find((tx) => tx.id === txId);
    if (!oldTx) return;

    const updatedTx: Transaction = {
      id: txId,
      type,
      accountId,
      categoryId,
      amount,
      note: note || undefined,
      timestamp: customDateIso,
    };

    const nextTransactions = transactions
      .map((tx) => (tx.id === txId ? updatedTx : tx))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setTransactions(nextTransactions);
    saveLocalTransactions(nextTransactions);

    // Reconcile account balances: undo oldTx and apply updatedTx
    const nextAccounts = accounts.map((acc) => {
      let bal = acc.currentBalance;
      if (acc.id === oldTx.accountId) {
        bal += oldTx.type === 'revenue' ? -oldTx.amount : oldTx.amount;
      }
      if (acc.id === accountId) {
        bal += type === 'revenue' ? amount : -amount;
      }
      return { ...acc, currentBalance: bal };
    });

    setAccounts(nextAccounts);
    saveLocalAccounts(nextAccounts);
    setEditingTransaction(null);
    acousticEngine.playNotificationSwarmandal();
  };

  const handleExecuteRecurringTemplate = (tpl: RecurringTemplate) => {
    handleSubmitTransaction(
      tpl.type,
      tpl.accountId,
      tpl.categoryId,
      tpl.amount,
      tpl.note || tpl.title
    );
  };

  const handleDeleteRecurringTemplate = (tplId: string) => {
    const next = recurringTemplates.filter((r) => r.id !== tplId);
    setRecurringTemplates(next);
    saveRecurringTemplates(next);
  };

  const handleDeleteTransaction = (txId: string) => {
    const target = transactions.find((tx) => tx.id === txId);
    if (!target) return;

    const nextTransactions = transactions.filter((tx) => tx.id !== txId);
    setTransactions(nextTransactions);
    saveLocalTransactions(nextTransactions);

    // Reverse balance effect on account
    const nextAccounts = accounts.map((acc) => {
      if (acc.id !== target.accountId) return acc;
      const reverseDelta = target.type === 'revenue' ? -target.amount : target.amount;
      return {
        ...acc,
        currentBalance: acc.currentBalance + reverseDelta,
      };
    });
    setAccounts(nextAccounts);
    saveLocalAccounts(nextAccounts);
  };

  const handleTriggerTestCue = (type: TransactionType) => {
    const catLabel = type === 'revenue' ? 'मासिक वेतन / उत्पन्न' : 'चहा-पाणी (Tea/Coffee)';
    const amt = type === 'revenue' ? 5000 : 120;
    if (type === 'revenue') {
      acousticEngine.playRevenueVeena();
    } else {
      acousticEngine.playExpenseTabla();
    }
    const cue = buildAcousticCueToast(type, amt, catLabel, lang);
    setActiveAcousticCue(cue);
  };

  const handleImportBackupData = (payload: {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    budgets?: CategoryBudgetMap;
  }) => {
    setAccounts(payload.accounts);
    saveLocalAccounts(payload.accounts);
    setCategories(payload.categories);
    saveLocalCategories(payload.categories);
    setTransactions(payload.transactions);
    saveLocalTransactions(payload.transactions);
    if (payload.budgets) {
      setBudgets(payload.budgets);
      saveCategoryBudgets(payload.budgets);
    }
  };

  const handleResetDemoData = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    saveLocalAccounts(DEFAULT_ACCOUNTS);
    setCategories(DEFAULT_CATEGORIES);
    saveLocalCategories(DEFAULT_CATEGORIES);
    setTransactions(DEFAULT_TRANSACTIONS);
    saveLocalTransactions(DEFAULT_TRANSACTIONS);
    setRecurringTemplates(DEFAULT_RECURRING_TEMPLATES);
    saveRecurringTemplates(DEFAULT_RECURRING_TEMPLATES);
  };

  // Module 1: Show Splash & Multi-Mode Lock Screen until unlocked
  if (!isUnlocked) {
    return (
      <SplashAuthScreen
        lang={lang}
        availableLanguages={availableLanguages}
        onChangeLang={handleLanguageChange}
        existingAuth={authRecord}
        securitySettings={securitySettings}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  const localizedStreakNumber = toDevanagariDigits(streakDays, lang);

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-[#241916] flex flex-col">
      {/* Module 5.3: On-Screen Acoustic Toast Simulation Banner */}
      <AcousticToastBanner
        cue={activeAcousticCue}
        lang={lang}
        useDevanagariNumerals={useDevanagariNumerals}
        onDismiss={() => setActiveAcousticCue(null)}
        onReplaySound={() => {
          if (!activeAcousticCue) return;
          if (activeAcousticCue.type === 'revenue') {
            acousticEngine.playRevenueVeena();
          } else {
            acousticEngine.playExpenseTabla();
          }
        }}
      />

      {/* Module 2.1: Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#9E3B24] text-[#FBF8F5] shadow-md border-b-2 border-[#7A2B18]">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          {/* Left: Warli #16 Emblem + Brand Title */}
          <div
            onClick={() => setActiveTab('vault')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="p-1 rounded-xl bg-[#7A2B18] border border-[#FBF8F5]/25 shrink-0">
              <WarliEmblem16 size={36} color="#FBF8F5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl tracking-wide leading-none text-[#FBF8F5]">
                  अर्थसंयम
                </h1>
                {/* Dynamic Streak Badge (🔥 ७ दिवस) */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#241916]/35 border border-[#FBF8F5]/25 text-[11px] font-semibold text-[#FFD2C6]">
                  🔥 {localizedStreakNumber}{' '}
                  {lang === 'mr' ? 'दिवस' : lang === 'hi' ? 'दिन' : 'Days'}
                </span>
              </div>
              <p className="text-[10px] text-[#F4EBE6]/80 hidden sm:block">
                100% Offline Jamakharch Vault • User: {authRecord?.userId}
              </p>
            </div>
          </div>

          {/* Right: Multi-Language Switcher + Settings + Audio Toggle + Lock */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Active Language Environment Switcher (Supports all added languages) */}
            <div className="flex items-center bg-[#7A2B18] p-0.5 rounded-xl border border-[#FBF8F5]/20 max-w-[200px] sm:max-w-none overflow-x-auto">
              {availableLanguages.map((l) => {
                const active = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleLanguageChange(l.code)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      active
                        ? 'bg-[#FBF8F5] text-[#9E3B24] shadow-xs'
                        : 'text-[#FBF8F5]/85 hover:bg-[#FBF8F5]/10'
                    }`}
                  >
                    {l.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Quick Settings Button */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl border transition ${
                activeTab === 'settings'
                  ? 'bg-[#FBF8F5] text-[#9E3B24] border-[#FBF8F5]'
                  : 'bg-[#7A2B18] hover:bg-[#632112] text-[#FBF8F5] border-[#FBF8F5]/20'
              }`}
              title={t.navSettings}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Acoustic Sound Mute/Unmute Toggle */}
            <button
              type="button"
              onClick={handleToggleAudioMute}
              className="p-2 rounded-xl bg-[#7A2B18] hover:bg-[#632112] text-[#FBF8F5] border border-[#FBF8F5]/20 transition"
              title={isAudioMuted ? t.soundMuted : t.soundEnabled}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Lock Vault Button */}
            <button
              type="button"
              onClick={() => setIsUnlocked(false)}
              className="p-2 rounded-xl bg-[#7A2B18] hover:bg-[#632112] text-[#FBF8F5] border border-[#FBF8F5]/20 transition"
              title={t.lockVault}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module Navigation Bar */}
        <nav className="bg-[#88301B] border-t border-[#FBF8F5]/15">
          <div className="max-w-4xl mx-auto px-2 sm:px-5 flex items-center justify-between overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'vault', label: t.navVault, icon: <Home className="w-4 h-4" /> },
                { id: 'analytics', label: t.navAnalytics, icon: <PieChart className="w-4 h-4" /> },
                { id: 'accounts', label: t.navAccounts, icon: <Landmark className="w-4 h-4" /> },
                {
                  id: 'categories',
                  label: t.navCategories,
                  icon: <Languages className="w-4 h-4" />,
                },
                { id: 'habits', label: t.navHabits, icon: <Bell className="w-4 h-4" /> },
                { id: 'settings', label: t.navSettings, icon: <Settings className="w-4 h-4" /> },
                { id: 'db', label: t.navPrivacyDb, icon: <Database className="w-4 h-4" /> },
              ] as const
            ).map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-3 transition ${
                    active
                      ? 'border-[#FBF8F5] text-[#FBF8F5] bg-[#7A2B18]/60'
                      : 'border-transparent text-[#F4EBE6]/75 hover:text-[#FBF8F5]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-5 pt-5">
        {activeTab === 'vault' && (
          <DashboardVault
            lang={lang}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            recurringTemplates={recurringTemplates}
            useDevanagariNumerals={useDevanagariNumerals}
            onToggleNumerals={() => setUseDevanagariNumerals((v) => !v)}
            onOpenAddTransaction={(type) => {
              setEditingTransaction(null);
              setTxModalInitialType(type);
              setTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setTxModalInitialType(tx.type);
              setTxModalOpen(true);
            }}
            onExecuteRecurringTemplate={handleExecuteRecurringTemplate}
            onDeleteRecurringTemplate={handleDeleteRecurringTemplate}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsBudgetModule
            lang={lang}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            budgets={budgets}
            useDevanagariNumerals={useDevanagariNumerals}
            onUpdateBudgets={(next) => {
              setBudgets(next);
              saveCategoryBudgets(next);
            }}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsVaultModule
            lang={lang}
            accounts={accounts}
            useDevanagariNumerals={useDevanagariNumerals}
            onAddAccount={handleAddAccount}
            onUpdateAccountTarget={handleUpdateAccountTarget}
            onTransferBetweenAccounts={handleTransferBetweenAccounts}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryMappingModule
            lang={lang}
            availableLanguages={availableLanguages}
            categories={categories}
            transactions={transactions}
            useDevanagariNumerals={useDevanagariNumerals}
            onAddCategory={handleAddCategory}
          />
        )}

        {activeTab === 'habits' && (
          <HabitTriggersModule
            lang={lang}
            habits={habits}
            transactions={transactions}
            categories={categories}
            useDevanagariNumerals={useDevanagariNumerals}
            onUpdateHabits={(next) => {
              setHabits(next);
              saveLocalHabits(next);
            }}
            onTriggerTestCue={handleTriggerTestCue}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModule
            lang={lang}
            availableLanguages={availableLanguages}
            authRecord={authRecord}
            securitySettings={securitySettings}
            onChangeLang={handleLanguageChange}
            onUpdateAvailableLanguages={handleUpdateAvailableLanguages}
            onUpdateAuthRecord={(rec) => {
              saveLocalAuth(rec);
              setAuthRecord(rec);
            }}
            onUpdateSecuritySettings={handleUpdateSecuritySettings}
          />
        )}

        {activeTab === 'db' && (
          <OfflinePrivacyInspector
            lang={lang}
            authRecord={authRecord}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            budgets={budgets}
            onImportBackupData={handleImportBackupData}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Module 2.5: Extended FAB Dock (+ जमा Revenue & - खर्च Expense) */}
      <div className="fixed bottom-4 inset-x-0 z-40 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto bg-[#241916]/95 backdrop-blur-md p-2 rounded-3xl shadow-2xl border-2 border-[#9E3B24]/60 flex items-center gap-2.5 max-w-md w-full">
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setTxModalInitialType('revenue');
              setTxModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#23533D] active:scale-[0.98] text-[#FBF8F5] font-semibold text-sm shadow transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.fabAddRevenue}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setTxModalInitialType('expense');
              setTxModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#9E3B24] hover:bg-[#7A2B18] active:scale-[0.98] text-[#FBF8F5] font-semibold text-sm shadow transition flex items-center justify-center gap-1.5"
          >
            <Minus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.fabAddExpense}</span>
          </button>
        </div>
      </div>

      {/* Module 5: Transaction Entry & Edit Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        initialType={txModalInitialType}
        editingTransaction={editingTransaction}
        lang={lang}
        accounts={accounts}
        categories={categories}
        transactions={transactions}
        securitySettings={securitySettings}
        useDevanagariNumerals={useDevanagariNumerals}
        onClose={() => {
          setTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onUpdateSecuritySettings={handleUpdateSecuritySettings}
        onSubmitTransaction={handleSubmitTransaction}
        onUpdateExistingTransaction={handleUpdateExistingTransaction}
      />
    </div>
  );
}
export default App;
