import React from 'react';
import { Volume2, X } from 'lucide-react';
import { AcousticToastCue, Language } from '../types';
import { formatINR } from '../i18n/translations';
import { WarliDrummerIllustration } from './WarliArt';

interface AcousticToastBannerProps {
  cue: AcousticToastCue | null;
  lang: Language;
  useDevanagariNumerals: boolean;
  onDismiss: () => void;
  onReplaySound: () => void;
}

export const AcousticToastBanner: React.FC<AcousticToastBannerProps> = ({
  cue,
  lang,
  useDevanagariNumerals,
  onDismiss,
  onReplaySound,
}) => {
  if (!cue) return null;

  const isRevenue = cue.type === 'revenue';

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-lg rounded-3xl p-4 shadow-2xl border-2 text-[#FBF8F5] transition-all animate-in slide-in-from-top-4 duration-200 ${
          isRevenue
            ? 'bg-gradient-to-r from-[#2D6A4F] via-[#245740] to-[#1B4332] border-[#A3D9B8]'
            : 'bg-gradient-to-r from-[#9E3B24] via-[#842F1B] to-[#6B2313] border-[#E8B4A6]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          {/* Warli Musician / Acoustic Visualizer Icon */}
          <div className="p-1.5 rounded-2xl bg-[#241916]/25 border border-[#FBF8F5]/25 shrink-0">
            <WarliDrummerIllustration size={48} color="#FBF8F5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading text-sm sm:text-base tracking-wide text-[#FBF8F5] truncate">
                {cue.instrumentTitle}
              </span>
              <span className="font-mono text-sm font-bold px-2 py-0.5 rounded-lg bg-[#241916]/30">
                {isRevenue ? '+' : '-'}
                {formatINR(cue.amount, lang, useDevanagariNumerals)}
              </span>
            </div>

            {/* Rhythm Bol Notation */}
            <div className="font-mono text-xs font-semibold text-[#FFD2C6] bg-[#241916]/30 px-2.5 py-1 rounded-lg mt-1 inline-block">
              {cue.bolNotation}
            </div>

            <p className="text-xs text-[#F4EBE6]/90 mt-1 leading-snug">{cue.description}</p>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-xl bg-[#241916]/25 hover:bg-[#241916]/45 text-[#FBF8F5]"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onReplaySound}
              className="p-1.5 rounded-xl bg-[#241916]/25 hover:bg-[#241916]/45 text-[#FBF8F5]"
              title="Replay Acoustic Beat"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
