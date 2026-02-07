// Decorative geometric line elements for editorial design
// Phase 3c: Enhanced with larger defaults, thicker strokes, higher opacity

interface DecorativeProps {
  className?: string;
  size?: number;
}

// L-shaped corner bracket for framing hero sections - LARGER, THICKER
export function CornerBracket({ className = "", size = 120 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 120 L0 0 L120 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.30"
      />
    </svg>
  );
}

// Flipped corner bracket (bottom-right orientation) - LARGER, THICKER
export function CornerBracketFlipped({ className = "", size = 120 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M120 0 L120 120 L0 120"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.30"
      />
    </svg>
  );
}

// Vertical connector line for linking elements - THICKER
export function VerticalConnector({ className = "", size = 100 }: DecorativeProps) {
  return (
    <svg
      width="3"
      height={size}
      viewBox={`0 0 3 ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line
        x1="1.5"
        y1="0"
        x2="1.5"
        y2={size}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 10"
        opacity="0.30"
      />
    </svg>
  );
}

// Asymmetric horizontal section divider - BOLDER
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px ${className}`}>
      <div 
        className="absolute left-[10%] right-[35%] h-[2px] bg-charcoal"
        style={{ opacity: 0.25 }}
      />
    </div>
  );
}

// Small sparkle accent for decoration - BIGGER, MORE VISIBLE
export function SparkleAccent({ className = "", size = 28 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14 0 L14 28 M0 14 L28 14 M4 4 L24 24 M24 4 L4 24"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
      />
    </svg>
  );
}

// Medium sparkle for section markers (32-40px)
export function MediumSparkle({ className = "", size = 36 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18 0 L19 15 L36 18 L19 21 L18 36 L17 21 L0 18 L17 15 Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}
