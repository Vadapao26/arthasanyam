import React, { useState } from 'react';
import {
  PieChart,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  Account,
  Category,
  CategoryBudgetMap,
  Language,
  Transaction,
} from '../types';
import {
  formatINR,
  getCategoryLabel,
  toDevanagariDigits,
} from '../i18n/translations';
import { WarliBorderDivider, WarliEmblem16 } from './WarliArt';

interface AnalyticsBudgetModuleProps {
  lang: Language;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: CategoryBudgetMap;
  useDevanagariNumerals: boolean;
  onUpdateBudgets: (next: CategoryBudgetMap) => void;
}

export const AnalyticsBudgetModule: React.FC<AnalyticsBudgetModuleProps> = ({
  lang,
  accounts,
  categories,
  transactions,
  budgets,
  useDevanagariNumerals,
  onUpdateBudgets,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [draftLimit, setDraftLimit] = useState<string>('');

  const totalRevenue = transactions
    .filter((tx) => tx.type === 'revenue')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netSavings = totalRevenue - totalExpense;
  const totalVolume = Math.max(1, totalRevenue + totalExpense);
  const revenueSharePct = Math.round((totalRevenue / totalVolume) * 100);
  const expenseSharePct = 100 - revenueSharePct;

  // Expense Categories Aggregation
  const expenseCategories = categories.filter(
    (c) => c.kind === 'expense' || c.kind === 'both'
  );

  const categoryStats = expenseCategories
    .map((cat) => {
      const matchingTxs = transactions.filter(
        (tx) => tx.type === 'expense' && tx.categoryId === cat.id
      );
      const spent = matchingTxs.reduce((s, tx) => s + tx.amount, 0);
      const limit = budgets[cat.id] || 2000;
      const pctOfBudget = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const pctOfTotalExpense =
        totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;

      return {
        cat,
        spent,
        limit,
        count: matchingTxs.length,
        pctOfBudget,
        pctOfTotalExpense,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const totalMonthlyBudget = categoryStats.reduce((s, item) => s + item.limit, 0);

  // SVG Donut Chart Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const revenueStroke = (revenueSharePct / 100) * circumference;

  const handleStartEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setDraftLimit(String(currentLimit));
  };

  const handleSaveLimit = (catId: string) => {
    const val = Math.max(100, Number(draftLimit) || 1000);
    onUpdateBudgets({
      ...budgets,
      [catId]: val,
    });
    setEditingCatId(null);
  };

  // Offline CSV Export with UTF-8 BOM for Marathi/Hindi Devanagari compatibility
  const handleExportCSV = () => {
    const headers = [
      'Transaction_ID',
      'Date_ISO',
      'Type',
      'Account_Name',
      'Unified_Category_ID',
      'Category_Label',
      'Amount_INR',
      'Note',
    ];

    const rows = transactions.map((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId);
      const cat = categories.find((c) => c.id === tx.categoryId);
      const accName = (acc?.nameLocalized?.[lang] || acc?.name || tx.accountId).replace(
        /"/g,
        '""'
      );
      const catLabel = getCategoryLabel(cat, lang).replace(/"/g, '""');
      const safeNote = (tx.note || '').replace(/"/g, '""');

      return [
        tx.id,
        tx.timestamp,
        tx.type.toUpperCase(),
        `"${accName}"`,
        tx.categoryId,
        `"${catLabel}"`,
        tx.amount,
        `"${safeNote}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arthasanyam_jamakharch_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header + CSV / Print Actions */}
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl sm:text-2xl text-[#241916]">
              {lang === 'mr'
                ? 'मासिक जमाखर्च ताळेबंद आणि बजेट संयम'
                : lang === 'hi'
                ? 'मासिक जमाखर्च विश्लेषण और बजट सीमा'
                : 'Monthly Jamakharch Analytics & Category Budgets'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4742] mt-1">
              {lang === 'mr'
                ? 'वारली आलेख, प्रत्येक वर्गवारीची खर्च मर्यादा आणि १००% ऑफलाईन CSV / प्रिंट पत्रक.'
                : lang === 'hi'
                ? 'वारली चार्ट, श्रेणी बजट सीमा और १००% ऑफ़लाइन CSV / प्रिंट बहीखाता।'
                : 'Warli visual charts, per-category spending limits, and 100% offline CSV / Printable ledger.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#23533D] text-[#FBF8F5] text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'mr' ? 'CSV डाउनलोड करा' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] hover:bg-[#EADCD3] text-[#9E3B24] border border-[#9E3B24]/35 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'mr' ? 'पत्रक प्रिंट / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Warli Jamakharch Visual Donut & Balance Sheet */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* SVG Warli Donut Chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
                {/* Background Expense Ring (Geru Red) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#9E3B24"
                  strokeWidth="18"
                />
                {/* Foreground Revenue Ring (Tulsi Green) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#2D6A4F"
                  strokeWidth="18"
                  strokeDasharray={`${revenueStroke} ${circumference}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <WarliEmblem16 size={38} color="#9E3B24" />
                <span className="font-mono text-xs font-bold text-[#241916] mt-1">
                  {useDevanagariNumerals
                    ? toDevanagariDigits(revenueSharePct, lang)
                    : revenueSharePct}
                  % जमा
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold mt-2">
              <span className="inline-flex items-center gap-1.5 text-[#2D6A4F]">
                <span className="w-3 h-3 rounded-full bg-[#2D6A4F]" />
                जमा ({revenueSharePct}%)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#9E3B24]">
                <span className="w-3 h-3 rounded-full bg-[#9E3B24]" />
                खर्च ({expenseSharePct}%)
              </span>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#E8F5EE] border border-[#A3D9B8]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F]">
                <TrendingUp className="w-4 h-4" />
                <span>{lang === 'mr' ? 'एकूण जमा (Inflow)' : 'Total Revenue'}</span>
              </div>
              <div className="font-mono text-xl font-bold text-[#2D6A4F] mt-1">
                +{formatINR(totalRevenue, lang, useDevanagariNumerals)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCEEE9] border border-[#E8B4A6]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#9E3B24]">
                <TrendingDown className="w-4 h-4" />
                <span>{lang === 'mr' ? 'एकूण खर्च (Outflow)' : 'Total Expense'}</span>
              </div>
              <div className="font-mono text-xl font-bold text-[#9E3B24] mt-1">
                -{formatINR(totalExpense, lang, useDevanagariNumerals)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF8F5] border-2 border-[#9E3B24]/25">
              <div className="text-xs font-bold text-[#5C4742]">
                {lang === 'mr' ? 'निव्वळ शिल्लक बचत' : 'Net Surplus'}
              </div>
              <div
                className={`font-mono text-xl font-bold mt-1 ${
                  netSavings >= 0 ? 'text-[#2D6A4F]' : 'text-[#9E3B24]'
                }`}
              >
                {netSavings >= 0 ? '+' : '-'}
                {formatINR(Math.abs(netSavings), lang, useDevanagariNumerals)}
              </div>
              <div className="text-[11px] text-[#8A726B] mt-0.5">
                Budget Pool: {formatINR(totalMonthlyBudget, lang, useDevanagariNumerals)}
              </div>
            </div>

            {/* Category Distribution Stacked Bar */}
            <div className="sm:col-span-3 p-4 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#241916]">
                <span>
                  {lang === 'mr'
                    ? 'वर्गवारीनुसार खर्च विभागणी (Expense Share by Unified Category)'
                    : 'Expense Share by Unified Category'}
                </span>
                <span className="font-mono text-[#9E3B24]">
                  {formatINR(totalExpense, lang, useDevanagariNumerals)}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {categoryStats
                  .filter((item) => item.spent > 0)
                  .map((item) => (
                    <div key={item.cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#241916]">
                          {item.cat.icon} {getCategoryLabel(item.cat, lang)}
                        </span>
                        <span className="font-mono text-[#5C4742]">
                          {formatINR(item.spent, lang, useDevanagariNumerals)} (
                          {item.pctOfTotalExpense}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F4EBE6] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#9E3B24]"
                          style={{ width: `${Math.min(100, Math.max(4, item.pctOfTotalExpense))}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WarliBorderDivider color="#9E3B24" />

      {/* SECTION 2: Per-Category Monthly Budget Limits Tracker & Editor */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading text-lg sm:text-xl text-[#241916]">
            {lang === 'mr'
              ? 'मासिक वर्गवारी बजेट आणि खर्च संयम मर्यादा (Category Budget Limits)'
              : 'Category Monthly Budget Limits & Alerts'}
          </h3>
          <span className="text-xs text-[#5C4742]">
            {lang === 'mr' ? 'मर्यादा बदलण्यासाठी पेन्सिल चिन्हावर क्लिक करा' : 'Click Edit to set limit'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categoryStats.map(({ cat, spent, limit, count, pctOfBudget }) => {
            const isOver = pctOfBudget >= 100;
            const isWarning = pctOfBudget >= 80 && pctOfBudget < 100;
            const isEditing = editingCatId === cat.id;

            const barColor = isOver
              ? 'bg-[#9E3B24]'
              : isWarning
              ? 'bg-[#D9822B]'
              : 'bg-[#2D6A4F]';

            return (
              <div
                key={cat.id}
                className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4 space-y-3 hover:border-[#9E3B24]/45 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/20 flex items-center justify-center text-xl shrink-0">
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="font-heading text-base text-[#241916]">
                        {getCategoryLabel(cat, lang)}
                      </h4>
                      <span className="text-[11px] text-[#5C4742]">
                        {count} {lang === 'mr' ? 'नोंदी' : 'entries'} •{' '}
                        <span className="font-mono text-[10px]">[{cat.id}]</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-1.5">
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCEEE9] border border-[#9E3B24] text-[#9E3B24] text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        {lang === 'mr' ? 'मर्यादा ओलांडली!' : 'Over Budget'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F5EE] border border-[#2D6A4F]/40 text-[#2D6A4F] text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {pctOfBudget}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#FBF8F5] border border-[#9E3B24]/15 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(100, pctOfBudget)}%` }}
                  />
                </div>

                {/* Spent vs Budget Limit Row + Inline Editor */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[#5C4742]">
                      {lang === 'mr' ? 'झालेला खर्च: ' : 'Spent: '}
                    </span>
                    <strong className="font-mono text-[#241916]">
                      {formatINR(spent, lang, useDevanagariNumerals)}
                    </strong>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={draftLimit}
                        onChange={(e) => setDraftLimit(e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FBF8F5] border border-[#9E3B24] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveLimit(cat.id)}
                        className="p-1.5 rounded-lg bg-[#2D6A4F] text-[#FBF8F5]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#5C4742]">
                        {lang === 'mr' ? 'बजेट मर्यादा: ' : 'Limit: '}
                      </span>
                      <strong className="font-mono text-[#9E3B24]">
                        {formatINR(limit, lang, useDevanagariNumerals)}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat.id, limit)}
                        className="p-1 rounded-lg bg-[#FBF8F5] hover:bg-[#EADCD3] text-[#9E3B24] border border-[#9E3B24]/25"
                        title="Edit Monthly Budget Limit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
