import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  ChevronDown,
  Music,
  Calendar,
  Repeat,
} from 'lucide-react';
import {
  Account,
  Category,
  ExpenseInstrumentStyle,
  Language,
  LocalSecuritySettings,
  RevenueInstrumentStyle,
  Transaction,
  TransactionType,
} from '../types';
import { formatINR, getCategoryLabel, TRANSLATIONS } from '../i18n/translations';
import { acousticEngine } from '../utils/acousticEngine';
import { getTop4RecentCategories } from '../utils/localDatabase';

interface TransactionModalProps {
  isOpen: boolean;
  initialType: TransactionType;
  editingTransaction?: Transaction | null;
  lang: Language;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  securitySettings: LocalSecuritySettings;
  useDevanagariNumerals: boolean;
  onClose: () => void;
  onUpdateSecuritySettings: (next: LocalSecuritySettings) => void;
  onSubmitTransaction: (
    type: TransactionType,
    accountId: string,
    categoryId: string,
    amount: number,
    note: string,
    customDateIso?: string,
    saveAsRecurring?: boolean
  ) => void;
  onUpdateExistingTransaction?: (
    txId: string,
    type: TransactionType,
    accountId: string,
    categoryId: string,
    amount: number,
    note: string,
    customDateIso: string
  ) => void;
}

