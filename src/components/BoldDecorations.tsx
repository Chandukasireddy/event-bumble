// Bold decorative SVG elements for Phase 3c - Make It Unmissable
// Large, visible decorative components that create immediate visual impact

interface DecorationProps {
  className?: string;
  size?: number;
}

// Large 4-point sparkle - MeetSpark brand mark (120-150px default)
export function LargeSparkle({ className = "", size = 120 }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 4-point star shape */}
      <path
        d="M60 0 L65 50 L120 60 L65 70 L60 120 L55 70 L0 60 L55 50 Z"
        fill="currentColor"
        opacity="0.35"
      />
      {/* Inner glow */}
      <path
        d="M60 20 L63 52 L100 60 L63 68 L60 100 L57 68 L20 60 L57 52 Z"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  );
}

// Network cluster - interconnected nodes (100-120px)
export function NetworkCluster({ className = "", size = 100 }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Connection lines */}
      <line x1="20" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="50" y1="50" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="50" y1="50" x2="75" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="50" y1="50" x2="30" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="20" y1="30" x2="30" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <line x1="80" y1="25" x2="75" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      
      {/* Nodes - varying sizes */}
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.5" /> {/* Central large */}
      <circle cx="20" cy="30" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="25" r="7" fill="currentColor" opacity="0.45" />
      <circle cx="75" cy="70" r="5" fill="currentColor" opacity="0.4" />
      <circle cx="30" cy="75" r="6" fill="currentColor" opacity="0.45" />
      {/* Smaller accent nodes */}
      <circle cx="35" cy="40" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="65" cy="38" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// Large orbital decoration for hero sections (300-400px)
export function OrbitalDecoration({ className = "", size = 350 }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Orbital rings */}
      <ellipse
        cx="175"
        cy="175"
        rx="150"
        ry="60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="8 6"
        opacity="0.4"
      />
      <ellipse
        cx="175"
        cy="175"
        rx="120"
        ry="45"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <ellipse
        cx="175"
        cy="175"
        rx="85"
        ry="30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 8"
        opacity="0.3"
      />
      
      {/* Orbital nodes - positioned along rings */}
      <circle cx="325" cy="175" r="10" fill="currentColor" opacity="0.5" />
      <circle cx="25" cy="175" r="8" fill="currentColor" opacity="0.4" />
      <circle cx="175" cy="115" r="7" fill="currentColor" opacity="0.45" />
      <circle cx="280" cy="200" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="70" cy="150" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="175" cy="235" r="5" fill="currentColor" opacity="0.35" />
      
      {/* Small accent nodes */}
      <circle cx="230" cy="140" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="120" cy="210" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="260" cy="195" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="90" cy="160" r="3" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

// Large corner bracket (150-180px) with thicker 2px stroke
export function LargeBracket({ className = "", size = 150 }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 150 L0 0 L150 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.30"
      />
    </svg>
  );
}

// Flipped large bracket (bottom-right orientation)
export function LargeBracketFlipped({ className = "", size = 150 }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M150 0 L150 150 L0 150"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.30"
      />
    </svg>
  );
}

// Circle divider - row of connected circles (250-300px width)
export function CircleDivider({ className = "", width = 280 }: { className?: string; width?: number }) {
  const circleCount = 7;
  const spacing = width / (circleCount - 1);
  
  return (
    <svg
      width={width}
      height="24"
      viewBox={`0 0 ${width} 24`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Connecting line */}
      <line 
        x1="8" 
        y1="12" 
        x2={width - 8} 
        y2="12" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        opacity="0.25" 
      />
      {/* Circles */}
      {Array.from({ length: circleCount }).map((_, i) => (
        <circle
          key={i}
          cx={8 + i * spacing}
          cy="12"
          r={i % 2 === 0 ? 6 : 4}
          fill="currentColor"
          opacity={0.35 + (i % 2) * 0.15}
        />
      ))}
    </svg>
  );
}

// Feature connecting line - dashed diagonal
export function FeatureConnector({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none ${className}`}
      width="100%"
      height="100%"
      viewBox="0 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Connecting path from feature 1 → 2 → 3 */}
      <path
        d="M120 80 Q 300 150, 400 280 Q 500 380, 650 160"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="8 8"
        fill="none"
        opacity="0.20"
      />
    </svg>
  );
}

// Bold sparkle for event titles (24-32px)
export function TitleSparkle({ className = "", size = 24 }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 0 L13 10 L24 12 L13 14 L12 24 L11 14 L0 12 L11 10 Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
