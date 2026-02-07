// Geometric line-art icons inspired by reference images
// Fine-line drawings, 1px stroke weight, monochrome

interface IconProps {
  className?: string;
  size?: number;
}

// Layered squares/diamonds - for "Shareable Forms"
export function LayeredDiamondsIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer diamond */}
      <rect
        x="32"
        y="4"
        width="40"
        height="40"
        rx="1"
        transform="rotate(45 32 4)"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Middle diamond */}
      <rect
        x="32"
        y="14"
        width="25.5"
        height="25.5"
        rx="1"
        transform="rotate(45 32 14)"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Inner diamond */}
      <rect
        x="32"
        y="22"
        width="14"
        height="14"
        rx="0.5"
        transform="rotate(45 32 22)"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Center dot */}
      <circle cx="32" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

// Overlapping circles - for "AI Matching"
export function OverlappingCirclesIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top circle */}
      <circle cx="32" cy="20" r="14" stroke="currentColor" strokeWidth="1" />
      {/* Bottom-left circle */}
      <circle cx="20" cy="38" r="14" stroke="currentColor" strokeWidth="1" />
      {/* Bottom-right circle */}
      <circle cx="44" cy="38" r="14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// Radiating sunburst - for "Meeting Requests"
export function SunburstIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center circle */}
      <circle cx="32" cy="32" r="6" stroke="currentColor" strokeWidth="1" />
      {/* Radiating lines */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const x1 = 32 + 10 * Math.cos(rad);
        const y1 = 32 + 10 * Math.sin(rad);
        const x2 = 32 + (i % 2 === 0 ? 26 : 20) * Math.cos(rad);
        const y2 = 32 + (i % 2 === 0 ? 26 : 20) * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

// Stacked layers - alternative icon
export function StackedLayersIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Layer 1 (bottom) */}
      <path
        d="M8 44 L32 54 L56 44 L32 34 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      {/* Layer 2 */}
      <path
        d="M8 36 L32 46 L56 36 L32 26 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      {/* Layer 3 */}
      <path
        d="M8 28 L32 38 L56 28 L32 18 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      {/* Layer 4 (top) */}
      <path
        d="M8 20 L32 30 L56 20 L32 10 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

// Sparkle/star icon for logo
export function SparkleIcon({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 2 L18 12 L28 14 L18 16 L16 26 L14 16 L4 14 L14 12 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="currentColor"
      />
    </svg>
  );
}

// Network nodes icon
export function NetworkNodesIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center node */}
      <circle cx="32" cy="32" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
      {/* Surrounding nodes */}
      <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="48" cy="16" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="16" cy="48" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="48" cy="48" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
      {/* Connecting lines */}
      <line x1="28" y1="28" x2="19" y2="19" stroke="currentColor" strokeWidth="1" />
      <line x1="36" y1="28" x2="45" y2="19" stroke="currentColor" strokeWidth="1" />
      <line x1="28" y1="36" x2="19" y2="45" stroke="currentColor" strokeWidth="1" />
      <line x1="36" y1="36" x2="45" y2="45" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
