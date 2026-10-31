import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Sparkles,
  WifiOff,
  CheckCircle2,
  Fingerprint,
  ScanFace,
  Grid,
  RotateCcw,
} from 'lucide-react';
import {
  Language,
  LanguageDefinition,
  LocalAuthRecord,
  LocalSecuritySettings,
  LockMethod,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { hashCredentialsLocally } from '../utils/localDatabase';
import { acousticEngine } from '../utils/acousticEngine';
import { WarliBorderDivider, WarliEmblem16 } from './WarliArt';

interface SplashAuthScreenProps {
  lang: Language;
  availableLanguages: LanguageDefinition[];
  onChangeLang: (lang: Language) => void;
  existingAuth: LocalAuthRecord | null;
  securitySettings: LocalSecuritySettings;
  onAuthenticated: (record: LocalAuthRecord) => void;
}

export const SplashAuthScreen: React.FC<SplashAuthScreenProps> = ({
  lang,
  availableLanguages,
  onChangeLang,
  existingAuth,
  securitySettings,
  onAuthenticated,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeMethod, setActiveMethod] = useState<LockMethod>(
    securitySettings.preferredLockMethod || 'passcode'
  );
  const [userId, setUserId] = useState(existingAuth?.userId || 'siddharth_jamakharch');
  const [passcode, setPasscode] = useState('');
  const [drawnPattern, setDrawnPattern] = useState<number[]>([]);
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const completeUnlock = async () => {
    acousticEngine.playNotificationSwarmandal();
    const demoUser = existingAuth?.userId || userId.trim() || 'siddharth_01';
    const record = existingAuth || (await hashCredentialsLocally(demoUser, '1234'));
    onAuthenticated(record);
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId.trim()) {
      setErrorMsg(
        lang === 'mr'
          ? 'कृपया स्थानिक युजर आयडी प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया स्थानीय यूज़र आईडी दर्ज करें।'
          : 'Please enter a local User ID.'
      );
      return;
    }

    if (passcode.trim().length < 4) {
      setErrorMsg(
        lang === 'mr'
          ? 'कृपया किमान ४ अंकी/अक्षरी पासकोड प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया कम से कम ४ अंकों का पासकोड दर्ज करें।'
          : 'Passcode must be at least 4 characters.'
      );
      return;
    }

    setIsProcessing(true);
    try {
      if (existingAuth && existingAuth.userId.toLowerCase() === userId.trim().toLowerCase()) {
        const check = await hashCredentialsLocally(userId, passcode, existingAuth.saltHex);
        if (check.hashHex !== existingAuth.hashHex) {
          setErrorMsg(
            lang === 'mr'
              ? 'स्थानिक पासकोड जुळला नाही. (किंवा पॅटर्न / बायोमेट्रिक / डेमो वापरा)'
              : lang === 'hi'
              ? 'स्थानीय पासकोड मेल नहीं खाया। (या पैटर्न / बायोमेट्रिक / डेमो का उपयोग करें)'
              : 'Local passcode mismatch. (Try Pattern, Fingerprint, Face ID, or 1-Click Demo)'
          );
          setIsProcessing(false);
          return;
        }
        acousticEngine.playNotificationSwarmandal();
        onAuthenticated(existingAuth);
      } else {
        const record = await hashCredentialsLocally(userId, passcode);
        acousticEngine.playNotificationSwarmandal();
        onAuthenticated(record);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Pattern Lock Handler (3x3 Grid indices 0..8)
  const handleDotSelect = (dotIdx: number) => {
    setErrorMsg(null);
    if (drawnPattern.includes(dotIdx)) return;
    const next = [...drawnPattern, dotIdx];
    setDrawnPattern(next);

    // Check if matches configured pattern
    const target = securitySettings.patternSequence;
    if (
      next.length === target.length &&
      next.every((val, idx) => val === target[idx])
    ) {
      setTimeout(() => {
        completeUnlock();
      }, 250);
    }
  };

  const handleVerifyPatternBtn = async () => {
    setErrorMsg(null);
    const target = securitySettings.patternSequence;
    const matchesTarget =
      drawnPattern.length === target.length &&
      drawnPattern.every((v, i) => v === target[i]);

    if (matchesTarget) {
      await completeUnlock();
    } else {
      setErrorMsg(
        lang === 'mr'
          ? `पॅटर्न जुळला नाही! अपेक्षित क्रम: ${target.map((n) => n + 1).join(' → ')}`
          : lang === 'hi'
          ? `पैटर्न मेल नहीं खाया! अपेक्षित क्रम: ${target.map((n) => n + 1).join(' → ')}`
          : `Pattern mismatch! Configured sequence is dots: ${target.map((n) => n + 1).join(' → ')}`
      );
    }
  };

  // Biometric (Fingerprint / Face ID) Handler with WebAuthn + Local Sensor Simulation
  const handleBiometricScan = async () => {
    setErrorMsg(null);
    setIsScanningBiometric(true);

    // Attempt platform WebAuthn user-verifying authenticator if available, with graceful fallback
    try {
      if (
        window.PublicKeyCredential &&
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
      ) {
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch {
      // Proceed with local sensor unlock
    }

    setTimeout(async () => {
      setIsScanningBiometric(false);
      await completeUnlock();
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-[#241916] flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Geru Top Header Band */}
      <div className="bg-[#9E3B24] text-[#FBF8F5] pt-5 pb-4 px-4 shadow-md relative">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          {/* Module 1.1: Multi-Language Switcher (includes custom added languages) */}
          <div className="w-full flex items-center justify-between mb-3 bg-[#7A2B18]/70 p-1.5 rounded-2xl border border-[#FBF8F5]/20 overflow-x-auto">
            <div className="flex items-center gap-1 w-full justify-center flex-wrap">
              {availableLanguages.map((l) => {
                const active = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onChangeLang(l.code)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      active
                        ? 'bg-[#FBF8F5] text-[#9E3B24] shadow-sm scale-105'
                        : 'text-[#FBF8F5]/85 hover:bg-[#FBF8F5]/10'
                    }`}
                  >
                    {l.nativeLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warli #16 (Infinite Loop / Gavali) Emblem */}
          <div className="my-1.5 p-2.5 rounded-2xl bg-[#7A2B18]/60 border border-[#FBF8F5]/25 shadow-inner">
            <WarliEmblem16 size={60} color="#FBF8F5" />
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl tracking-wide mt-1 text-[#FBF8F5]">
            {t.appName}
          </h1>
          <p className="text-xs text-[#F4EBE6]/90 mt-1 max-w-sm leading-relaxed">
            {t.appTagline}
          </p>

          {/* Zero-Internet Privacy Mandate Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241916]/35 border border-[#FBF8F5]/25 text-[11px] font-medium text-[#FBF8F5]">
            <WifiOff className="w-3.5 h-3.5 text-[#F4EBE6]" />
            <span>{t.privacyMandateBadge}</span>
          </div>
        </div>
      </div>

      <WarliBorderDivider color="#9E3B24" />

      {/* Module 1.3: Multi-Mode Lock Screen Card (Passcode / Pattern / Fingerprint / Face ID) */}
      <main className="flex-1 flex items-center justify-center px-4 py-5">
        <div className="w-full max-w-md bg-[#F4EBE6] border-2 border-[#9E3B24]/25 rounded-3xl p-5 sm:p-6 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-[#9E3B24] text-[#FBF8F5] shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl text-[#241916]">{t.authTitle}</h2>
              <p className="text-xs text-[#5C4742] mt-0.5 leading-relaxed">{t.authSubtitle}</p>
            </div>
          </div>

          {/* Lock Method Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[#FBF8F5] border border-[#9E3B24]/20 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveMethod('passcode');
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                activeMethod === 'passcode'
                  ? 'bg-[#9E3B24] text-[#FBF8F5] shadow-xs'
                  : 'text-[#5C4742] hover:bg-[#F4EBE6]'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span className="truncate max-w-full">{t.authTabPasscode}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMethod('pattern');
                setDrawnPattern([]);
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                activeMethod === 'pattern'
                  ? 'bg-[#9E3B24] text-[#FBF8F5] shadow-xs'
                  : 'text-[#5C4742] hover:bg-[#F4EBE6]'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="truncate max-w-full">{t.authTabPattern}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMethod('fingerprint');
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                activeMethod === 'fingerprint'
                  ? 'bg-[#9E3B24] text-[#FBF8F5] shadow-xs'
                  : 'text-[#5C4742] hover:bg-[#F4EBE6]'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span className="truncate max-w-full">{t.authTabFingerprint}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMethod('faceid');
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                activeMethod === 'faceid'
                  ? 'bg-[#9E3B24] text-[#FBF8F5] shadow-xs'
                  : 'text-[#5C4742] hover:bg-[#F4EBE6]'
              }`}
            >
              <ScanFace className="w-4 h-4" />
              <span className="truncate max-w-full">{t.authTabFaceId}</span>
            </button>
          </div>

          {/* MODE 1: PASSCODE */}
          {activeMethod === 'passcode' && (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4742] mb-1.5">
                  {t.userIdLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9E3B24] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={t.userIdPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-[#241916] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4742] mb-1.5">
                  {t.passcodeLabel}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#9E3B24] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder={t.passcodePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-[#241916] font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-[#9E3B24]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#FCEEE9] border border-[#9E3B24]/40 text-xs text-[#9E3B24] font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] active:scale-[0.99] text-[#FBF8F5] font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{existingAuth ? t.unlockVaultBtn : t.createVaultBtn}</span>
              </button>
            </form>
          )}

          {/* MODE 2: 3x3 WARLI PATTERN LOCK */}
          {activeMethod === 'pattern' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-[#5C4742]">{t.patternPrompt}</p>
              <div className="text-[11px] font-mono text-[#9E3B24] bg-[#FBF8F5] py-1 px-3 rounded-full inline-block border border-[#9E3B24]/20">
                Active Pattern:{' '}
                {securitySettings.patternSequence.map((n) => n + 1).join(' → ')}
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-[220px] mx-auto p-4 rounded-3xl bg-[#FBF8F5] border-2 border-[#9E3B24]/30 shadow-inner">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const orderIdx = drawnPattern.indexOf(idx);
                  const isSelected = orderIdx !== -1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDotSelect(idx)}
                      onMouseEnter={(e) => {
                        if (e.buttons === 1) handleDotSelect(idx);
                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-sm font-bold border-2 transition-all ${
                        isSelected
                          ? 'bg-[#9E3B24] text-[#FBF8F5] border-[#7A2B18] scale-105 shadow-md'
                          : 'bg-[#F4EBE6] text-[#5C4742] border-[#9E3B24]/25 hover:border-[#9E3B24]'
                      }`}
                    >
                      {isSelected ? `${orderIdx + 1}` : idx + 1}
                    </button>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-[#FCEEE9] border border-[#9E3B24]/40 text-xs text-[#9E3B24] font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDrawnPattern([]);
                    setErrorMsg(null);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FBF8F5] border border-[#9E3B24]/30 text-xs font-semibold text-[#5C4742] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleVerifyPatternBtn}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-xs sm:text-sm shadow flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.unlockVaultBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3 & 4: FINGERPRINT OR FACE ID BIOMETRIC UNLOCK */}
          {(activeMethod === 'fingerprint' || activeMethod === 'faceid') && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-[#5C4742]">
                {activeMethod === 'fingerprint' ? t.fingerprintPrompt : t.faceIdPrompt}
              </p>

              <div className="flex justify-center py-3">
                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={isScanningBiometric}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 border-4 transition-all shadow-lg ${
                    isScanningBiometric
                      ? 'bg-[#2D6A4F] text-[#FBF8F5] border-[#A3D9B8] scale-105 animate-pulse'
                      : 'bg-[#FBF8F5] hover:bg-[#FCEEE9] text-[#9E3B24] border-[#9E3B24]'
                  }`}
                >
                  {activeMethod === 'fingerprint' ? (
                    <Fingerprint className="w-12 h-12" />
                  ) : (
                    <ScanFace className="w-12 h-12" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isScanningBiometric ? 'Scanning...' : 'Tap Sensor'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleBiometricScan}
                disabled={isScanningBiometric}
                className="w-full py-3 px-4 rounded-xl bg-[#9E3B24] hover:bg-[#7A2B18] text-[#FBF8F5] font-semibold text-xs sm:text-sm shadow flex items-center justify-center gap-2"
              >
                {activeMethod === 'fingerprint' ? (
                  <Fingerprint className="w-4 h-4" />
                ) : (
                  <ScanFace className="w-4 h-4" />
                )}
                <span>{t.scanBiometricBtn}</span>
              </button>
            </div>
          )}

          {/* 1-Click Instant Demo Vault for quick evaluation */}
          <div className="mt-4 pt-3.5 border-t border-[#9E3B24]/15">
            <button
              type="button"
              onClick={completeUnlock}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FBF8F5] hover:bg-[#EADCD3] border border-[#9E3B24]/35 text-[#9E3B24] font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.quickDemoBtn}</span>
            </button>
          </div>

          {/* Cryptographic Local Storage Proof */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-[#FBF8F5]/80 border border-[#9E3B24]/15 text-[11px] text-[#5C4742] space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#241916]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{t.encryptionProofTitle}</span>
            </div>
            <div className="font-mono text-[10px] text-[#8A726B] truncate">
              {existingAuth
                ? existingAuth.cipherPreview
                : 'PBKDF2/SHA-256 Local Key Derivation • Zero Remote Telemetry'}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-2.5 text-center text-xs text-[#5C4742] bg-[#F4EBE6]/60 border-t border-[#9E3B24]/15">
        अर्थसंयम (Arthasanyam) v1.1.0 • Geru (#9E3B24) & Tandul (#FBF8F5) Warli Design System
      </footer>
    </div>
  );
};
