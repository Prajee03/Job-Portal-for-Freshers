import React from 'react';

export function LaunchGradLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" fill="#2A14B4" />
      <path
        d="M12 26.5L20 11.5L28 26.5H23.2L20 20.1L16.8 26.5H12Z"
        fill="#FFFFFF"
      />
      <circle cx="28.5" cy="12.5" r="3.5" fill="#6FFFB3" />
    </svg>
  );
}

export function UserAvatar({
  name,
  size = 'md',
  showOnline = false,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
      ? 'w-16 h-16 text-xl'
      : 'w-10 h-10 text-sm';

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${dims} rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-display font-bold flex items-center justify-center ring-2 ring-primary-fixed shadow-xs select-none`}
        aria-label={name}
      >
        {initials}
      </div>
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest"
          title="Ready to Join"
        />
      )}
    </div>
  );
}

export function CompanyBadge({
  iconName,
  accent,
  size = 'md',
}: {
  iconName: string;
  accent: 'indigo' | 'emerald' | 'amber' | 'slate';
  size?: 'md' | 'lg';
}) {
  const toneClasses = {
    indigo: 'bg-primary-fixed text-primary',
    emerald: 'bg-secondary-container/70 text-on-secondary-fixed-variant',
    amber: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    slate: 'bg-surface-container-high text-on-surface-variant',
  }[accent];

  const boxSize = size === 'lg' ? 'w-14 h-14 rounded-2xl' : 'w-12 h-12 rounded-xl';
  const iconSize = size === 'lg' ? 'text-[28px]' : 'text-[24px]';

  return (
    <div
      className={`${boxSize} ${toneClasses} flex items-center justify-center shrink-0 shadow-2xs`}
    >
      <span className={`material-symbols-outlined ${iconSize}`}>{iconName}</span>
    </div>
  );
}

export function CultureSceneCard({
  label,
  variant,
}: {
  label: string;
  variant: 'hub' | 'pod';
}) {
  return (
    <div className="rounded-xl overflow-hidden bg-surface-container-high h-32 relative border border-outline-variant/30 flex items-center justify-center">
      {variant === 'hub' ? (
        <svg
          viewBox="0 0 320 160"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="55%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <rect width="320" height="160" fill="url(#hubGrad)" />
          <rect x="28" y="34" width="110" height="96" rx="8" fill="#ffffff" fillOpacity="0.1" />
          <rect x="40" y="48" width="86" height="10" rx="3" fill="#c3c0ff" fillOpacity="0.45" />
          <rect x="40" y="66" width="64" height="8" rx="3" fill="#6ffbbe" fillOpacity="0.55" />
          <rect x="156" y="22" width="136" height="108" rx="8" fill="#ffffff" fillOpacity="0.08" />
          <circle cx="224" cy="72" r="26" fill="#6ffbbe" fillOpacity="0.2" />
          <circle cx="224" cy="72" r="12" fill="#6ffbbe" fillOpacity="0.65" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 320 160"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="podGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#131b2e" />
              <stop offset="60%" stopColor="#372abf" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <rect width="320" height="160" fill="url(#podGrad)" />
          <circle cx="112" cy="68" r="22" fill="#e3dfff" fillOpacity="0.25" />
          <circle cx="168" cy="62" r="24" fill="#6ffbbe" fillOpacity="0.25" />
          <circle cx="218" cy="70" r="20" fill="#ffddb8" fillOpacity="0.25" />
          <rect x="74" y="102" width="172" height="14" rx="7" fill="#ffffff" fillOpacity="0.16" />
        </svg>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
        <span className="text-xs font-semibold tracking-tight truncate">{label}</span>
        <span className="material-symbols-outlined text-[16px] opacity-85">
          {variant === 'hub' ? 'apartment' : 'groups'}
        </span>
      </div>
    </div>
  );
}
