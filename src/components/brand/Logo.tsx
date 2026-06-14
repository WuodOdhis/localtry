export function Logo({ size = 32, variant = "full" }: { size?: number; variant?: "icon" | "word" | "full" }) {
  const icon = (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg)" />
      <path
        d="M22 12h-3V9a3 3 0 00-6 0v3h-3a1 1 0 00-1 1v8a3 3 0 003 3h8a3 3 0 003-3V13a1 1 0 00-1-1zm-7-3a1 1 0 012 0v3h-2V9zm4 10a2 2 0 11-4 0 2 2 0 014 0z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );

  if (variant === "icon") return icon;

  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex flex-col">
        <span className="font-bold tracking-tight leading-none" style={{ fontSize: size * 0.5 }}>
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            ChajiPay
          </span>
        </span>
        {variant === "full" && (
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase leading-tight mt-0.5">
            Lipa Chaji Wako
          </span>
        )}
      </div>
    </div>
  );
}
