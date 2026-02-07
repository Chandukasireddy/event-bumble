// Static SVG network illustration - orbital rings and interconnected nodes
// Rendered at low opacity as fixed background

export function NetworkBackground() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Orbital rings - centered, planetary style */}
      <ellipse
        cx="960"
        cy="400"
        rx="400"
        ry="120"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="8 8"
        opacity="0.3"
      />
      <ellipse
        cx="960"
        cy="400"
        rx="550"
        ry="180"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 12"
        opacity="0.2"
      />
      <ellipse
        cx="960"
        cy="400"
        rx="300"
        ry="80"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.25"
      />

      {/* Primary nodes - larger, positioned on orbits */}
      <circle cx="560" cy="380" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="1360" cy="420" r="8" fill="currentColor" opacity="0.35" />
      <circle cx="960" cy="280" r="5" fill="currentColor" opacity="0.45" />
      <circle cx="660" cy="520" r="7" fill="currentColor" opacity="0.3" />
      <circle cx="1260" cy="280" r="6" fill="currentColor" opacity="0.4" />

      {/* Secondary nodes - scattered across canvas */}
      <circle cx="200" cy="150" r="4" fill="currentColor" opacity="0.25" />
      <circle cx="1700" cy="200" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="150" cy="600" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="1800" cy="700" r="4" fill="currentColor" opacity="0.25" />
      <circle cx="400" cy="900" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="1500" cy="950" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="800" cy="850" r="4" fill="currentColor" opacity="0.25" />
      <circle cx="1100" cy="750" r="5" fill="currentColor" opacity="0.3" />

      {/* Tertiary nodes - tiny accent dots */}
      <circle cx="320" cy="350" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="1580" cy="450" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="720" cy="700" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="1200" cy="600" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="480" cy="200" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="1400" cy="150" r="3" fill="currentColor" opacity="0.2" />

      {/* Connecting lines - network graph style */}
      <line x1="560" y1="380" x2="660" y2="520" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="660" y1="520" x2="800" y2="850" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="960" y1="280" x2="1260" y2="280" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="1260" y1="280" x2="1360" y2="420" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="1360" y1="420" x2="1580" y2="450" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="200" y1="150" x2="320" y2="350" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="320" y1="350" x2="560" y2="380" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="1100" y1="750" x2="1200" y2="600" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="1200" y1="600" x2="1360" y2="420" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="400" y1="900" x2="800" y2="850" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="800" y1="850" x2="1100" y2="750" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="1500" y1="950" x2="1800" y2="700" stroke="currentColor" strokeWidth="1" opacity="0.08" />

      {/* Lower density network - bottom section */}
      <circle cx="300" cy="750" r="3" fill="currentColor" opacity="0.2" />
      <circle cx="600" cy="650" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="1650" cy="550" r="3" fill="currentColor" opacity="0.2" />
      <line x1="300" y1="750" x2="400" y2="900" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <line x1="600" y1="650" x2="720" y2="700" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <line x1="1650" y1="550" x2="1800" y2="700" stroke="currentColor" strokeWidth="1" opacity="0.08" />
    </svg>
  );
}
