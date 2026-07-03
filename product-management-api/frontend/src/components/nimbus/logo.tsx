export function NimbusLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="nimbus-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.70 0.22 275)" />
          <stop offset="1" stopColor="oklch(0.85 0.15 200)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#nimbus-g)" />
      <path
        d="M9 21V11l7 7v-7h1l6 6v3H9z"
        fill="oklch(0.15 0.02 260)"
        opacity="0.85"
      />
      <circle cx="22" cy="11" r="2" fill="oklch(0.99 0 0)" opacity="0.9" />
    </svg>
  );
}

export function NimbusWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <NimbusLogo />
      <span className="text-lg font-semibold tracking-tight">Nimbus</span>
    </div>
  );
}