const QUICK_AMOUNTS = [20, 50, 100, 500, 2000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialType,
  editingTransaction,
  lang,
  accounts,
  categories,
  transactions,
  securitySettings,
  useDevanagariNumerals,
  onClose,
  onUpdateSecuritySettings,
  onSubmitTransaction,
  onUpdateExistingTransaction,
}) => {
  const t = TRANSLATIONS[lang];
  const [type, setType] = useState<TransactionType>(initialType);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [saveAsRecurring, setSaveAsRecurring] = useState<boolean>(false);

  const availableCategories = categories.filter(
    (c) => c.kind === type || c.kind === 'both'
  );

  const top4RecentCategories = getTop4RecentCategories(categories, transactions, type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAccountId(editingTransaction.accountId);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setNote(editingTransaction.note || '');
      setDateStr(editingTransaction.timestamp.slice(0, 10));
      setSaveAsRecurring(false);
    } else {
      setType(initialType);
      setAmount('');
      setNote('');
      setDateStr(new Date().toISOString().slice(0, 10));
      setSaveAsRecurring(false);
    }
  }, [editingTransaction, initialType, isOpen]);

  useEffect(() => {
    if (!editingTransaction && accounts.length > 0 && !accounts.some((a) => a.id === accountId)) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId, editingTransaction]);

  useEffect(() => {
    if (editingTransaction) return;
    const recentForType = getTop4RecentCategories(categories, transactions, type);
    const matching = categories.filter((c) => c.kind === type || c.kind === 'both');
    if (recentForType.length > 0) {
      setCategoryId(recentForType[0].id);
    } else if (matching.length > 0) {
      setCategoryId(matching[0].id);
    }
  }, [type, categories, transactions, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !accountId || !categoryId) return;

    // Combine selected date (YYYY-MM-DD) with current time
    const todayIso = new Date().toISOString().slice(0, 10);
    const finalTimestamp =
      dateStr === todayIso
        ? new Date().toISOString()
        : new Date(`${dateStr}T12:00:00`).toISOString();

    if (editingTransaction && onUpdateExistingTransaction) {
      onUpdateExistingTransaction(
        editingTransaction.id,
        type,
        accountId,
        categoryId,
        numericAmount,
        note.trim(),
        finalTimestamp
      );
    } else {
      onSubmitTransaction(
        type,
        accountId,
        categoryId,
        numericAmount,
        note.trim(),
        finalTimestamp,
        saveAsRecurring
      );
    }

    onClose();
  };

  const isRevenue = type === 'revenue';

  const handleTestInstrument = () => {
    if (isRevenue) {
      acousticEngine.playRevenueVeena();
    } else {
      acousticEngine.playExpenseTabla();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#241916]/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FBF8F5] border-t-4 sm:border-2 border-[#9E3B24] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl sm:text-2xl text-[#241916]">
            {editingTransaction
              ? lang === 'mr'
                ? 'जमाखर्च नोंद संपादित करा (Edit Entry)'
                : 'Edit Jamakharch Entry'
              : isRevenue
              ? t.txModalTitleRevenue
              : t.txModalTitleExpense}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F4EBE6] text-[#5C4742] hover:text-[#241916]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Module 5.1: Type Toggle (Revenue vs Expense) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#F4EBE6] border border-[#9E3B24]/20 mb-4">
          <button
            type="button"
            onClick={() => setType('revenue')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              isRevenue
                ? 'bg-[#2D6A4F] text-[#FBF8F5] shadow'
                : 'text-[#5C4742] hover:bg-[#FBF8F5]/60'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t.txTypeRevenue}</span>
          </button>

          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              !isRevenue
                ? 'bg-[#9E3B24] text-[#FBF8F5] shadow'
                : 'text-[#5C4742] hover:bg-[#FBF8F5]/60'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t.txTypeExpense}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Numeric Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.amountLabel}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-2xl font-bold text-[#9E3B24]">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.amountPlaceholder}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#F4EBE6] border-2 border-[#9E3B24]/30 font-mono text-2xl font-bold text-[#241916] focus:outline-none focus:border-[#9E3B24]"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-[#F4EBE6] hover:bg-[#EADCD3] border border-[#9E3B24]/20 font-mono text-xs font-semibold text-[#5C4742]"
                >
                  +{formatINR(amt, lang, useDevanagariNumerals)}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selector + Backdate Picker Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
                {t.selectAccountLabel}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4EBE6] border border-[#9E3B24]/30 text-sm font-medium text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
              >
                {accounts.map((acc) => {
                  const name = acc.nameLocalized?.[lang] || acc.name;
                  return (
                    <option key={acc.id} value={acc.id}>
                      {name} — ({formatINR(acc.currentBalance, lang, useDevanagariNumerals)})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-[#5C4742] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#9E3B24]" />
                <span>{lang === 'mr' ? 'तारीख (Date)' : 'Entry Date'}</span>
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F4EBE6] border border-[#9E3B24]/30 font-mono text-xs sm:text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
              />
            </div>
          </div>

          {/* Category Section: Dropdown + Top 4 Recently Used Categories */}
          <div className="p-3.5 rounded-2xl bg-[#F4EBE6]/65 border border-[#9E3B24]/20 space-y-3">
            {/* 1. Category Dropdown for All Categories */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#241916] mb-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-[#9E3B24]" />
                <span>{t.allCategoriesDropdownLabel}</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border-2 border-[#9E3B24]/35 text-sm font-semibold text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {getCategoryLabel(cat, lang)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Top 4 Recently Used Categories Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#9E3B24]">
                  <Clock className="w-3 h-3" />
                  <span>{t.top4RecentCategoriesLabel}</span>
                </span>
                <span className="text-[10px] text-[#5C4742]">4 Quick Picks</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {top4RecentCategories.map((cat) => {
                  const selected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        selected
                          ? isRevenue
                            ? 'bg-[#E8F5EE] border-2 border-[#2D6A4F] text-[#241916] shadow-xs'
                            : 'bg-[#FCEEE9] border-2 border-[#9E3B24] text-[#241916] shadow-xs'
                          : 'bg-[#FBF8F5] border-[#9E3B24]/20 text-[#5C4742] hover:bg-[#EADCD3]/50'
                      }`}
                    >
                      <span className="text-lg shrink-0">{cat.icon}</span>
                      <span className="text-xs font-semibold truncate">
                        {getCategoryLabel(cat, lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Marathi Musical Instrument Badge (Veena for Revenue, Tabla for Expense) */}
          <div className="p-3 rounded-2xl bg-[#F4EBE6]/80 border border-[#9E3B24]/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#241916]">
              <Music className="w-4 h-4 text-[#9E3B24]" />
              <span>
                {isRevenue
                  ? lang === 'mr'
                    ? '🎻 जमा वाद्य: सरस्वती वीणा झंकार (Veena)'
                    : '🎻 Revenue Instrument: Saraswati Veena'
                  : lang === 'mr'
                  ? '🥁 खर्च वाद्य: तबला थाप (Tabla: धा-धिन-धिन-ना)'
                  : '🥁 Expense Instrument: Traditional Tabla'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleTestInstrument}
              className="px-3 py-1 rounded-xl bg-[#FBF8F5] hover:bg-[#EADCD3] border border-[#9E3B24]/30 text-xs font-semibold text-[#9E3B24]"
            >
              {lang === 'mr' ? 'नाद ऐका ♪' : 'Preview ♪'}
            </button>
          </div>

          {/* Optional Note + Save as Recurring Template Checkbox */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#5C4742]">
              {t.noteLabel}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4EBE6] border border-[#9E3B24]/25 text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            />

            {!editingTransaction && (
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E3B24] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveAsRecurring}
                  onChange={(e) => setSaveAsRecurring(e.target.checked)}
                  className="accent-[#9E3B24] w-4 h-4 rounded"
                />
                <Repeat className="w-3.5 h-3.5" />
                <span>
                  {lang === 'mr'
                    ? 'डॅशबोर्डवर १-क्लिक नियमित साचा (Recurring Template) म्हणून जतन करा'
                    : 'Save as 1-Click Recurring Template on Dashboard'}
                </span>
              </label>
            )}
          </div>

          {/* Submit Button with Acoustic Cue Indicator */}
          <button
            type="submit"
            className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-[#FBF8F5] shadow-lg transition flex items-center justify-center gap-2 ${
              isRevenue ? 'bg-[#2D6A4F] hover:bg-[#23533D]' : 'bg-[#9E3B24] hover:bg-[#7A2B18]'
            }`}
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>
              {editingTransaction
                ? lang === 'mr'
                  ? 'बदल जतन करा (Update Transaction)'
                  : 'Save Updated Entry'
                : isRevenue
                ? t.submitRevenueBtn
                : t.submitExpenseBtn}
            </span>
          </button>

          {/* Acoustic Preview Tester inside Modal */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-[#5C4742]">
            <span>{t.acousticPreviewSection}:</span>
            <button
              type="button"
              onClick={handleTestInstrument}
              className="underline font-semibold text-[#9E3B24] hover:text-[#7A2B18]"
            >
              {isRevenue ? t.testTaalPakhawaj : t.testGhungrooBamboo}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
