import React, { useRef, useState } from 'react';
import {
  Database,
  ShieldCheck,
  WifiOff,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import {
  Account,
  Category,
  CategoryBudgetMap,
  Language,
  LocalAuthRecord,
  Transaction,
} from '../types';
import { acousticEngine } from '../utils/acousticEngine';

interface OfflinePrivacyInspectorProps {
  lang: Language;
  authRecord: LocalAuthRecord | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: CategoryBudgetMap;
  onImportBackupData: (payload: {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    budgets?: CategoryBudgetMap;
  }) => void;
  onResetDemoData: () => void;
}

export const OfflinePrivacyInspector: React.FC<OfflinePrivacyInspectorProps> = ({
  lang,
  authRecord,
  accounts,
  categories,
  transactions,
  budgets,
  onImportBackupData,
  onResetDemoData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const handleExportLocalBackup = () => {
    const dump = {
      app: 'अर्थसंयम (Arthasanyam)',
      version: '1.2.0',
      privacyMandate: '100% Offline-First, Zero Internet Permissions',
      exportedAt: new Date().toISOString(),
      tables: {
        accounts,
        categories,
        transactions,
        budgets,
      },
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arthasanyam_local_vault_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = String(evt.target?.result || '');
        const parsed = JSON.parse(raw);
        const tables = parsed.tables || parsed;

        if (
          !Array.isArray(tables.accounts) ||
          !Array.isArray(tables.categories) ||
          !Array.isArray(tables.transactions)
        ) {
          throw new Error('Invalid schema');
        }

        onImportBackupData({
          accounts: tables.accounts,
          categories: tables.categories,
          transactions: tables.transactions,
          budgets: tables.budgets,
        });

        acousticEngine.playNotificationSwarmandal();
        setImportFeedback({
          type: 'success',
          msg:
            lang === 'mr'
              ? `तिजोरी यशस्वीरित्या रिस्टोअर झाली! (${tables.accounts.length} खाती, ${tables.transactions.length} नोंदी)`
              : `Local vault restored! (${tables.accounts.length} accounts, ${tables.transactions.length} entries)`,
        });
      } catch {
        setImportFeedback({
          type: 'error',
          msg:
            lang === 'mr'
              ? 'अवैध बॅकअप फाईल! कृपया अर्थसंयम JSON फाईल निवडा.'
              : 'Invalid backup file! Please select a valid Arthasanyam JSON export.',
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl text-[#241916]">
                {lang === 'mr'
                  ? '१००% ऑफलाईन गोपनीयता, बॅकअप आणि स्थानिक डेटाबेस'
                  : lang === 'hi'
                  ? '१००% ऑफ़लाइन गोपनीयता, बैकअप और स्थानीय डेटाबेस'
                  : '100% Offline Privacy, Backup Restore & Local DB Inspector'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C4742] mt-1">
                SRD Section 1 & 2 Verification: Zero Internet Permissions, Service Worker Offline
                Cache (`sw.js`), & Portable JSON Vault Backup/Restore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start">
            <button
              type="button"
              onClick={handleExportLocalBackup}
              className="px-3.5 py-2 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'JSON बॅकअप डाउनलोड' : 'Export JSON'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#23533D] text-[#FBF8F5] text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'JSON बॅकअप रिस्टोअर करा' : 'Import / Restore JSON'}</span>
            </button>

            <button
              type="button"
              onClick={onResetDemoData}
              className="px-3.5 py-2 rounded-xl bg-[#FBF8F5] hover:bg-[#EADCD3] text-[#9E3B24] border border-[#9E3B24]/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed Data</span>
            </button>
          </div>
        </div>

        {importFeedback && (
          <div
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              importFeedback.type === 'success'
                ? 'bg-[#E8F5EE] border-[#2D6A4F] text-[#2D6A4F]'
                : 'bg-[#FCEEE9] border-[#9E3B24] text-[#9E3B24]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importFeedback.msg}</span>
          </div>
        )}
      </div>

      {/* Zero-Internet Android Manifest + Offline Service Worker Proof */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2D6A4F] mb-2">
            <WifiOff className="w-4 h-4" />
            <span>AndroidManifest.xml & Offline Service Worker (sw.js)</span>
          </div>
          <pre className="bg-[#241916] text-[#FBF8F5] p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`<uses-permission
  android:name="android.permission.INTERNET"
  tools:node="remove" />
<!-- Offline Cache-First Service Worker: /sw.js -->`}
          </pre>
        </div>

        <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#9E3B24] mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Credential Encryption (Module 1.3)</span>
          </div>
          <div className="bg-[#FBF8F5] p-3 rounded-xl border border-[#9E3B24]/20 font-mono text-xs space-y-1 text-[#241916]">
            <div>
              <span className="text-[#8A726B]">User ID:</span> {authRecord?.userId || 'local_user'}
            </div>
            <div className="truncate">
              <span className="text-[#8A726B]">Salt (96-bit):</span> {authRecord?.saltHex || '—'}
            </div>
            <div className="truncate">
              <span className="text-[#8A726B]">SHA-256 Digest:</span> {authRecord?.hashHex || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Relational Tables Summary */}
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-base text-[#241916] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#9E3B24]" />
            <span>
              Local Storage Relational Tables ({accounts.length} Accounts • {categories.length}{' '}
              Unified Categories • {transactions.length} Ledger Rows)
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#9E3B24]/25 text-[#9E3B24]">
                <th className="py-2 px-2">tx_id</th>
                <th className="py-2 px-2">type</th>
                <th className="py-2 px-2">account_id</th>
                <th className="py-2 px-2">unified_category_id</th>
                <th className="py-2 px-2 text-right">amount_inr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#9E3B24]/10">
              {transactions.slice(0, 12).map((tx) => (
                <tr key={tx.id} className="hover:bg-[#FBF8F5]/60">
                  <td className="py-1.5 px-2 text-[#5C4742]">{tx.id}</td>
                  <td
                    className={`py-1.5 px-2 font-bold ${
                      tx.type === 'revenue' ? 'text-[#2D6A4F]' : 'text-[#9E3B24]'
                    }`}
                  >
                    {tx.type.toUpperCase()}
                  </td>
                  <td className="py-1.5 px-2">{tx.accountId}</td>
                  <td className="py-1.5 px-2 text-[#9E3B24]">{tx.categoryId}</td>
                  <td className="py-1.5 px-2 text-right font-bold">₹{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
