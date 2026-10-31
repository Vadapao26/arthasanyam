import React, { useState } from 'react';
import {
  BellRing,
  Sun,
  Moon,
  BrainCircuit,
  Cpu,
  Volume2,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  Category,
  HabitTriggerConfig,
  Language,
  SimulatedNotification,
  Transaction,
} from '../types';
import { formatINR, TRANSLATIONS } from '../i18n/translations';
import { acousticEngine } from '../utils/acousticEngine';
import { WarliBorderDivider, WarliEmblem16 } from './WarliArt';

interface HabitTriggersModuleProps {
  lang: Language;
  habits: HabitTriggerConfig;
  transactions: Transaction[];
  categories: Category[];
  useDevanagariNumerals: boolean;
  onUpdateHabits: (next: HabitTriggerConfig) => void;
  onTriggerTestCue: (type: 'revenue' | 'expense') => void;
}

const SAMPLE_NOTIFICATIONS: Record<
  Language,
  Array<{ triggerType: 'morning' | 'evening' | 'pattern'; title: string; body: string; timeLabel: string }>
> = {
  mr: [
    {
      triggerType: 'morning',
      title: '🌅 शुभ प्रभात! आजचा अर्थ-संकल्प (9:00 AM)',
      body: 'घराबाहेर पडण्यापूर्वी आजच्या अनावश्यक खर्चावर संयम ठेवण्याचा संकल्प करा. थेंबे थेंबे तळे साचे!',
      timeLabel: 'सकाळी ९:००',
    },
    {
      triggerType: 'evening',
      title: '🪔 संध्याकाळचा जमाखर्च आढावा (9:00 PM)',
      body: 'आज दिवसभरातील चहा-पाणी, भाजीपाला किंवा प्रवासाचा खर्च नोंदवला का? २ मिनिटांत तिजोरी अद्ययावत करा.',
      timeLabel: 'रात्री ९:००',
    },
    {
      triggerType: 'pattern',
      title: '🧠 स्थानिक सवय विश्लेषण (On-Device Insight)',
      body: 'आठवड्यात दुपारी ४ ते ६ दरम्यान चहा-पाणी खर्चाची वारंवारता वाढली आहे. मासिक बचत ध्येय राखण्यासाठी लक्ष द्या.',
      timeLabel: 'आत्ताच (स्थानिक वर्कर)',
    },
  ],
  hi: [
    {
      triggerType: 'morning',
      title: '🌅 शुभ प्रभात! आज का अर्थ-संकल्प (9:00 AM)',
      body: 'दिन की शुरुआत से पहले आज के अनावश्यक खर्चों पर संयम रखने का संकल्प लें। बूंद-बूंद से घट भरे!',
      timeLabel: 'सुबह ९:००',
    },
    {
      triggerType: 'evening',
      title: '🪔 शाम की जमाखर्च समीक्षा (9:00 PM)',
      body: 'क्या आपने आज के चाय-पानी, राशन या यात्रा के खर्च दर्ज किए? अपनी स्थानीय तिजोरी अपडेट करें।',
      timeLabel: 'रात ९:००',
    },
    {
      triggerType: 'pattern',
      title: '🧠 स्थानीय पैटर्न लर्निंग (On-Device Insight)',
      body: 'आपके स्थानीय बहीखाते के अनुसार इस सप्ताह दैनिक नकद खर्च में १५% वृद्धि हुई है।',
      timeLabel: 'अभी-अभी (स्थानीय वर्कर)',
    },
  ],
  en: [
    {
      triggerType: 'morning',
      title: '🌅 Morning Intention Nudge (9:00 AM)',
      body: 'Set your mindful Jamakharch intention before stepping out today. Small savings build a resilient Tijori!',
      timeLabel: '9:00 AM Local',
    },
    {
      triggerType: 'evening',
      title: '🪔 Evening Jamakharch Reflection (9:00 PM)',
      body: 'Take 60 seconds to log today’s Tea/Coffee, Commute, or Cash Wallet expenses before resting.',
      timeLabel: '9:00 PM Local',
    },
    {
      triggerType: 'pattern',
      title: '🧠 On-Device Pattern Learning Alert',
      body: 'Local ledger analysis detected recurring small cash outflows. Redirecting ₹50/day adds ₹1,500/month to your FD vault.',
      timeLabel: 'Just now (On-Device)',
    },
  ],
};

