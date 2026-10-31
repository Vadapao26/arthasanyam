import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Fingerprint,
  ScanFace,
  Grid,
  Globe,
  Plus,
  CheckCircle2,
  Music,
  Volume2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  ExpenseInstrumentStyle,
  Language,
  LanguageDefinition,
  LocalAuthRecord,
  LocalSecuritySettings,
  LockMethod,
  RevenueInstrumentStyle,
} from '../types';
import {
  PRESET_ADDITIONAL_LANGUAGES,
  TRANSLATIONS,
} from '../i18n/translations';
import { hashCredentialsLocally } from '../utils/localDatabase';
import { acousticEngine } from '../utils/acousticEngine';
import { WarliBorderDivider } from './WarliArt';

interface SettingsModuleProps {
  lang: Language;
  availableLanguages: LanguageDefinition[];
  authRecord: LocalAuthRecord | null;
  securitySettings: LocalSecuritySettings;
  onChangeLang: (lang: Language) => void;
  onUpdateAvailableLanguages: (langs: LanguageDefinition[]) => void;
  onUpdateAuthRecord: (record: LocalAuthRecord) => void;
  onUpdateSecuritySettings: (next: LocalSecuritySettings) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  lang,
  availableLanguages,
  authRecord,
  securitySettings,
  onChangeLang,
  onUpdateAvailableLanguages,
  onUpdateAuthRecord,
  onUpdateSecuritySettings,
}) => {
  const t = TRANSLATIONS[lang];

  // 1. Passcode Change State
  const [newUserId, setNewUserId] = useState(authRecord?.userId || 'siddharth_01');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeStatus, setPasscodeStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  // 2. Pattern Lock Editor State
  const [draftPattern, setDraftPattern] = useState<number[]>(securitySettings.patternSequence);
  const [patternSavedBanner, setPatternSavedBanner] = useState(false);

  // 3. Add Custom Language State
  const [customLangName, setCustomLangName] = useState('');
  const [customLangCode, setCustomLangCode] = useState('');
  const [customLangDevanagari, setCustomLangDevanagari] = useState(true);

  const handleSavePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeStatus(null);

    if (newPasscode.trim().length < 4) {
      setPasscodeStatus({
        type: 'error',
        msg:
          lang === 'mr'
            ? 'नवीन पासकोड किमान ४ अंकी किंवा अक्षरी असावा.'
            : 'New passcode must be at least 4 characters.',
      });
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasscodeStatus({
        type: 'error',
        msg:
          lang === 'mr'
            ? 'दोन्ही पासकोड जुळत नाहीत!'
            : 'New passcode and confirmation do not match!',
      });
      return;
    }

    const updatedRecord = await hashCredentialsLocally(newUserId.trim(), newPasscode);
    onUpdateAuthRecord(updatedRecord);
    setNewPasscode('');
    setConfirmPasscode('');
    acousticEngine.playNotificationSwarmandal();
    setPasscodeStatus({
      type: 'success',
      msg:
        lang === 'mr'
          ? 'नवीन पासकोड स्थानिक डिव्हाइसवर यशस्वीरित्या एनक्रिप्ट करून जतन झाला!'
          : 'New local passcode encrypted and saved on-device!',
    });
  };

  const handleTogglePatternDot = (idx: number) => {
    if (draftPattern.includes(idx)) return;
    setDraftPattern((prev) => [...prev, idx]);
  };

  const handleSaveNewPattern = () => {
    if (draftPattern.length < 3) return;
    onUpdateSecuritySettings({
      ...securitySettings,
      patternSequence: draftPattern,
      patternEnabled: true,
    });
    acousticEngine.playNotificationSwarmandal();
    setPatternSavedBanner(true);
    setTimeout(() => setPatternSavedBanner(false), 2500);
  };

  const handleAddPresetLanguage = (preset: LanguageDefinition) => {
    if (availableLanguages.some((l) => l.code === preset.code)) {
      onChangeLang(preset.code);
      return;
    }
    const updated = [...availableLanguages, preset];
    onUpdateAvailableLanguages(updated);
    onChangeLang(preset.code);
    acousticEngine.playNotificationSwarmandal();
  };

  const handleAddCustomLanguageForm = (e: React.FormEvent) => {
    e.preventDefault();
    const label = customLangName.trim();
    if (!label) return;
    const code =
      customLangCode
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') || `lang_${Date.now().toString().slice(-3)}`;

    if (availableLanguages.some((l) => l.code === code)) {
      onChangeLang(code);
      return;
    }

    const newLang: LanguageDefinition = {
      code,
      nativeLabel: label,
      shortLabel: label.slice(0, 8),
      locale: `${code}-IN`,
      isCustom: true,
      useDevanagariDigits: customLangDevanagari,
    };

    const updated = [...availableLanguages, newLang];
    onUpdateAvailableLanguages(updated);
    onChangeLang(code);
    setCustomLangName('');
    setCustomLangCode('');
    acousticEngine.playNotificationSwarmandal();
  };

  const handleRemoveCustomLanguage = (codeToRemove: string) => {
    const updated = availableLanguages.filter((l) => l.code !== codeToRemove);
    onUpdateAvailableLanguages(updated);
    if (lang === codeToRemove) {
      onChangeLang('mr');
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl sm:text-2xl text-[#241916]">{t.settingsTitle}</h2>
            <p className="text-xs sm:text-sm text-[#5C4742] mt-1 leading-relaxed">
              {t.settingsSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Change Local Passcode & User ID */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5 shadow-sm">
        <h3 className="font-heading text-lg text-[#9E3B24] mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          <span>{t.changePasscodeTitle}</span>
        </h3>

        <form onSubmit={handleSavePasscode} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.userIdLabel}
            </label>
            <input
              type="text"
              required
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-sm text-[#241916]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.newPasscodeLabel}
            </label>
            <input
              type="password"
              required
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-sm text-[#241916]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1.5">
              {t.confirmPasscodeLabel}
            </label>
            <input
              type="password"
              required
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-sm text-[#241916]"
            />
          </div>

          <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {passcodeStatus ? (
              <span
                className={`text-xs font-semibold flex items-center gap-1.5 ${
                  passcodeStatus.type === 'success' ? 'text-[#2D6A4F]' : 'text-[#9E3B24]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {passcodeStatus.msg}
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#8A726B] truncate">
                Active Hash: {authRecord?.cipherPreview || 'Local PBKDF2/SHA-256'}
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-xs sm:text-sm shadow transition self-start sm:self-auto"
            >
              {t.savePasscodeBtn}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: Lock Screen Biometrics (Face ID / Fingerprint) & Pattern Lock */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5 shadow-sm space-y-5">
        <h3 className="font-heading text-lg text-[#9E3B24] flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          <span>{t.biometricPatternTitle}</span>
        </h3>

        {/* Default Lock Screen Method Picker */}
        <div>
          <label className="block text-xs font-bold text-[#241916] mb-2">
            {lang === 'mr'
              ? 'लॉक स्क्रीनवरील डिफॉल्ट अनलॉक पद्धत निवडा (Default Lock Screen Method):'
              : 'Default Lock Screen Unlock Method:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(
              [
                { id: 'passcode', label: t.authTabPasscode, icon: <KeyRound className="w-4 h-4" /> },
                { id: 'pattern', label: t.authTabPattern, icon: <Grid className="w-4 h-4" /> },
                {
                  id: 'fingerprint',
                  label: t.authTabFingerprint,
                  icon: <Fingerprint className="w-4 h-4" />,
                },
                { id: 'faceid', label: t.authTabFaceId, icon: <ScanFace className="w-4 h-4" /> },
              ] as Array<{ id: LockMethod; label: string; icon: React.ReactNode }>
            ).map((m) => {
              const active = securitySettings.preferredLockMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    onUpdateSecuritySettings({ ...securitySettings, preferredLockMethod: m.id })
                  }
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition ${
                    active
                      ? 'bg-[#9E3B24] text-[#FBF8F5] border-[#7A2B18] shadow'
                      : 'bg-[#FBF8F5] text-[#241916] border-[#9E3B24]/20 hover:border-[#9E3B24]'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pattern Lock Designer & Biometric Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#9E3B24]/15">
          {/* Interactive 3x3 Pattern Lock Recorder */}
          <div className="p-4 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading text-base text-[#241916] flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-[#9E3B24]" />
                {lang === 'mr' ? 'पॅटर्न लॉक सेट करा (3x3 Grid)' : 'Set Pattern Lock Sequence'}
              </span>
              <span className="font-mono text-xs text-[#9E3B24] font-bold">
                {draftPattern.map((n) => n + 1).join(' → ') || 'None'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-[180px] mx-auto p-3 rounded-2xl bg-[#F4EBE6] border border-[#9E3B24]/20">
              {Array.from({ length: 9 }).map((_, idx) => {
                const pos = draftPattern.indexOf(idx);
                const selected = pos !== -1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTogglePatternDot(idx)}
                    className={`w-11 h-11 rounded-xl font-mono text-xs font-bold border transition ${
                      selected
                        ? 'bg-[#9E3B24] text-[#FBF8F5] border-[#7A2B18]'
                        : 'bg-[#FBF8F5] text-[#5C4742] border-[#9E3B24]/25'
                    }`}
                  >
                    {selected ? `#${pos + 1}` : idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDraftPattern([])}
                className="px-3 py-1.5 rounded-xl bg-[#F4EBE6] text-xs font-semibold text-[#5C4742] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              {patternSavedBanner && (
                <span className="text-xs font-bold text-[#2D6A4F]">✓ Pattern Saved!</span>
              )}

              <button
                type="button"
                disabled={draftPattern.length < 3}
                onClick={handleSaveNewPattern}
                className="px-4 py-1.5 rounded-xl bg-[#9E3B24] disabled:opacity-40 text-[#FBF8F5] text-xs font-semibold"
              >
                {lang === 'mr' ? 'पॅटर्न जतन करा' : 'Save Pattern'}
              </button>
            </div>
          </div>

          {/* Biometric Face ID & Fingerprint Switches */}
          <div className="p-4 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/25 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-5 h-5 text-[#9E3B24]" />
                  <div>
                    <div className="text-xs font-bold text-[#241916]">
                      {lang === 'mr'
                        ? 'फिंगरप्रिंट अनलॉक (Fingerprint Sensor)'
                        : 'Fingerprint Biometric Unlock'}
                    </div>
                    <div className="text-[11px] text-[#5C4742]">
                      On-device touch biometric sensor
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.fingerprintEnabled}
                  onChange={(e) =>
                    onUpdateSecuritySettings({
                      ...securitySettings,
                      fingerprintEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#9E3B24]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#9E3B24]/15">
                <div className="flex items-center gap-2.5">
                  <ScanFace className="w-5 h-5 text-[#2D6A4F]" />
                  <div>
                    <div className="text-xs font-bold text-[#241916]">
                      {lang === 'mr' ? 'फेस आयडी अनलॉक (Face ID)' : 'Face ID Recognition Unlock'}
                    </div>
                    <div className="text-[11px] text-[#5C4742]">
                      Local camera/platform Face ID verification
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.faceIdEnabled}
                  onChange={(e) =>
                    onUpdateSecuritySettings({
                      ...securitySettings,
                      faceIdEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#E8F5EE] border border-[#A3D9B8] text-[11px] text-[#2D6A4F] font-medium">
              ✓ {lang === 'mr' ? 'लॉक स्क्रीनवर सर्व ४ पर्याय सक्रिय आहेत. वरून "तिजोरी लॉक करा" दाबून तपासा!' : 'All 4 unlock modes are active on the Lock Screen. Click the Lock icon in the top bar to test!'}
            </div>
          </div>
        </div>
      </section>

      <WarliBorderDivider color="#9E3B24" />

      {/* SECTION 3: Change Language & Add Additional Languages */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5 shadow-sm space-y-5">
        <h3 className="font-heading text-lg text-[#9E3B24] flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span>{t.languageSettingsTitle}</span>
        </h3>

        {/* Active Languages List */}
        <div>
          <div className="text-xs font-bold text-[#5C4742] mb-2">
            {lang === 'mr' ? 'सध्याच्या सक्रिय भाषा (Active Languages):' : 'Active Languages (Click to Switch):'}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {availableLanguages.map((l) => {
              const isCurrent = lang === l.code;
              return (
                <div
                  key={l.code}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 text-xs sm:text-sm font-bold transition ${
                    isCurrent
                      ? 'bg-[#9E3B24] text-[#FBF8F5] border-[#7A2B18] shadow'
                      : 'bg-[#FBF8F5] text-[#241916] border-[#9E3B24]/25 hover:border-[#9E3B24]'
                  }`}
                >
                  <button type="button" onClick={() => onChangeLang(l.code)}>
                    {l.nativeLabel} <span className="opacity-75 text-[11px]">({l.code})</span>
                  </button>
                  {l.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLanguage(l.code)}
                      className="p-0.5 rounded hover:bg-[#241916]/20"
                      title="Remove language"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* One-Click Preset Indian Languages */}
        <div className="pt-3 border-t border-[#9E3B24]/15">
          <div className="text-xs font-bold text-[#5C4742] mb-2">
            {lang === 'mr'
              ? '१-क्लिकमध्ये अतिरिक्त भारतीय भाषा जोडा (1-Click Add Regional Languages):'
              : '1-Click Add Additional Indian Languages:'}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_ADDITIONAL_LANGUAGES.map((preset) => {
              const alreadyAdded = availableLanguages.some((l) => l.code === preset.code);
              return (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => handleAddPresetLanguage(preset)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    alreadyAdded
                      ? 'bg-[#E8F5EE] border-[#2D6A4F] text-[#2D6A4F]'
                      : 'bg-[#FBF8F5] hover:bg-[#EADCD3] border-[#9E3B24]/30 text-[#241916]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{preset.nativeLabel}</span>
                  {alreadyAdded && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Language Creator Form */}
        <form
          onSubmit={handleAddCustomLanguageForm}
          className="pt-3 border-t border-[#9E3B24]/15 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1">
              {lang === 'mr' ? 'नवीन भाषेचे नाव (Language Name)' : 'Custom Language Name'}
            </label>
            <input
              type="text"
              required
              value={customLangName}
              onChange={(e) => setCustomLangName(e.target.value)}
              placeholder="e.g. अहिराणी / मालवणी / Bengali"
              className="w-full px-3 py-2 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4742] mb-1">
              {lang === 'mr' ? 'भाषा कोड (Code उदा. ah, mlv, bn)' : 'Short Code (e.g. ah, bn)'}
            </label>
            <input
              type="text"
              value={customLangCode}
              onChange={(e) => setCustomLangCode(e.target.value)}
              placeholder="e.g. ah"
              className="w-full px-3 py-2 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 font-mono text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs text-[#241916] cursor-pointer">
              <input
                type="checkbox"
                checked={customLangDevanagari}
                onChange={(e) => setCustomLangDevanagari(e.target.checked)}
                className="accent-[#9E3B24]"
              />
              <span>Devanagari (१२३)</span>
            </label>

            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-xs flex items-center justify-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'mr' ? 'भाषा जोडा' : 'Add Language'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 4: Marathi Musical Instruments Preview (Veena, Tabla & Harmonium) */}
      <section className="bg-[#F4EBE6] border-2 border-[#9E3B24]/20 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="font-heading text-lg text-[#9E3B24] flex items-center gap-2">
          <Music className="w-5 h-5" />
          <span>
            {lang === 'mr'
              ? '४. मराठी वाद्य ध्वनी संकेत (वीणा • तबला • हार्मोनियम)'
              : '4. Marathi Musical Instruments (Veena • Tabla • Harmonium)'}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Veena for Revenue */}
          <div className="p-4 rounded-2xl bg-[#FBF8F5] border border-[#2D6A4F]/30 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#2D6A4F]">
                {lang === 'mr' ? '१. जमा नोंद (+ Revenue)' : '1. Revenue (+ जमा)'}
              </div>
              <div className="font-heading text-base text-[#241916] mt-0.5">
                🎻 सरस्वती वीणा (Veena)
              </div>
              <p className="text-[11px] text-[#5C4742] mt-1">
                {lang === 'mr'
                  ? 'जमा नोंदीसाठी शांत व मंगल वीणा झंकार (सा-ग-ध-सां).'
                  : 'Auspicious plucked Saraswati Veena strings with Meend glide.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => acousticEngine.playRevenueVeena()}
              className="w-full py-2 px-3 rounded-xl bg-[#E8F5EE] hover:bg-[#D5EDE0] text-[#2D6A4F] border border-[#2D6A4F]/30 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === 'mr' ? 'वीणा ऐका ♪' : 'Play Veena ♪'}</span>
            </button>
          </div>

          {/* 2. Tabla for Expense */}
          <div className="p-4 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/30 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#9E3B24]">
                {lang === 'mr' ? '२. खर्च नोंद (- Expense)' : '2. Expense (- खर्च)'}
              </div>
              <div className="font-heading text-base text-[#241916] mt-0.5">
                🥁 तबला थाप (Tabla)
              </div>
              <p className="text-[11px] text-[#5C4742] mt-1">
                {lang === 'mr'
                  ? 'खर्च नोंदीसाठी पारंपरिक तबला बोल (धा-धिन-धिन-ना).'
                  : 'Crisp traditional Tabla Bayan & Dayan strokes (Dha-Dhin-Dhin-Na).'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => acousticEngine.playExpenseTabla()}
              className="w-full py-2 px-3 rounded-xl bg-[#FCEEE9] hover:bg-[#F7DDD4] text-[#9E3B24] border border-[#9E3B24]/30 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === 'mr' ? 'तबला ऐका ♪' : 'Play Tabla ♪'}</span>
            </button>
          </div>

          {/* 3. Harmonium for Account Transfers */}
          <div className="p-4 rounded-2xl bg-[#FBF8F5] border border-[#D9822B]/40 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#D9822B]">
                {lang === 'mr' ? '३. खाते हस्तांतरण (Transfer)' : '3. Account Transfer'}
              </div>
              <div className="font-heading text-base text-[#241916] mt-0.5">
                🎹 संवादिनी / हार्मोनियम
              </div>
              <p className="text-[11px] text-[#5C4742] mt-1">
                {lang === 'mr'
                  ? 'एका खात्यातून दुसऱ्या खात्यात रक्कम वर्ग करताना हार्मोनियम सूर.'
                  : 'Warm Marathi Abhang & Natyasangeet reed Harmonium chord swell.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => acousticEngine.playTransferHarmonium()}
              className="w-full py-2 px-3 rounded-xl bg-[#FFF5E6] hover:bg-[#FCE8C8] text-[#9E3B24] border border-[#D9822B]/40 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === 'mr' ? 'हार्मोनियम ऐका ♪' : 'Play Harmonium ♪'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
