import React, { useState } from 'react';
import { Languages, Plus, Sparkles, Check, X, Tag, Hash } from 'lucide-react';
import { Category, CategoryKind, Language, LanguageDefinition, Transaction } from '../types';
import { formatINR, getCategoryLabel, TRANSLATIONS } from '../i18n/translations';
import { suggestMultiLanguageTerms } from '../utils/localDatabase';
import { WarliBorderDivider } from './WarliArt';

interface CategoryMappingModuleProps {
  lang: Language;
  availableLanguages: LanguageDefinition[];
  categories: Category[];
  transactions: Transaction[];
  useDevanagariNumerals: boolean;
  onAddCategory: (newCategory: Category) => void;
}

const ICON_OPTIONS = ['🏺', '🪔', '🌾', '📚', '🏥', '🎁', '🚜', '🪙', '🛕', '🎨', '🥛', '🧵'];

export const CategoryMappingModule: React.FC<CategoryMappingModuleProps> = ({
  lang,
  availableLanguages,
  categories,
  transactions,
  useDevanagariNumerals,
  onAddCategory,
}) => {
  const t = TRANSLATIONS[lang];
  const currentLangDef =
    availableLanguages.find((l) => l.code === lang) || availableLanguages[0];

  const [inputLabel, setInputLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏺');
  const [selectedKind, setSelectedKind] = useState<CategoryKind>('expense');

  // Module 4.3: Multi-Language Mapping Modal State
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [pendingBackendId, setPendingBackendId] = useState('');
  const [mappedLabels, setMappedLabels] = useState<Record<string, string>>({});

  const handleStartMapping = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputLabel.trim();
    if (!trimmed) return;

    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const generatedId = `cat_custom_${slug || Date.now().toString().slice(-5)}`;
    setPendingBackendId(generatedId);

    const suggestions = suggestMultiLanguageTerms(trimmed, lang, availableLanguages);
    setMappedLabels(suggestions);

    setIsMappingModalOpen(true);
  };

  const handleConfirmUnifiedCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLabels: Record<string, string> = {};
    availableLanguages.forEach((l) => {
      finalLabels[l.code] = (mappedLabels[l.code] || inputLabel).trim();
    });

    const finalCat: Category = {
      id: pendingBackendId,
      icon: selectedIcon,
      kind: selectedKind,
      isCustom: true,
      labels: finalLabels,
    };

    onAddCategory(finalCat);
    setIsMappingModalOpen(false);
    setInputLabel('');
  };

  const otherLanguages = availableLanguages.filter((l) => l.code !== lang);

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] shrink-0">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl sm:text-2xl text-[#241916]">
              {t.categoryModuleTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4742] mt-1 leading-relaxed">
              {t.categoryModuleDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Module 4.2: Custom Category Creation Form */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5 shadow-sm">
        <h3 className="font-heading text-lg text-[#9E3B24] mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>{t.addCustomCategoryTitle}</span>
        </h3>

        <form onSubmit={handleStartMapping} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
                {t.customCategoryInputLabel} ({currentLangDef.nativeLabel})
              </label>
              <input
                type="text"
                required
                value={inputLabel}
                onChange={(e) => setInputLabel(e.target.value)}
                placeholder={t.customCategoryPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
                {t.categoryKindLabel}
              </label>
              <select
                value={selectedKind}
                onChange={(e) => setSelectedKind(e.target.value as CategoryKind)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-sm text-[#241916] focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
              >
                <option value="expense">{t.kindExpense}</option>
                <option value="revenue">{t.kindRevenue}</option>
                <option value="both">{t.kindBoth}</option>
              </select>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <span className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              Icon / चिन्ह निवडा:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {ICON_OPTIONS.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => setSelectedIcon(ico)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition ${
                    selectedIcon === ico
                      ? 'bg-[#9E3B24] text-[#FBF8F5] border-[#9E3B24] scale-105 shadow-sm'
                      : 'bg-[#FBF8F5] border-[#9E3B24]/20 hover:bg-[#EADCD3]'
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-sm shadow transition flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              <span>{t.createCategoryBtn}</span>
            </button>
          </div>
        </form>
      </section>

      <WarliBorderDivider color="#9E3B24" />

      {/* Module 4.1 & 4.4: Pre-existing & Custom Categories with Unified Backend ID Proof */}
      <section className="space-y-3">
        <h3 className="font-heading text-lg text-[#241916] px-1">{t.preExistingCategoriesTitle}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categories.map((cat) => {
            const catTxs = transactions.filter((tx) => tx.categoryId === cat.id);
            const totalAggregated = catTxs.reduce((sum, tx) => sum + tx.amount, 0);

            return (
              <div
                key={cat.id}
                className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-[#9E3B24]/45 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/25 flex items-center justify-center text-xl shrink-0">
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="font-heading text-base text-[#241916]">
                        {getCategoryLabel(cat, lang)}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#FBF8F5] text-[#9E3B24] border border-[#9E3B24]/25">
                          <Hash className="w-2.5 h-2.5" />
                          {cat.id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            cat.isCustom
                              ? 'bg-[#FFF5E6] text-[#D9822B] border border-[#F0CFA0]'
                              : 'bg-[#E8F5EE] text-[#2D6A4F] border border-[#A3D9B8]'
                          }`}
                        >
                          {cat.isCustom ? t.customTag : t.defaultTag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-[#5C4742] uppercase">Total Aggregated</div>
                    <div className="font-mono text-sm font-bold text-[#241916]">
                      {formatINR(totalAggregated, lang, useDevanagariNumerals)}
                    </div>
                    <div className="text-[10px] text-[#8A726B]">{catTxs.length} entries</div>
                  </div>
                </div>

                {/* All Active Language Mappings Display */}
                <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-[#9E3B24]/15 text-xs">
                  {availableLanguages.map((l) => {
                    const labelVal = cat.labels[l.code] || cat.labels.mr || cat.labels.en;
                    return (
                      <div
                        key={l.code}
                        className={`p-2 rounded-xl border ${
                          lang === l.code
                            ? 'bg-[#9E3B24]/10 border-[#9E3B24]/40 text-[#241916] font-semibold'
                            : 'bg-[#FBF8F5]/80 border-[#9E3B24]/10 text-[#5C4742]'
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wider text-[#9E3B24] font-bold truncate">
                          {l.nativeLabel}
                        </div>
                        <div className="truncate mt-0.5" title={labelVal}>
                          {labelVal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Module 4.3: Multi-Language Mapping Modal */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#241916]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FBF8F5] border-2 border-[#9E3B24] rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] flex items-center justify-center text-xl">
                  {selectedIcon}
                </div>
                <div>
                  <h3 className="font-heading text-xl text-[#241916]">{t.mappingModalTitle}</h3>
                  <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#9E3B24] bg-[#F4EBE6] px-2 py-0.5 rounded mt-0.5">
                    <Tag className="w-3 h-3" />
                    {t.unifiedIdBadge}: <strong>{pendingBackendId}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMappingModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#F4EBE6] text-[#5C4742] hover:text-[#241916]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#5C4742] mb-4 leading-relaxed">
              {t.mappingModalDesc}
            </p>

            <form onSubmit={handleConfirmUnifiedCategory} className="space-y-3.5">
              {/* Primary Active Language */}
              <div className="p-3 rounded-2xl bg-[#F4EBE6] border border-[#9E3B24]/30">
                <label className="block text-xs font-bold text-[#9E3B24] mb-1">
                  1. {currentLangDef.nativeLabel} (Active UI Language)
                </label>
                <input
                  type="text"
                  required
                  value={mappedLabels[lang] || ''}
                  onChange={(e) =>
                    setMappedLabels((prev) => ({ ...prev, [lang]: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/25 text-sm font-semibold text-[#241916]"
                />
              </div>

              {/* Other Active Languages Prompted per SRD 4.3 */}
              {otherLanguages.map((otherLang, idx) => (
                <div
                  key={otherLang.code}
                  className="p-3 rounded-2xl bg-[#F4EBE6]/70 border border-[#9E3B24]/20"
                >
                  <label className="block text-xs font-bold text-[#241916] mb-1">
                    {idx + 2}. {otherLang.nativeLabel} Equivalent Term
                  </label>
                  <input
                    type="text"
                    required
                    value={mappedLabels[otherLang.code] || ''}
                    onChange={(e) =>
                      setMappedLabels((prev) => ({
                        ...prev,
                        [otherLang.code]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/25 text-sm text-[#241916]"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t border-[#9E3B24]/15 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fresh = suggestMultiLanguageTerms(
                      mappedLabels[lang] || inputLabel,
                      lang,
                      availableLanguages
                    );
                    setMappedLabels(fresh);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#F4EBE6] hover:bg-[#EADCD3] text-[#9E3B24] text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.autoSuggestBtn}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMappingModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#F4EBE6] text-[#5C4742] text-xs font-semibold"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.confirmMappingBtn}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
