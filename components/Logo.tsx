interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon" | "white";
  className?: string;
}

// The mark is a Madhubani house sticker: kajal outline, haldi walls, sindoor fish at the door.
export function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const sizes = { sm: 28, md: 38, lg: 50 };
  const text = { sm: 18, md: 23, lg: 30 };
  const h = sizes[size];
  const onDark = variant === "white";
  const line = onDark ? "#FFF3E8" : "#1D1410";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={h} height={h} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* hard shadow */}
        <path d="M22 6L6 18V38H17V28H27V38H38V18L22 6Z" fill={onDark ? "#000" : "#1D1410"} />
        {/* house */}
        <path d="M20 4L4 16V36H15V26H25V36H36V16L20 4Z" fill="#FFC83D" stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
        {/* roof band */}
        <path d="M8 16.5L20 7.5L32 16.5" stroke="#D63A24" strokeWidth="3" strokeLinejoin="round" />
        {/* fish at the door — the Mithila sign of luck */}
        <path d="M14.5 21.5 C17 18.6 21 18.6 23.5 21.5 C21 24.4 17 24.4 14.5 21.5Z M23.3 21.5 L27 18.8 L26.2 21.5 L27 24.2Z" fill="#D63A24" stroke="#1D1410" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx="17" cy="21.1" r="0.9" fill="#fff" />
        {/* gulabi dot */}
        <circle cx="33" cy="7" r="3.2" fill="#FF8DB8" stroke={line} strokeWidth="1.6" />
      </svg>

      {variant !== "icon" && (
        <span
          className="leading-none select-none"
          style={{
            fontFamily: "var(--font-heading), sans-serif",
            fontSize: text[size],
            letterSpacing: "-0.04em",
            fontVariationSettings: '"wdth" 85, "opsz" 48',
            color: onDark ? "#FFF3E8" : "var(--text-primary)",
          }}
        >
          <span style={{ fontWeight: 500 }}>your</span>
          <span style={{ fontWeight: 800, color: onDark ? "#FFC83D" : "var(--primary)" }}>mithila</span>
        </span>
      )}
    </div>
  );
}

// Backward-compatible alias
export function LogoText({ className = "" }: { className?: string }) {
  return <Logo size="md" variant="full" className={className} />;
}
