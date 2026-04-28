interface TurkmenLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function TurkmenLogo({ size = "md", showText = true }: TurkmenLogoProps) {
  const dim = size === "lg" ? 56 : size === "md" ? 36 : 28;
  const textSize = size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-sm";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative shrink-0 rounded-xl bg-gradient-primary shadow-emerald flex items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="w-3/4 h-3/4"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Göl — туркменский ковровый ромб */}
          <path
            d="M24 4 L44 24 L24 44 L4 24 Z"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M24 12 L36 24 L24 36 L12 24 Z"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M24 18 L30 24 L24 30 L18 24 Z"
            fill="hsl(var(--accent))"
          />
          <circle cx="24" cy="24" r="1.8" fill="hsl(var(--primary-foreground))" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-bold tracking-tight ${textSize} text-gradient-gold`}>
            Turkmen AI
          </span>
          {size === "lg" && (
            <span className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
              Akylly kömekçi
            </span>
          )}
        </div>
      )}
    </div>
  );
}
