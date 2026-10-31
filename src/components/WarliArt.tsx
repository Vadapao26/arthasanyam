import React from 'react';

/**
 * SRD Module 2.1: Warli #16 (Infinite Loop / Gavali) Vector Emblem
 * Traditional geometric Warli motif combining the sacred Chowk, infinite loop (Anant/Gavali),
 * and opposing equilateral triangles representing cosmic balance (Jamakharch: Inflow & Outflow).
 */
export const WarliEmblem16: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 42,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Warli #16 Infinite Loop Gavali Emblem"
  >
    {/* Outer Sacred Chowk Border with Dotted Tandul Rice Paste Pattern */}
    <rect
      x="6"
      y="6"
      width="88"
      height="88"
      rx="10"
      stroke={color}
      strokeWidth="3.2"
      strokeDasharray="4 3"
    />
    <rect x="13" y="13" width="74" height="74" rx="6" stroke={color} strokeWidth="2" />

    {/* Infinite Loop (Warli #16 Gavali / Anant Cycle of Prosperity) */}
    <path
      d="M25 50 C25 32, 45 32, 50 50 C55 68, 75 68, 75 50 C75 32, 55 32, 50 50 C45 68, 25 68, 25 50 Z"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Warli Human/Gavali Geometric Triangles inside the Loop */}
    <polygon points="36,44 31,56 41,56" fill={color} />
    <circle cx="36" cy="39" r="3.2" fill={color} />

    <polygon points="64,44 59,56 69,56" fill={color} />
    <circle cx="64" cy="39" r="3.2" fill={color} />

    {/* Sun & Moon (Surya-Chandra) in Upper Corners */}
    <circle cx="23" cy="23" r="4" stroke={color} strokeWidth="2" />
    <path d="M73 20 A5 5 0 1 0 79 26 A4 4 0 1 1 73 20 Z" fill={color} />

    {/* Four Corner Rice Sprout (Tandul) Marks */}
    <circle cx="50" cy="21" r="2.2" fill={color} />
    <circle cx="50" cy="79" r="2.2" fill={color} />
  </svg>
);

/**
 * Decorative Horizontal Warli Village Frieze Divider (Tarpa & Harvest Procession)
 */
export const WarliBorderDivider: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#9E3B24',
}) => (
  <svg
    viewBox="0 0 600 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-6 opacity-80 ${className}`}
    preserveAspectRatio="none"
  >
    <line x1="0" y1="4" x2="600" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray="6 4" />
    {/* Repeating geometric Warli triangles (Toran pattern) */}
    {Array.from({ length: 24 }).map((_, i) => {
      const x = i * 25;
      return (
        <g key={i}>
          <polygon
            points={`${x + 2},4 ${x + 12.5},20 ${x + 23},4`}
            stroke={color}
            strokeWidth="1.4"
            fill="none"
          />
          <circle cx={x + 12.5} cy={23} r="1.8" fill={color} />
        </g>
      );
    })}
    <line x1="0" y1="27" x2="600" y2="27" stroke={color} strokeWidth="1.2" />
  </svg>
);

/**
 * Warli Drummer (Pakhawaj & Taal Player) Illustration for Revenue Toast & Hero Banner
 */
export const WarliDrummerIllustration: React.FC<{ size?: number; color?: string }> = ({
  size = 56,
  color = '#FBF8F5',
}) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="40" cy="16" r="5.5" fill={color} />
    <line x1="40" y1="21.5" x2="40" y2="26" stroke={color} strokeWidth="2.4" />
    {/* Upper Torso Triangle */}
    <polygon points="29,26 51,26 40,42" fill={color} />
    {/* Lower Torso Triangle */}
    <polygon points="40,41 30,56 50,56" fill={color} />
    {/* Pakhawaj Drum slung across waist */}
    <ellipse cx="40" cy="44" rx="15" ry="7.5" fill="#9E3B24" stroke={color} strokeWidth="2.5" />
    <line x1="32" y1="37" x2="35" y2="51" stroke={color} strokeWidth="1.5" />
    <line x1="40" y1="36.5" x2="40" y2="51.5" stroke={color} strokeWidth="1.5" />
    <line x1="48" y1="37" x2="45" y2="51" stroke={color} strokeWidth="1.5" />
    {/* Arms striking the Pakhawaj */}
    <polyline points="30,27 21,36 25,44" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="50,27 59,36 55,44" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Dancing Legs */}
    <polyline points="34,56 28,66 33,73" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="46,56 52,66 47,73" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Acoustic Sound Waves */}
    <path d="M14 38 Q9 44 14 50" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M66 38 Q71 44 66 50" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
