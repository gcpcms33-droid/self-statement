import React, { useId } from 'react';

interface IconProps {
  className?: string;
}

export type HisaapLogoVariant = 'app-icon' | 'sidebar' | 'splash' | 'favicon';
export type HisaapLogoTheme = 'auto' | 'light' | 'dark';

interface HisaapLogoIconProps extends IconProps {
  variant?: HisaapLogoVariant;
  theme?: HisaapLogoTheme;
}

/**
 * Returns standalone scalable SVG markup for any of the 4 official Hisaap logo versions:
 * - app-icon: Play Store / App Store ready Assam Green + Gold geometric Jaapi with hidden "H"
 * - sidebar: High-legibility compact navigation mark
 * - splash: Ceremonial fintech edition with subtle concentric Jaapi heritage ring
 * - favicon: Ultra-bold high-contrast silhouette legible at 16px-32px browser tabs
 */
export function getHisaapLogoSvgMarkup(
  variant: HisaapLogoVariant = 'app-icon',
  themeMode: 'light' | 'dark' = 'light'
): string {
  const bgTop = themeMode === 'light' ? '#14814A' : '#0D5832';
  const bgMid = themeMode === 'light' ? '#0F6A3C' : '#094024';
  const bgBot = themeMode === 'light' ? '#084124' : '#052715';
  const rimStrokeOpacity = themeMode === 'light' ? '0.72' : '0.92';

  if (variant === 'favicon') {
    return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hs-fav-bg" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${bgTop}" />
      <stop offset="55%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgBot}" />
    </linearGradient>
    <linearGradient id="hs-fav-gold" x1="16" y1="8" x2="48" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCE38A" />
      <stop offset="52%" stop-color="#D4A017" />
      <stop offset="100%" stop-color="#B5840B" />
    </linearGradient>
    <linearGradient id="hs-fav-wing" x1="10" y1="26" x2="54" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFDF5" />
      <stop offset="100%" stop-color="#F6E2A1" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#hs-fav-bg)" />
  <rect x="4.5" y="4.5" width="55" height="55" rx="13.5" stroke="url(#hs-fav-gold)" stroke-width="2" stroke-opacity="${rimStrokeOpacity}" />
  <path d="M32 7L35.4 11.2L32 14.2L28.6 11.2L32 7Z" fill="url(#hs-fav-gold)" />
  <path d="M32 14.8L36.8 19.6L32 17.9L27.2 19.6L32 14.8Z" fill="url(#hs-fav-gold)" />
  <path d="M19.8 27.2L9.5 38.4C12.9 40.1 16.3 41.2 19.8 42V27.2Z" fill="url(#hs-fav-wing)" />
  <path d="M44.2 27.2L54.5 38.4C51.1 40.1 47.7 41.2 44.2 42V27.2Z" fill="url(#hs-fav-wing)" />
  <path d="M22.4 24.4L27.2 19.6V29.8H36.8V19.6L41.6 24.4V42.4C40 42.7 38.4 42.9 36.8 43.1V34.6H27.2V43.1C25.6 42.9 24 42.7 22.4 42.4V24.4Z" fill="url(#hs-fav-gold)" />
  <path d="M11.5 44C17.8 47 24.8 48.5 32 48.5C39.2 48.5 46.2 47 52.5 44" stroke="url(#hs-fav-gold)" stroke-width="2.9" stroke-linecap="round" />
  <path d="M20.5 51C24.2 52.4 28.1 53.1 32 53.1C35.9 53.1 39.8 52.4 43.5 51" stroke="#FCE38A" stroke-width="2" stroke-linecap="round" stroke-opacity="0.88" />
</svg>`;
  }

  if (variant === 'sidebar') {
    return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hs-sb-bg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${bgTop}" />
      <stop offset="55%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgBot}" />
    </linearGradient>
    <linearGradient id="hs-sb-gold" x1="16" y1="8" x2="48" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCE38A" />
      <stop offset="52%" stop-color="#D4A017" />
      <stop offset="100%" stop-color="#B5840B" />
    </linearGradient>
    <linearGradient id="hs-sb-wing" x1="10" y1="26" x2="54" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFDF6" />
      <stop offset="100%" stop-color="#F6E2A1" />
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="58" height="58" rx="15" fill="url(#hs-sb-bg)" />
  <rect x="5" y="5" width="54" height="54" rx="13" stroke="url(#hs-sb-gold)" stroke-width="1.5" stroke-opacity="${rimStrokeOpacity}" />
  <path d="M32 7.8L35 11.4L32 14.2L29 11.4L32 7.8Z" fill="url(#hs-sb-gold)" />
  <path d="M32 14.8L36.2 19.1L32 17.6L27.8 19.1L32 14.8Z" fill="url(#hs-sb-gold)" />
  <path d="M20.2 27.1L10 38.2C13.3 39.9 16.7 41 20.2 41.8V27.1Z" fill="url(#hs-sb-wing)" />
  <path d="M43.8 27.1L54 38.2C50.7 39.9 47.3 41 43.8 41.8V27.1Z" fill="url(#hs-sb-wing)" />
  <path d="M22.6 24.6L27.2 19.8V30.1H36.8V19.8L41.4 24.6V42.3C39.9 42.6 38.4 42.8 36.8 43V34.4H27.2V43C25.6 42.8 24.1 42.6 22.6 42.3V24.6Z" fill="url(#hs-sb-gold)" />
  <path d="M12 43.8C18.1 46.7 25 48.2 32 48.2C39 48.2 45.9 46.7 52 43.8" stroke="url(#hs-sb-gold)" stroke-width="2.6" stroke-linecap="round" />
  <path d="M21 50.4C24.5 51.7 28.2 52.4 32 52.4C35.8 52.4 39.5 51.7 43 50.4" stroke="#FCE38A" stroke-width="1.75" stroke-linecap="round" stroke-opacity="0.85" />
</svg>`;
  }

  if (variant === 'splash') {
    return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hs-sp-bg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${bgTop}" />
      <stop offset="55%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgBot}" />
    </linearGradient>
    <linearGradient id="hs-sp-gold" x1="16" y1="8" x2="48" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCE38A" />
      <stop offset="52%" stop-color="#D4A017" />
      <stop offset="100%" stop-color="#B5840B" />
    </linearGradient>
    <linearGradient id="hs-sp-wing" x1="10" y1="26" x2="54" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFDF6" />
      <stop offset="100%" stop-color="#F6E2A1" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#hs-sp-bg)" />
  <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="url(#hs-sp-gold)" stroke-width="1.6" stroke-opacity="${rimStrokeOpacity}" />
  <circle cx="32" cy="34" r="23.5" stroke="#FCE38A" stroke-width="1" stroke-opacity="0.28" stroke-dasharray="2.4 3.2" />
  <path d="M32 7.5L35 11.2L32 14L29 11.2L32 7.5Z" fill="url(#hs-sp-gold)" />
  <path d="M32 14.6L36.2 19L32 17.5L27.8 19L32 14.6Z" fill="url(#hs-sp-gold)" />
  <path d="M20.2 27L9.8 38.4C13.2 40.1 16.6 41.2 20.2 42V27Z" fill="url(#hs-sp-wing)" />
  <path d="M43.8 27L54.2 38.4C50.8 40.1 47.4 41.2 43.8 42V27Z" fill="url(#hs-sp-wing)" />
  <path d="M22.6 24.5L27.2 19.7V30.1H36.8V19.7L41.4 24.5V42.4C39.9 42.7 38.4 42.9 36.8 43.1V34.4H27.2V43.1C25.6 42.9 24.1 42.7 22.6 42.4V24.5Z" fill="url(#hs-sp-gold)" />
  <path d="M13.5 37.5L18.5 31.8M50.5 37.5L45.5 31.8" stroke="#0F6A3C" stroke-width="1.25" stroke-linecap="round" stroke-opacity="0.35" />
  <path d="M11.8 43.9C18 46.8 24.9 48.3 32 48.3C39.1 48.3 46 46.8 52.2 43.9" stroke="url(#hs-sp-gold)" stroke-width="2.5" stroke-linecap="round" />
  <path d="M20.5 50.5C24.2 51.9 28.1 52.6 32 52.6C35.9 52.6 39.8 51.9 43.5 50.5" stroke="#FCE38A" stroke-width="1.75" stroke-linecap="round" stroke-opacity="0.88" />
</svg>`;
  }

  // Default: app-icon (Play Store / App Store / Primary Brand Mark)
  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hs-app-bg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${bgTop}" />
      <stop offset="55%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgBot}" />
    </linearGradient>
    <linearGradient id="hs-app-gold" x1="16" y1="8" x2="48" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCE38A" />
      <stop offset="52%" stop-color="#D4A017" />
      <stop offset="100%" stop-color="#B5840B" />
    </linearGradient>
    <linearGradient id="hs-app-wing" x1="10" y1="26" x2="54" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFDF6" />
      <stop offset="100%" stop-color="#F6E2A1" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#hs-app-bg)" />
  <rect x="3" y="3" width="58" height="58" rx="15" stroke="#FFFFFF" stroke-width="0.75" stroke-opacity="0.14" />
  <rect x="4.5" y="4.5" width="55" height="55" rx="13.5" stroke="url(#hs-app-gold)" stroke-width="1.5" stroke-opacity="${rimStrokeOpacity}" />
  <path d="M32 7.6L35 11.3L32 14.1L29 11.3L32 7.6Z" fill="url(#hs-app-gold)" />
  <path d="M32 14.7L36.2 19L32 17.5L27.8 19L32 14.7Z" fill="url(#hs-app-gold)" />
  <path d="M20.2 27.1L9.8 38.4C13.2 40.1 16.6 41.2 20.2 42V27.1Z" fill="url(#hs-app-wing)" />
  <path d="M43.8 27.1L54.2 38.4C50.8 40.1 47.4 41.2 43.8 42V27.1Z" fill="url(#hs-app-wing)" />
  <path d="M22.6 24.5L27.2 19.7V30.1H36.8V19.7L41.4 24.5V42.4C39.9 42.7 38.4 42.9 36.8 43.1V34.4H27.2V43.1C25.6 42.9 24.1 42.7 22.6 42.4V24.5Z" fill="url(#hs-app-gold)" />
  <path d="M13.5 37.5L18.5 31.8M50.5 37.5L45.5 31.8" stroke="#0F6A3C" stroke-width="1.25" stroke-linecap="round" stroke-opacity="0.35" />
  <path d="M11.8 43.9C18 46.8 24.9 48.3 32 48.3C39.1 48.3 46 46.8 52.2 43.9" stroke="url(#hs-app-gold)" stroke-width="2.6" stroke-linecap="round" />
  <path d="M20.5 50.5C24.2 51.9 28.1 52.6 32 52.6C35.9 52.6 39.8 51.9 43.5 50.5" stroke="#FCE38A" stroke-width="1.75" stroke-linecap="round" stroke-opacity="0.88" />
</svg>`;
}

/**
 * Enhanced Assam Green + Gold Geometric Jaapi Logo for হিচাপ (Hisaap)
 * Architectural hidden "H" carved natively inside the conical Jaapi geometry
 * for modern fintech web, mobile, and Play Store icon clarity.
 */
export const HisaapLogoIcon: React.FC<HisaapLogoIconProps> = ({
  className = 'w-9 h-9',
  variant = 'app-icon',
  theme = 'auto',
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const bgLightId = `hs-bg-l-${uid}`;
  const bgDarkId = `hs-bg-d-${uid}`;
  const goldId = `hs-gold-${uid}`;
  const wingId = `hs-wing-${uid}`;

  const renderTileBackground = (x: number, y: number, size: number, rx: number) => {
    if (theme === 'light') {
      return <rect x={x} y={y} width={size} height={size} rx={rx} fill={`url(#${bgLightId})`} />;
    }
    if (theme === 'dark') {
      return <rect x={x} y={y} width={size} height={size} rx={rx} fill={`url(#${bgDarkId})`} />;
    }
    return (
      <>
        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          rx={rx}
          fill={`url(#${bgLightId})`}
          className="dark:hidden"
        />
        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          rx={rx}
          fill={`url(#${bgDarkId})`}
          className="hidden dark:block"
        />
      </>
    );
  };

  const rimOpacityClass =
    theme === 'light'
      ? 'opacity-75'
      : theme === 'dark'
        ? 'opacity-95'
        : 'opacity-75 dark:opacity-95';

  const renderDefs = () => (
    <defs>
      <linearGradient id={bgLightId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#14814A" />
        <stop offset="55%" stopColor="#0F6A3C" />
        <stop offset="100%" stopColor="#084124" />
      </linearGradient>
      <linearGradient id={bgDarkId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0D5832" />
        <stop offset="55%" stopColor="#094024" />
        <stop offset="100%" stopColor="#052715" />
      </linearGradient>
      <linearGradient id={goldId} x1="16" y1="8" x2="48" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FCE38A" />
        <stop offset="52%" stopColor="#D4A017" />
        <stop offset="100%" stopColor="#B5840B" />
      </linearGradient>
      <linearGradient id={wingId} x1="10" y1="26" x2="54" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFDF6" />
        <stop offset="100%" stopColor="#F6E2A1" />
      </linearGradient>
    </defs>
  );

  if (variant === 'favicon') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {renderDefs()}
        {renderTileBackground(2, 2, 60, 16)}
        <rect
          x="4.5"
          y="4.5"
          width="55"
          height="55"
          rx="13.5"
          stroke={`url(#${goldId})`}
          strokeWidth="2"
          className={rimOpacityClass}
        />
        {/* Jaapi apex finial (Chula) */}
        <path d="M32 7L35.4 11.2L32 14.2L28.6 11.2L32 7Z" fill={`url(#${goldId})`} />
        {/* Upper Jaapi crown peak */}
        <path d="M32 14.8L36.8 19.6L32 17.9L27.2 19.6L32 14.8Z" fill={`url(#${goldId})`} />
        {/* Sweeping Jaapi wing panels */}
        <path
          d="M19.8 27.2L9.5 38.4C12.9 40.1 16.3 41.2 19.8 42V27.2Z"
          fill={`url(#${wingId})`}
        />
        <path
          d="M44.2 27.2L54.5 38.4C51.1 40.1 47.7 41.2 44.2 42V27.2Z"
          fill={`url(#${wingId})`}
        />
        {/* Hidden "H" formed natively inside the Jaapi dome */}
        <path
          d="M22.4 24.4L27.2 19.6V29.8H36.8V19.6L41.6 24.4V42.4C40 42.7 38.4 42.9 36.8 43.1V34.6H27.2V43.1C25.6 42.9 24 42.7 22.4 42.4V24.4Z"
          fill={`url(#${goldId})`}
        />
        {/* Bold sweeping Jaapi brim & balance arc */}
        <path
          d="M11.5 44C17.8 47 24.8 48.5 32 48.5C39.2 48.5 46.2 47 52.5 44"
          stroke={`url(#${goldId})`}
          strokeWidth="2.9"
          strokeLinecap="round"
        />
        <path
          d="M20.5 51C24.2 52.4 28.1 53.1 32 53.1C35.9 53.1 39.8 52.4 43.5 51"
          stroke="#FCE38A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.88"
        />
      </svg>
    );
  }

  if (variant === 'sidebar') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {renderDefs()}
        {renderTileBackground(3, 3, 58, 15)}
        <rect
          x="5"
          y="5"
          width="54"
          height="54"
          rx="13"
          stroke={`url(#${goldId})`}
          strokeWidth="1.5"
          className={rimOpacityClass}
        />
        <path d="M32 7.8L35 11.4L32 14.2L29 11.4L32 7.8Z" fill={`url(#${goldId})`} />
        <path d="M32 14.8L36.2 19.1L32 17.6L27.8 19.1L32 14.8Z" fill={`url(#${goldId})`} />
        <path
          d="M20.2 27.1L10 38.2C13.3 39.9 16.7 41 20.2 41.8V27.1Z"
          fill={`url(#${wingId})`}
        />
        <path
          d="M43.8 27.1L54 38.2C50.7 39.9 47.3 41 43.8 41.8V27.1Z"
          fill={`url(#${wingId})`}
        />
        <path
          d="M22.6 24.6L27.2 19.8V30.1H36.8V19.8L41.4 24.6V42.3C39.9 42.6 38.4 42.8 36.8 43V34.4H27.2V43C25.6 42.8 24.1 42.6 22.6 42.3V24.6Z"
          fill={`url(#${goldId})`}
        />
        <path
          d="M12 43.8C18.1 46.7 25 48.2 32 48.2C39 48.2 45.9 46.7 52 43.8"
          stroke={`url(#${goldId})`}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M21 50.4C24.5 51.7 28.2 52.4 32 52.4C35.8 52.4 39.5 51.7 43 50.4"
          stroke="#FCE38A"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>
    );
  }

  if (variant === 'splash') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {renderDefs()}
        {renderTileBackground(2, 2, 60, 18)}
        <rect
          x="4.5"
          y="4.5"
          width="55"
          height="55"
          rx="15.5"
          stroke={`url(#${goldId})`}
          strokeWidth="1.6"
          className={rimOpacityClass}
        />
        {/* Subtle concentric Jaapi woven heritage halo */}
        <circle
          cx="32"
          cy="34"
          r="23.5"
          stroke="#FCE38A"
          strokeWidth="1"
          strokeOpacity="0.28"
          strokeDasharray="2.4 3.2"
        />
        <path d="M32 7.5L35 11.2L32 14L29 11.2L32 7.5Z" fill={`url(#${goldId})`} />
        <path d="M32 14.6L36.2 19L32 17.5L27.8 19L32 14.6Z" fill={`url(#${goldId})`} />
        <path
          d="M20.2 27L9.8 38.4C13.2 40.1 16.6 41.2 20.2 42V27Z"
          fill={`url(#${wingId})`}
        />
        <path
          d="M43.8 27L54.2 38.4C50.8 40.1 47.4 41.2 43.8 42V27Z"
          fill={`url(#${wingId})`}
        />
        <path
          d="M22.6 24.5L27.2 19.7V30.1H36.8V19.7L41.4 24.5V42.4C39.9 42.7 38.4 42.9 36.8 43.1V34.4H27.2V43.1C25.6 42.9 24.1 42.7 22.6 42.4V24.5Z"
          fill={`url(#${goldId})`}
        />
        <path
          d="M13.5 37.5L18.5 31.8M50.5 37.5L45.5 31.8"
          stroke="#0F6A3C"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        <path
          d="M11.8 43.9C18 46.8 24.9 48.3 32 48.3C39.1 48.3 46 46.8 52.2 43.9"
          stroke={`url(#${goldId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M20.5 50.5C24.2 51.9 28.1 52.6 32 52.6C35.9 52.6 39.8 51.9 43.5 50.5"
          stroke="#FCE38A"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.88"
        />
      </svg>
    );
  }

  // Default: app-icon (Play Store / App Store / Primary Brand Mark)
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {renderDefs()}
      {renderTileBackground(2, 2, 60, 16)}
      {/* Subtle top-edge specular polish */}
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        stroke="#FFFFFF"
        strokeWidth="0.75"
        strokeOpacity="0.14"
      />
      <rect
        x="4.5"
        y="4.5"
        width="55"
        height="55"
        rx="13.5"
        stroke={`url(#${goldId})`}
        strokeWidth="1.5"
        className={rimOpacityClass}
      />
      {/* Gold Jaapi apex finial (Chula) */}
      <path d="M32 7.6L35 11.3L32 14.1L29 11.3L32 7.6Z" fill={`url(#${goldId})`} />
      {/* Conical Jaapi peak chevron */}
      <path d="M32 14.7L36.2 19L32 17.5L27.8 19L32 14.7Z" fill={`url(#${goldId})`} />
      {/* Left & Right Jaapi sweeping wing facets */}
      <path
        d="M20.2 27.1L9.8 38.4C13.2 40.1 16.6 41.2 20.2 42V27.1Z"
        fill={`url(#${wingId})`}
      />
      <path
        d="M43.8 27.1L54.2 38.4C50.8 40.1 47.4 41.2 43.8 42V27.1Z"
        fill={`url(#${wingId})`}
      />
      {/* Hidden architectural "H" integrated seamlessly into the Jaapi dome */}
      <path
        d="M22.6 24.5L27.2 19.7V30.1H36.8V19.7L41.4 24.5V42.4C39.9 42.7 38.4 42.9 36.8 43.1V34.4H27.2V43.1C25.6 42.9 24.1 42.7 22.6 42.4V24.5Z"
        fill={`url(#${goldId})`}
      />
      {/* Subtle diagonal bamboo-weave rib impressions on outer wings */}
      <path
        d="M13.5 37.5L18.5 31.8M50.5 37.5L45.5 31.8"
        stroke="#0F6A3C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      {/* Sweeping lower Jaapi brim arc */}
      <path
        d="M11.8 43.9C18 46.8 24.9 48.3 32 48.3C39.1 48.3 46 46.8 52.2 43.9"
        stroke={`url(#${goldId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Delicate gold horizon balance line */}
      <path
        d="M20.5 50.5C24.2 51.9 28.1 52.6 32 52.6C35.9 52.6 39.8 51.9 43.5 50.5"
        stroke="#FCE38A"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.88"
      />
    </svg>
  );
};

interface HisaapBrandLockupProps {
  title: string;
  englishName?: string;
  tagline: string;
  layout?: 'horizontal' | 'stacked';
  variant?: HisaapLogoVariant;
  theme?: HisaapLogoTheme;
  iconClassName?: string;
  titleClassName?: string;
  taglineClassName?: string;
}

export const HisaapBrandLockup: React.FC<HisaapBrandLockupProps> = ({
  title,
  englishName = 'Hisaap',
  tagline,
  layout = 'horizontal',
  variant = 'app-icon',
  theme = 'auto',
  iconClassName,
  titleClassName,
  taglineClassName,
}) => {
  const showEnglishSuffix = !title.includes(englishName);

  if (layout === 'stacked') {
    return (
      <div className="flex flex-col items-center text-center">
        <HisaapLogoIcon
          variant={variant}
          theme={theme}
          className={iconClassName || 'w-16 h-16 drop-shadow-sm'}
        />
        <div
          className={
            titleClassName ||
            'mt-3.5 text-2xl font-bold tracking-tight text-[#0F6A3C] dark:text-slate-50 flex items-baseline justify-center gap-2'
          }
        >
          <span>{title}</span>
          {showEnglishSuffix && (
            <span className="text-sm font-semibold text-[#D4A017] tracking-normal">
              {englishName}
            </span>
          )}
        </div>
        <div
          className={
            taglineClassName ||
            'mt-1 text-xs font-medium text-slate-600 dark:text-slate-300'
          }
        >
          {tagline}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <HisaapLogoIcon
        variant={variant}
        theme={theme}
        className={iconClassName || 'w-9 h-9 shrink-0 drop-shadow-xs'}
      />
      <div className="min-w-0">
        <div
          className={
            titleClassName ||
            'text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate flex items-baseline gap-1.5'
          }
        >
          <span>{title}</span>
          {showEnglishSuffix && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ({englishName})
            </span>
          )}
        </div>
        <div
          className={
            taglineClassName ||
            'text-[11px] text-slate-500 dark:text-slate-400 truncate'
          }
        >
          {tagline}
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard: Minimal Jaapi-inspired geometric icon
 */
export const DashboardJaapiIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 4L14.2 7.2L19.5 14.5C20.3 15.6 19.6 17 18.2 17H5.8C4.4 17 3.7 15.6 4.5 14.5L9.8 7.2L12 4Z" />
    <path d="M8.5 11.5C10.7 10.6 13.3 10.6 15.5 11.5" />
    <path d="M12 4V17" />
    <path d="M6.5 20H17.5" />
  </svg>
);

/**
 * Transactions: Clean Ledger / Passbook icon
 */
export const TransactionsLedgerIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 4.5C5 3.67 5.67 3 6.5 3H18.5C19.05 3 19.5 3.45 19.5 4V20C19.5 20.55 19.05 21 18.5 21H6.5C5.67 21 5 20.33 5 19.5V4.5Z" />
    <path d="M8.5 3V21" />
    <path d="M11.5 8H16.5" />
    <path d="M11.5 12H16.5" />
    <path d="M11.5 16H14.5" />
  </svg>
);

/**
 * Loan Summary: Handshake + Currency (₹) inspired geometric icon
 */
export const LoansHandshakeRupeeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 5.5H15" />
    <path d="M9 8.2H15" />
    <path d="M11.5 5.5C12.8 5.5 13.6 6.3 13.6 7.5C13.6 8.7 12.6 9.6 11.2 9.6H9.8L13.5 12.8" />
    <path d="M3.5 15.5L7.5 13L11.2 15.5C12.1 16.1 13.3 16.1 14.2 15.4L17 13.2L20.5 15.5" />
    <path d="M6.5 18.2L9.5 19.8C10.9 20.5 12.6 20.5 14 19.8L17.5 18" />
  </svg>
);

/**
 * Reports: Analytics chart + Brahmaputra wave trend icon
 */
export const ReportsAnalyticsIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 19.5H20" />
    <path d="M6.5 16V12.5" />
    <path d="M11 16V9.5" />
    <path d="M15.5 16V11" />
    <path d="M19 16V6.5" />
    <path d="M5.5 9.5C8 9.5 9.2 6.5 11.5 6.5C13.5 6.5 14.3 8.2 16 7.8L19.5 5" />
  </svg>
);

/**
 * Settings: Modern Assamese pattern gear icon (Gamosa diamond core)
 */
export const SettingsAssameseGearIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.75V4.6M12 19.4V21.25M4.6 12H2.75M21.25 12H19.4M18.54 5.46L17.23 6.77M6.77 17.23L5.46 18.54M18.54 18.54L17.23 17.23M6.77 6.77L5.46 5.46" />
    <circle cx="12" cy="12" r="6.3" />
    <path d="M12 8.7L15.3 12L12 15.3L8.7 12L12 8.7Z" />
  </svg>
);

/**
 * Profile: Minimal Assamese-inspired avatar icon
 */
export const ProfileAssameseAvatarIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7.5 8.5L12 4.5L16.5 8.5" />
    <circle cx="12" cy="10.2" r="2.7" />
    <path d="M5.5 19.5C6.8 16.5 9.2 15.2 12 15.2C14.8 15.2 17.2 16.5 18.5 19.5" />
  </svg>
);
