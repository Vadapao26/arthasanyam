import React, { useState } from 'react';
import {
  Landmark,
  PiggyBank,
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeftRight,
  Target,
  Edit3,
  Check,
} from 'lucide-react';
import { Account, AccountType, Language } from '../types';
import { formatINR, TRANSLATIONS } from '../i18n/translations';
import { acousticEngine } from '../utils/acousticEngine';
import { WarliBorderDivider } from './WarliArt';

interface AccountsVaultModuleProps {
  lang: Language;
  accounts: Account[];
  useDevanagariNumerals: boolean;
  onAddAccount: (
    name: string,
    type: AccountType,
    openingBalance: number,
    targetAmount?: number
  ) => void;
  onUpdateAccountTarget: (accountId: string, targetAmount: number) => void;
  onTransferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number
  ) => void;
  onDeleteAccount: (accountId: string) => void;
}

export const AccountsVaultModule: React.FC<AccountsVaultModuleProps> = ({
  lang,
  accounts,
  useDevanagariNumerals,
  onAddAccount,
  onUpdateAccountTarget,
  onTransferBetweenAccounts,
  onDeleteAccount,
}) => {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  // Vault-to-Vault Self-Transfer State
  const [fromAccId, setFromAccId] = useState<string>(accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Inline Goal Target Editor State
  const [editingTargetAccId, setEditingTargetAccId] = useState<string | null>(null);
  const [draftTargetVal, setDraftTargetVal] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const numericBalance = Math.max(0, Number(openingBalance) || 0);
    const numericTarget = Number(targetAmount) > 0 ? Number(targetAmount) : undefined;
    onAddAccount(name.trim(), type, numericBalance, numericTarget);
    setName('');
    setOpeningBalance('');
    setTargetAmount('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleSelfTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(transferAmount);
    if (!amt || amt <= 0 || !fromAccId || !toAccId || fromAccId === toAccId) return;

    onTransferBetweenAccounts(fromAccId, toAccId, amt);
    acousticEngine.playTransferHarmonium();
    setTransferAmount('');
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 2500);
  };

  const getTypeDetails = (accType: AccountType) => {
    if (accType === 'bank') {
      return {
        icon: <Landmark className="w-5 h-5 text-[#9E3B24]" />,
        label: t.typeBankAccount,
        bg: 'bg-[#FCEEE9] border-[#E8B4A6]',
      };
    }
    if (accType === 'savings') {
      return {
        icon: <PiggyBank className="w-5 h-5 text-[#2D6A4F]" />,
        label: t.typeSavingsGoal,
        bg: 'bg-[#E8F5EE] border-[#A3D9B8]',
      };
    }
    return {
      icon: <Wallet className="w-5 h-5 text-[#D9822B]" />,
        label: t.typeCashWallet,
        bg: 'bg-[#FFF5E6] border-[#F0CFA0]',
    };
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Module Header */}
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5">
        <h2 className="font-heading text-xl sm:text-2xl text-[#241916]">{t.vaultModuleTitle}</h2>
        <p className="text-xs sm:text-sm text-[#5C4742] mt-1">{t.vaultModuleDesc}</p>
      </div>

      {/* Module 3.2: Add Account Form + Savings Goal Target */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5 shadow-sm">
        <h3 className="font-heading text-lg text-[#9E3B24] mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>{t.addAccountTitle}</span>
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.accountNameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.accountNamePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.accountTypeLabel}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            >
              <option value="bank">{t.typeBankAccount}</option>
              <option value="savings">{t.typeSavingsGoal}</option>
              <option value="cash">{t.typeCashWallet}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.openingBalanceLabel}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder={t.openingBalancePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {lang === 'mr'
                ? 'बचत ध्येय रक्कम (Target Goal ₹ - ऐच्छिक)'
                : 'Savings Target Goal (₹ Optional)'}
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2">
            {justSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F]">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'mr'
                  ? 'नवीन खाते स्थानिक तिजोरीत जोडले गेले!'
                  : 'Account saved to local vault!'}
              </span>
            ) : (
              <span className="text-xs text-[#8A726B]">SQLite/Local Table: accounts</span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-sm shadow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t.saveAccountBtn}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Vault-to-Vault Self-Transfer Section (with Harmonium Sound) */}
      {accounts.length >= 2 && (
        <section className="bg-[#F4EBE6] border-2 border-[#2D6A4F]/30 rounded-3xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="font-heading text-lg text-[#2D6A4F] flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              <span>
                {lang === 'mr'
                  ? 'तिजोरी अंतर्गत हस्तांतरण (Self Transfer — 🎹 संवादिनी / हार्मोनियम सूर)'
                  : lang === 'hi'
                  ? 'तिजोरी के बीच राशि हस्तांतरण (Self Transfer — 🎹 हारमोनियम स्वर)'
                  : 'Vault-to-Vault Self Transfer (🎹 Harmonium Reed Chord)'}
              </span>
            </h3>

            <button
              type="button"
              onClick={() => acousticEngine.playTransferHarmonium()}
              className="px-3 py-1 rounded-xl bg-[#FBF8F5] hover:bg-[#EADCD3] border border-[#2D6A4F]/35 text-xs font-semibold text-[#2D6A4F] self-start"
            >
              🎹 {lang === 'mr' ? 'हार्मोनियम सूर ऐका ♪' : 'Preview Harmonium ♪'}
            </button>
          </div>

          <form onSubmit={handleSelfTransfer} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#5C4742] mb-1">
                {lang === 'mr' ? 'कोणत्या खात्यातून (From Vault)' : 'From Vault'}
              </label>
              <select
                value={fromAccId}
                onChange={(e) => setFromAccId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-xs sm:text-sm font-medium text-[#241916]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nameLocalized?.[lang] || a.name} ({formatINR(a.currentBalance, lang, useDevanagariNumerals)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4742] mb-1">
                {lang === 'mr' ? 'कोणत्या खात्यात (To Vault)' : 'To Vault'}
              </label>
              <select
                value={toAccId}
                onChange={(e) => setToAccId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-xs sm:text-sm font-medium text-[#241916]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nameLocalized?.[lang] || a.name} ({formatINR(a.currentBalance, lang, useDevanagariNumerals)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4742] mb-1">
                {lang === 'mr' ? 'हस्तांतरण रक्कम (₹)' : 'Transfer Amount (₹)'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-sm text-[#241916]"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={fromAccId === toAccId}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#23533D] disabled:opacity-40 text-[#FBF8F5] font-semibold text-xs sm:text-sm shadow flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{lang === 'mr' ? 'रक्कम वर्ग करा' : 'Transfer Now'}</span>
              </button>
            </div>
          </form>

          {transferSuccess && (
            <div className="mt-2.5 text-xs font-semibold text-[#2D6A4F] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {lang === 'mr'
                  ? 'रक्कम एका तिजोरीतून दुसऱ्या तिजोरीत यशस्वीरित्या वर्ग झाली!'
                  : 'Funds transferred between local vaults!'}
              </span>
            </div>
          )}
        </section>
      )}

      <WarliBorderDivider color="#9E3B24" />

      {/* Module 3.1: Vault Overview with Savings Goal Target Progress Bars */}
      <section className="space-y-3.5">
        {accounts.map((acc) => {
          const meta = getTypeDetails(acc.type);
          const displayName = acc.nameLocalized?.[lang] || acc.name;
          const netDelta = acc.currentBalance - acc.openingBalance;
          const hasTarget = typeof acc.targetAmount === 'number' && acc.targetAmount > 0;
          const goalPct = hasTarget
            ? Math.min(100, Math.max(0, Math.round((acc.currentBalance / acc.targetAmount!) * 100)))
            : 0;
          const isEditingTarget = editingTargetAccId === acc.id;

          return (
            <div
              key={acc.id}
              className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-[#9E3B24]/45 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${meta.bg}`}
                  >
                    {meta.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-base sm:text-lg text-[#241916]">
                        {displayName}
                      </h4>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FBF8F5] text-[#5C4742] border border-[#9E3B24]/15">
                        {meta.label}
                      </span>
                    </div>

                    <div className="text-xs text-[#5C4742] mt-1 flex items-center gap-3 flex-wrap">
                      <span>
                        {t.openingBalanceTag}:{' '}
                        <strong className="font-mono">
                          {formatINR(acc.openingBalance, lang, useDevanagariNumerals)}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Net Jamakharch:{' '}
                        <strong
                          className={`font-mono ${
                            netDelta >= 0 ? 'text-[#2D6A4F]' : 'text-[#9E3B24]'
                          }`}
                        >
                          {netDelta >= 0 ? '+' : '-'}
                          {formatINR(Math.abs(netDelta), lang, useDevanagariNumerals)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#9E3B24]/15">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-[#5C4742] uppercase tracking-wider">
                      {t.currentBalanceTag}
                    </div>
                    <div className="font-mono text-xl sm:text-2xl font-bold text-[#241916]">
                      {formatINR(acc.currentBalance, lang, useDevanagariNumerals)}
                    </div>
                  </div>

                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteAccount(acc.id)}
                      className="p-2 rounded-xl bg-[#FBF8F5] hover:bg-[#FCEEE9] text-[#9E3B24] border border-[#9E3B24]/20 transition"
                      title="Remove local vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Savings Goal Progress Bar Row */}
              <div className="pt-2.5 border-t border-[#9E3B24]/15">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#2D6A4F]">
                    <Target className="w-3.5 h-3.5" />
                    <span>
                      {hasTarget
                        ? lang === 'mr'
                          ? `बचत ध्येय प्रगती (${goalPct}% पूर्ण)`
                          : `Savings Goal Progress (${goalPct}% Achieved)`
                        : lang === 'mr'
                        ? 'या खात्यासाठी बचत ध्येय सेट करा'
                        : 'Set a Savings Goal Target for this Vault'}
                    </span>
                  </span>

                  {isEditingTarget ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={draftTargetVal}
                        onChange={(e) => setDraftTargetVal(e.target.value)}
                        placeholder="Target ₹"
                        className="w-28 px-2 py-1 rounded-lg bg-[#FBF8F5] border border-[#9E3B24] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateAccountTarget(acc.id, Math.max(0, Number(draftTargetVal) || 0));
                          setEditingTargetAccId(null);
                        }}
                        className="p-1.5 rounded-lg bg-[#2D6A4F] text-[#FBF8F5]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {hasTarget && (
                        <span className="font-mono font-bold text-[#241916]">
                          {formatINR(acc.currentBalance, lang, useDevanagariNumerals)} /{' '}
                          {formatINR(acc.targetAmount!, lang, useDevanagariNumerals)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTargetAccId(acc.id);
                          setDraftTargetVal(String(acc.targetAmount || acc.currentBalance * 1.5));
                        }}
                        className="px-2 py-1 rounded-lg bg-[#FBF8F5] hover:bg-[#EADCD3] text-[#9E3B24] border border-[#9E3B24]/25 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{hasTarget ? 'Edit Goal' : '+ Set Goal'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {hasTarget && (
                  <div className="w-full h-2.5 rounded-full bg-[#FBF8F5] border border-[#2D6A4F]/25 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#40916C] transition-all duration-300"
                      style={{ width: `${goalPct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
