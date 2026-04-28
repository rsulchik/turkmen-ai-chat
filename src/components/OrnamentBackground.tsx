interface OrnamentBackgroundProps {
  opacity?: number;
  className?: string;
}

export function OrnamentBackground({ opacity = 0.06, className = "" }: OrnamentBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 bg-carpet ${className}`}
      style={{ opacity }}
    />
  );
}
