import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  Wallet,
  TrendingUp,
  Calendar,
  Trash2,
  PlusCircle,
  Search,
  X,
  Edit3,
  Repeat,
  Zap,
} from 'lucide-react';
import {
  Account,
  Category,
  Language,
  RecurringTemplate,
  Transaction,
  TransactionType,
} from '../types';
import {
  formatINR,
  formatRelativeTime,
  getCategoryLabel,
  toDevanagariDigits,
  TRANSLATIONS,
} from '../i18n/translations';
import { WarliBorderDivider, WarliEmblem16 } from './WarliArt';

interface DashboardVaultProps {
  lang: Language;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringTemplates: RecurringTemplate[];
  useDevanagariNumerals: boolean;
  onToggleNumerals: () => void;
  onOpenAddTransaction: (type: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onExecuteRecurringTemplate: (tpl: RecurringTemplate) => void;
  onDeleteRecurringTemplate: (tplId: string) => void;
  onDeleteTransaction: (txId: string) => void;
  onNavigateTab: (
    tab: 'vault' | 'analytics' | 'accounts' | 'categories' | 'habits' | 'settings' | 'db'
  ) => void;
}

export const DashboardVault: React.FC<DashboardVaultProps> = ({
  lang,
  accounts,
  categories,
  transactions,
  recurringTemplates,
  useDevanagariNumerals,
  onToggleNumerals,
  onOpenAddTransaction,
  onEditTransaction,
  onExecuteRecurringTemplate,
  onDeleteRecurringTemplate,
  onDeleteTransaction,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[lang];
  const [txFilter, setTxFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2.2 Aggregate live balances across all local accounts
  const totalNetWealth = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const now = new Date();
  const currentMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const currentMonthRevenue = currentMonthTxs
    .filter((tx) => tx.type === 'revenue')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentMonthExpense = currentMonthTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savingsRate =
    currentMonthRevenue > 0
      ? Math.max(
          0,
          Math.round(((currentMonthRevenue - currentMonthExpense) / currentMonthRevenue) * 100)
        )
      : 0;

  const getCategoryById = (catId: string): Category | undefined =>
    categories.find((c) => c.id === catId);

  const getAccountById = (accId: string): Account | undefined =>
    accounts.find((a) => a.id === accId);

  const getAccountName = (acc: Account | undefined): string => {
    if (!acc) return '—';
    if (acc.nameLocalized && acc.nameLocalized[lang]) {
      return acc.nameLocalized[lang];
    }
    return acc.name;
  };

  // Multi-criteria Ledger Filter (Type + Account + Search Query across Note, Category Labels, and Amount)
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter !== 'all' && tx.type !== txFilter) return false;
    if (accountFilter !== 'all' && tx.accountId !== accountFilter) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const cat = getCategoryById(tx.categoryId);
    const allCatLabels = cat ? Object.values(cat.labels).join(' ').toLowerCase() : '';
    const noteText = (tx.note || '').toLowerCase();
    const amountStr = String(tx.amount);

    return (
      noteText.includes(q) ||
      allCatLabels.includes(q) ||
      amountStr.includes(q) ||
      tx.categoryId.toLowerCase().includes(q)
    );
  });