export const HabitTriggersModule: React.FC<HabitTriggersModuleProps> = ({
  lang,
  habits,
  transactions,
  categories,
  useDevanagariNumerals,
  onUpdateHabits,
  onTriggerTestCue,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeBanner, setActiveBanner] = useState<SimulatedNotification | null>(null);
  const [simIndexByLang, setSimIndexByLang] = useState<Record<Language, number>>({
    mr: 0,
    hi: 0,
    en: 0,
  });

  const handleToggle = (key: keyof HabitTriggerConfig) => {
    onUpdateHabits({
      ...habits,
      [key]: !habits[key],
    });
  };

  const triggerSimulatedPush = (targetLang: Language) => {
    const list = SAMPLE_NOTIFICATIONS[targetLang];
    const idx = simIndexByLang[targetLang] % list.length;
    const item = list[idx];

    setSimIndexByLang((prev) => ({
      ...prev,
      [targetLang]: (idx + 1) % list.length,
    }));

    acousticEngine.playNotificationSwarmandal();

    setActiveBanner({
      id: `sim_${Date.now()}`,
      lang: targetLang,
      triggerType: item.triggerType,
      title: item.title,
      body: item.body,
      timeLabel: item.timeLabel,
    });
  };

  // Compute real on-device pattern insight from actual local transactions
  const expenseTxs = transactions.filter((tx) => tx.type === 'expense');
  const categoryTotals: Record<string, { count: number; sum: number }> = {};
  expenseTxs.forEach((tx) => {
    if (!categoryTotals[tx.categoryId]) {
      categoryTotals[tx.categoryId] = { count: 0, sum: 0 };
    }
    categoryTotals[tx.categoryId].count += 1;
    categoryTotals[tx.categoryId].sum += tx.amount;
  });

  const topExpenseEntry = Object.entries(categoryTotals).sort(
    (a, b) => b[1].sum - a[1].sum
  )[0];

  const topCategoryObj = topExpenseEntry
    ? categories.find((c) => c.id === topExpenseEntry[0])
    : undefined;

  return (
    <div className="space-y-6 pb-28">
      {/* Live Simulated Android Push Notification Banner (Top Overlay + Inline Preview) */}
      {activeBanner && (
        <div className="bg-[#241916] text-[#FBF8F5] border-2 border-[#9E3B24] rounded-3xl p-4 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] shrink-0 mt-0.5">
                <WarliEmblem16 size={32} color="#FBF8F5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#9E3B24] text-[#FBF8F5]">
                    अर्थसंयम • {activeBanner.lang.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-[#F4EBE6]/75 font-mono">
                    {activeBanner.timeLabel}
                  </span>
                </div>
                <h4 className="font-heading text-base text-[#FBF8F5] mt-1">{activeBanner.title}</h4>
                <p className="text-xs sm:text-sm text-[#F4EBE6]/90 mt-0.5 leading-relaxed">
                  {activeBanner.body}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveBanner(null)}
              className="p-1.5 rounded-xl bg-[#FBF8F5]/10 hover:bg-[#FBF8F5]/20 text-[#FBF8F5]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Module 6.1: Local Worker Engine Header */}
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl text-[#241916]">
              {t.habitModuleTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4742] mt-1">{t.habitModuleDesc}</p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#E8F5EE] border border-[#A3D9B8] text-[#2D6A4F] text-xs font-semibold shrink-0 self-start">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>{t.workerStatusActive}</span>
          </div>
        </div>
      </div>

      {/* Module 6.2: Trigger Toggles */}
      <section className="space-y-3">
        {/* 1. Morning Intention Nudge (9:00 AM) */}
        <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#FFF5E6] border border-[#F0CFA0] text-[#D9822B] shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg text-[#241916]">
                {t.triggerMorningTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4742] mt-0.5">{t.triggerMorningDesc}</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={habits.morningIntention}
            onClick={() => handleToggle('morningIntention')}
            className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 ${
              habits.morningIntention ? 'bg-[#2D6A4F]' : 'bg-[#8A726B]/40'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-[#FBF8F5] shadow transition-transform ${
                habits.morningIntention ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Evening Jamakharch Reflection (9:00 PM) */}
        <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#FCEEE9] border border-[#E8B4A6] text-[#9E3B24] shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg text-[#241916]">
                {t.triggerEveningTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4742] mt-0.5">{t.triggerEveningDesc}</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={habits.eveningReflection}
            onClick={() => handleToggle('eveningReflection')}
            className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 ${
              habits.eveningReflection ? 'bg-[#2D6A4F]' : 'bg-[#8A726B]/40'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-[#FBF8F5] shadow transition-transform ${
                habits.eveningReflection ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. On-Device Pattern Learning */}
        <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#E8F5EE] border border-[#A3D9B8] text-[#2D6A4F] shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base sm:text-lg text-[#241916]">
                  {t.triggerPatternTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C4742] mt-0.5">{t.triggerPatternDesc}</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={habits.patternLearning}
              onClick={() => handleToggle('patternLearning')}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 ${
                habits.patternLearning ? 'bg-[#2D6A4F]' : 'bg-[#8A726B]/40'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-[#FBF8F5] shadow transition-transform ${
                  habits.patternLearning ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Live On-Device Pattern Insight computed from local ledger */}
          {habits.patternLearning && topCategoryObj && topExpenseEntry && (
            <div className="p-3.5 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/20 text-xs text-[#241916] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#9E3B24] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#9E3B24]">{t.patternInsightBoxTitle}: </span>
                {lang === 'mr' ? (
                  <span>
                    तुमच्या स्थानिक नोंदींनुसार सर्वाधिक खर्च{' '}
                    <strong>{topCategoryObj.labels.mr}</strong> (
                    {formatINR(topExpenseEntry[1].sum, lang, useDevanagariNumerals)},{' '}
                    {topExpenseEntry[1].count} वेळा) या वर्गवारीत झाला आहे.
                  </span>
                ) : lang === 'hi' ? (
                  <span>
                    आपके स्थानीय बहीखाते के अनुसार सर्वाधिक खर्च{' '}
                    <strong>{topCategoryObj.labels.hi}</strong> (
                    {formatINR(topExpenseEntry[1].sum, lang, useDevanagariNumerals)},{' '}
                    {topExpenseEntry[1].count} बार) श्रेणी में हुआ है।
                  </span>
                ) : (
                  <span>
                    On-device scan shows your highest outflow category is{' '}
                    <strong>{topCategoryObj.labels.en}</strong> (
                    {formatINR(topExpenseEntry[1].sum, lang, useDevanagariNumerals)} across{' '}
                    {topExpenseEntry[1].count} local entries).
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <WarliBorderDivider color="#9E3B24" />

      {/* Module 6.3: Live Notification Simulator */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <BellRing className="w-5 h-5 text-[#9E3B24]" />
          <h3 className="font-heading text-lg sm:text-xl text-[#241916]">{t.liveSimTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm text-[#5C4742] mb-4">{t.liveSimDesc}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => triggerSimulatedPush('mr')}
            className="py-3 px-4 rounded-2xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-xs sm:text-sm shadow transition flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>{t.simMarathiBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSimulatedPush('hi')}
            className="py-3 px-4 rounded-2xl bg-[#241916] hover:bg-[#3A2924] text-[#FBF8F5] font-semibold text-xs sm:text-sm shadow transition flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>{t.simHindiBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSimulatedPush('en')}
            className="py-3 px-4 rounded-2xl bg-[#FBF8F5] hover:bg-[#EADCD3] text-[#9E3B24] border-2 border-[#9E3B24] font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>{t.simEnglishBtn}</span>
          </button>
        </div>

        {/* Module 5.3 Acoustic Cue Simulator Section */}
        <div className="mt-5 pt-4 border-t border-[#9E3B24]/15">
          <h4 className="font-heading text-base text-[#241916] mb-2.5 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#9E3B24]" />
            <span>{t.acousticPreviewSection} (Module 5.3)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onTriggerTestCue('revenue')}
              className="py-2.5 px-4 rounded-xl bg-[#E8F5EE] hover:bg-[#D5EDE0] border border-[#2D6A4F]/40 text-[#2D6A4F] font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🥁 {t.testTaalPakhawaj}</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerTestCue('expense')}
              className="py-2.5 px-4 rounded-xl bg-[#FCEEE9] hover:bg-[#F7DDD4] border border-[#9E3B24]/40 text-[#9E3B24] font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>🎍 {t.testGhungrooBamboo}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
