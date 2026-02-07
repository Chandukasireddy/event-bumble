// Decorative geometric line elements for editorial design

interface DecorativeProps {
  className?: string;
  size?: number;
}

// L-shaped corner bracket for framing hero sections
export function CornerBracket({ className = "", size = 80 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 80 L0 0 L80 0"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
}

// Flipped corner bracket (bottom-right orientation)
export function CornerBracketFlipped({ className = "", size = 80 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M80 0 L80 80 L0 80"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
}

// Vertical connector line for linking elements
export function VerticalConnector({ className = "", size = 100 }: DecorativeProps) {
  return (
    <svg
      width="2"
      height={size}
      viewBox={`0 0 2 ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line
        x1="1"
        y1="0"
        x2="1"
        y2={size}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 8"
        opacity="0.2"
      />
    </svg>
  );
}

// Asymmetric horizontal section divider
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px ${className}`}>
      <div 
        className="absolute left-[15%] right-[40%] h-px bg-charcoal"
        style={{ opacity: 0.15 }}
      />
    </div>
  );
}

// Small sparkle accent for decoration
export function SparkleAccent({ className = "", size = 16 }: DecorativeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 0 L8 16 M0 8 L16 8 M2.34 2.34 L13.66 13.66 M13.66 2.34 L2.34 13.66"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}
