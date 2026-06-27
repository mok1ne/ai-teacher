import { useId } from "react";

/* Векторная марка бренда «Время сдавать»: часы + конфедератка в градиенте.
   Читается даже в мелком размере (фавикон, шапка). */
export default function Logo({ size = 34 }) {
  const gid = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Время сдавать">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gid})`} />

      {/* clock */}
      <circle cx="24" cy="29" r="10.2" stroke="#fff" strokeWidth="2.4" />
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <line x1="33.0" y1="29" x2="31.6" y2="29" />
        <line x1="15.0" y1="29" x2="16.4" y2="29" />
        <line x1="24" y1="38.2" x2="24" y2="36.8" />
      </g>
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <line x1="24" y1="29" x2="24" y2="21" />
        <line x1="24" y1="29" x2="20.6" y2="23" />
      </g>
      <circle cx="24" cy="29" r="1.7" fill="#fff" />

      {/* cap */}
      <path d="M20 17.5 L20 21 Q24 23.6 28 21 L28 17.5 Z" fill="#fff" />
      <path d="M24 9 L38 14.5 L24 20 L10 14.5 Z" fill="#fff" />

      {/* tassel */}
      <circle cx="27.5" cy="13.2" r="1.1" fill="#F59E0B" />
      <path d="M27.5 13.2 L37.6 16.2 L37.6 20.6" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="36.4" y="20.4" width="2.4" height="3.6" rx="1" fill="#F59E0B" />
    </svg>
  );
}