  const getAccountTypeBadge = (type: Account['type']) => {
    if (type === 'bank') {
      return {
        icon: <Landmark className="w-4 h-4 text-[#9E3B24]" />,
        label: t.typeBankAccount,
      };
    }
    if (type === 'savings') {
      return {
        icon: <PiggyBank className="w-4 h-4 text-[#2D6A4F]" />,
        label: t.typeSavingsGoal,
      };
    }
    return {
      icon: <Wallet className="w-4 h-4 text-[#D9822B]" />,
      label: t.typeCashWallet,
    };
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Module 2.2: Net Wealth Hero Card */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#9E3B24] via-[#8B321D] to-[#6E2514] text-[#FBF8F5] p-6 shadow-xl overflow-hidden border-2 border-[#F4EBE6]/20">
        {/* Background Warli Watermark */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <WarliEmblem16 size={190} color="#FBF8F5" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs sm:text-sm font-medium text-[#F4EBE6]/90 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#F4EBE6]" />
              {t.netWealthLabel}
            </span>

            <button
              type="button"
              onClick={onToggleNumerals}
              className="px-2.5 py-1 rounded-full bg-[#241916]/30 hover:bg-[#241916]/50 border border-[#FBF8F5]/25 text-[11px] font-medium text-[#FBF8F5] transition"
              title="Toggle Devanagari / Standard Numerals"
            >
              {useDevanagariNumerals ? '१२३ -> 123' : '123 -> १२३'}
            </button>
          </div>

          <div className="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF8F5] my-1">
            {formatINR(totalNetWealth, lang, useDevanagariNumerals)}
          </div>

          <div className="text-xs text-[#F4EBE6]/80 mb-5 flex items-center gap-2">
            <span>
              {lang === 'mr'
                ? `${toDevanagariDigits(accounts.length, lang)} सक्रिय स्थानिक खाती`
                : lang === 'hi'
                ? `${toDevanagariDigits(accounts.length, lang)} सक्रिय स्थानीय खाते`
                : `${accounts.length} Active Local Accounts`}
            </span>
            <span>•</span>
            <span>
              {t.savingsRateLabel}:{' '}
              <strong>
                {useDevanagariNumerals ? toDevanagariDigits(savingsRate, lang) : savingsRate}%
              </strong>
            </span>
          </div>

          {/* Current Month Revenue (जमा) & Expense (खर्च) Split Cards */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#FBF8F5]/20">
            <div
              onClick={() => onOpenAddTransaction('revenue')}
              className="cursor-pointer group rounded-2xl bg-[#241916]/25 hover:bg-[#241916]/40 p-3.5 border border-[#A3D9B8]/30 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#E8F5EE] font-medium">{t.currentMonthRevenue}</span>
                <span className="p-1 rounded-lg bg-[#2D6A4F] text-[#FBF8F5]">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-mono text-lg sm:text-2xl font-bold text-[#A3D9B8]">
                +{formatINR(currentMonthRevenue, lang, useDevanagariNumerals)}
              </div>
            </div>

            <div
              onClick={() => onOpenAddTransaction('expense')}
              className="cursor-pointer group rounded-2xl bg-[#241916]/25 hover:bg-[#241916]/40 p-3.5 border border-[#E8B4A6]/30 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#FCEEE9] font-medium">{t.currentMonthExpense}</span>
                <span className="p-1 rounded-lg bg-[#C45338] text-[#FBF8F5]">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-mono text-lg sm:text-2xl font-bold text-[#FFD2C6]">
                -{formatINR(currentMonthExpense, lang, useDevanagariNumerals)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2.3: Bank Accounts Carousel (with Savings Goal Mini Progress Bar) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-heading text-lg sm:text-xl text-[#241916]">
            {t.accountsCarouselTitle}
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('accounts')}
            className="text-xs font-semibold text-[#9E3B24] hover:underline"
          >
            {t.manageAllAccounts}
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x">
          {accounts.map((acc) => {
            const meta = getAccountTypeBadge(acc.type);
            const isSelectedFilter = accountFilter === acc.id;
            const hasGoal = typeof acc.targetAmount === 'number' && acc.targetAmount > 0;
            const goalPct = hasGoal
              ? Math.min(100, Math.round((acc.currentBalance / acc.targetAmount!) * 100))
              : 0;

            return (
              <div
                key={acc.id}
                onClick={() =>
                  setAccountFilter((prev) => (prev === acc.id ? 'all' : acc.id))
                }
                className={`cursor-pointer min-w-[250px] sm:min-w-[275px] snap-start rounded-2xl p-4 shadow-sm transition flex flex-col justify-between border-2 ${
                  isSelectedFilter
                    ? 'bg-[#FCEEE9] border-[#9E3B24]'
                    : 'bg-[#F4EBE6] border-[#9E3B24]/20 hover:border-[#9E3B24]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FBF8F5] text-[11px] font-semibold text-[#5C4742] border border-[#9E3B24]/15">
                      {meta.icon}
                      <span className="truncate max-w-[150px]">{meta.label}</span>
                    </span>
                    {isSelectedFilter && (
                      <span className="text-[10px] font-bold text-[#9E3B24]">Filtered ✓</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-[#241916] line-clamp-1 mt-1">
                    {getAccountName(acc)}
                  </h3>
                </div>

                {hasGoal && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#2D6A4F] font-semibold">
                      <span>Goal: {formatINR(acc.targetAmount!, lang, useDevanagariNumerals)}</span>
                      <span>{goalPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#FBF8F5] overflow-hidden">
                      <div
                        className="h-full bg-[#2D6A4F]"
                        style={{ width: `${goalPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-[#9E3B24]/15 flex items-baseline justify-between">
                  <span className="text-[11px] text-[#5C4742]">{t.currentBalanceTag}</span>
                  <span className="font-mono text-lg font-bold text-[#241916]">
                    {formatINR(acc.currentBalance, lang, useDevanagariNumerals)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Add Vault Card */}
          <button
            type="button"
            onClick={() => onNavigateTab('accounts')}
            className="min-w-[160px] snap-start rounded-2xl bg-[#FBF8F5] border-2 border-dashed border-[#9E3B24]/35 hover:border-[#9E3B24] p-4 flex flex-col items-center justify-center gap-2 text-[#9E3B24] transition"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs font-semibold text-center">{t.addAccountTitle}</span>
          </button>
        </div>
      </section>

      <WarliBorderDivider color="#9E3B24" />

      {/* 1-Click Recurring Jamakharch Templates Section */}
      {recurringTemplates.length > 0 && (
        <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-heading text-base sm:text-lg text-[#241916] flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#9E3B24]" />
              <span>
                {lang === 'mr'
                  ? '१-क्लिक नियमित जमाखर्च साचे (1-Click Recurring Entries)'
                  : lang === 'hi'
                  ? '१-क्लिक नियमित जमाखर्च (1-Click Recurring)'
                  : '1-Click Recurring Jamakharch Templates'}
              </span>
            </h3>
            <span className="text-[11px] text-[#5C4742]">
              {lang === 'mr' ? 'नोंद करण्यासाठी क्लिक करा' : 'Tap to log instantly'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {recurringTemplates.map((tpl) => {
              const isRev = tpl.type === 'revenue';
              return (
                <div
                  key={tpl.id}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border shrink-0 transition ${
                    isRev
                      ? 'bg-[#E8F5EE] border-[#2D6A4F]/40 text-[#2D6A4F]'
                      : 'bg-[#FBF8F5] border-[#9E3B24]/30 text-[#241916]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onExecuteRecurringTemplate(tpl)}
                    className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80"
                    title="1-Click Log Transaction"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#9E3B24]" />
                    <span>{tpl.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecurringTemplate(tpl.id)}
                    className="p-0.5 rounded hover:bg-[#241916]/10 text-[#8A726B] hover:text-[#9E3B24]"
                    title="Remove template"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Module 2.4: Recent Activity Feed (with Search & Account Filter) */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#9E3B24]" />
            <h2 className="font-heading text-lg sm:text-xl text-[#241916]">
              {t.recentActivityTitle}
            </h2>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#FBF8F5] p-1 rounded-xl border border-[#9E3B24]/20 self-start">
            {(['all', 'revenue', 'expense'] as const).map((f) => {
              const active = txFilter === f;
              const label =
                f === 'all' ? t.filterAll : f === 'revenue' ? t.filterRevenue : t.filterExpense;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTxFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    active
                      ? 'bg-[#9E3B24] text-[#FBF8F5] shadow-sm'
                      : 'text-[#5C4742] hover:bg-[#F4EBE6]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input + Account Vault Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-[#9E3B24] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'नोंद, वर्गवारी किंवा रक्कम शोधा (उदा. चहा, भाजीपाला, 350)...'
                  : lang === 'hi'
                  ? 'विवरण, श्रेणी या राशि खोजें...'
                  : 'Search by note, category, or amount (e.g. Tea, 350)...'
              }
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/25 text-xs sm:text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A726B] hover:text-[#241916]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/25 text-xs sm:text-sm font-semibold text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            >
              <option value="all">
                {lang === 'mr' ? 'सर्व खाती (All Vaults)' : 'All Account Vaults'}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {getAccountName(acc)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-sm text-[#5C4742]">{t.noTransactionsYet}</div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const cat = getCategoryById(tx.categoryId);
              const acc = getAccountById(tx.accountId);
              const isRev = tx.type === 'revenue';
              const categoryTitle = getCategoryLabel(cat, lang);

              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/15 hover:border-[#9E3B24]/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                        isRev
                          ? 'bg-[#E8F5EE] border-[#A3D9B8] text-[#2D6A4F]'
                          : 'bg-[#FCEEE9] border-[#E8B4A6] text-[#9E3B24]'
                      }`}
                    >
                      {cat?.icon || (isRev ? '🌾' : '🏺')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#241916] truncate">
                          {categoryTitle}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4EBE6] text-[#5C4742] border border-[#9E3B24]/15">
                          {getAccountName(acc)}
                        </span>
                      </div>

                      {tx.note && (
                        <p className="text-xs text-[#5C4742] truncate mt-0.5">{tx.note}</p>
                      )}

                      <div className="text-[11px] text-[#8A726B] mt-0.5 flex items-center gap-2">
                        <span>{formatRelativeTime(tx.timestamp, lang)}</span>
                        <span className="font-mono text-[10px] opacity-75">[{tx.categoryId}]</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`font-mono text-base sm:text-lg font-bold ${
                        isRev ? 'text-[#2D6A4F]' : 'text-[#9E3B24]'
                      }`}
                    >
                      {isRev ? '+' : '-'}
                      {formatINR(tx.amount, lang, useDevanagariNumerals)}
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditTransaction(tx)}
                      className="opacity-65 hover:opacity-100 p-1.5 rounded-lg hover:bg-[#F4EBE6] text-[#5C4742] hover:text-[#241916] transition"
                      title="Edit / Backdate transaction"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="opacity-60 hover:opacity-100 p-1.5 rounded-lg hover:bg-[#FCEEE9] text-[#9E3B24] transition"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
