// Bold SVG network illustration - orbital rings and interconnected nodes
// Phase 3c: Enhanced for visibility with larger nodes and thicker lines

export function NetworkBackground() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Orbital rings - centered, planetary style - THICKER */}
      <ellipse
        cx="960"
        cy="400"
        rx="450"
        ry="140"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="10 8"
        opacity="0.45"
      />
      <ellipse
        cx="960"
        cy="400"
        rx="600"
        ry="200"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 12"
        opacity="0.35"
      />
      <ellipse
        cx="960"
        cy="400"
        rx="320"
        ry="90"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.40"
      />

      {/* Primary nodes - LARGER, positioned on orbits */}
      <circle cx="510" cy="360" r="12" fill="currentColor" opacity="0.5" />
      <circle cx="1410" cy="440" r="14" fill="currentColor" opacity="0.45" />
      <circle cx="960" cy="260" r="10" fill="currentColor" opacity="0.55" />
      <circle cx="640" cy="540" r="12" fill="currentColor" opacity="0.4" />
      <circle cx="1280" cy="260" r="11" fill="currentColor" opacity="0.5" />

      {/* Secondary nodes - scattered across canvas - LARGER */}
      <circle cx="180" cy="130" r="8" fill="currentColor" opacity="0.35" />
      <circle cx="1720" cy="180" r="10" fill="currentColor" opacity="0.4" />
      <circle cx="130" cy="580" r="11" fill="currentColor" opacity="0.35" />
      <circle cx="1820" cy="680" r="9" fill="currentColor" opacity="0.4" />
      <circle cx="380" cy="880" r="10" fill="currentColor" opacity="0.4" />
      <circle cx="1520" cy="930" r="12" fill="currentColor" opacity="0.35" />
      <circle cx="780" cy="830" r="8" fill="currentColor" opacity="0.4" />
      <circle cx="1120" cy="730" r="10" fill="currentColor" opacity="0.45" />

      {/* Tertiary nodes - accent dots - BIGGER */}
      <circle cx="300" cy="340" r="5" fill="currentColor" opacity="0.35" />
      <circle cx="1600" cy="430" r="5" fill="currentColor" opacity="0.35" />
      <circle cx="700" cy="680" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="1220" cy="580" r="5" fill="currentColor" opacity="0.35" />
      <circle cx="460" cy="180" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="1420" cy="130" r="6" fill="currentColor" opacity="0.35" />

      {/* Connecting lines - network graph style - THICKER */}
      <line x1="510" y1="360" x2="640" y2="540" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <line x1="640" y1="540" x2="780" y2="830" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="960" y1="260" x2="1280" y2="260" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <line x1="1280" y1="260" x2="1410" y2="440" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <line x1="1410" y1="440" x2="1600" y2="430" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="180" y1="130" x2="300" y2="340" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="300" y1="340" x2="510" y2="360" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="1120" y1="730" x2="1220" y2="580" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="1220" y1="580" x2="1410" y2="440" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="380" y1="880" x2="780" y2="830" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="780" y1="830" x2="1120" y2="730" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="1520" y1="930" x2="1820" y2="680" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />

      {/* Additional density - bottom section */}
      <circle cx="280" cy="730" r="7" fill="currentColor" opacity="0.35" />
      <circle cx="580" cy="630" r="8" fill="currentColor" opacity="0.3" />
      <circle cx="1670" cy="530" r="7" fill="currentColor" opacity="0.35" />
      <line x1="280" y1="730" x2="380" y2="880" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <line x1="580" y1="630" x2="700" y2="680" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <line x1="1670" y1="530" x2="1820" y2="680" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      
      {/* Extra cluster - upper right for visual balance */}
      <circle cx="1650" cy="280" r="8" fill="currentColor" opacity="0.4" />
      <circle cx="1750" cy="350" r="6" fill="currentColor" opacity="0.35" />
      <line x1="1650" y1="280" x2="1720" y2="180" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="1650" y1="280" x2="1750" y2="350" stroke="currentColor" strokeWidth="1.5" opacity="0.18" />
    </svg>
  );
}
