export function DitheringPattern() {
  return (
    <svg width="0" height="0">
      <defs>
        {/* Dithering patterns */}
        <pattern id="dither-light" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#000000" />
          <rect width="1" height="1" x="0" y="0" fill="#ffffff" />
          <rect width="1" height="1" x="2" y="2" fill="#ffffff" />
        </pattern>
        
        <pattern id="dither-medium" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#000000" />
          <rect width="1" height="1" x="0" y="0" fill="#cccccc" />
          <rect width="1" height="1" x="2" y="0" fill="#cccccc" />
          <rect width="1" height="1" x="1" y="1" fill="#cccccc" />
          <rect width="1" height="1" x="3" y="1" fill="#cccccc" />
          <rect width="1" height="1" x="0" y="2" fill="#cccccc" />
          <rect width="1" height="1" x="2" y="2" fill="#cccccc" />
        </pattern>
        
        <pattern id="dither-heavy" patternUnits="userSpaceOnUse" width="2" height="2">
          <rect width="2" height="2" fill="#ffffff" />
          <rect width="1" height="1" x="0" y="0" fill="#000000" />
          <rect width="1" height="1" x="1" y="1" fill="#000000" />
        </pattern>

        <pattern id="dither-pink" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#000000" />
          <rect width="1" height="1" x="0" y="1" fill="#888888" />
          <rect width="1" height="1" x="1" y="0" fill="#888888" />
          <rect width="1" height="1" x="2" y="3" fill="#888888" />
          <rect width="1" height="1" x="3" y="2" fill="#888888" />
        </pattern>

        <pattern id="dither-green" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#000000" />
          <rect width="1" height="1" x="1" y="1" fill="#aaaaaa" />
          <rect width="1" height="1" x="3" y="3" fill="#aaaaaa" />
        </pattern>

        <pattern id="scanlines" patternUnits="userSpaceOnUse" width="100%" height="4">
          <rect width="100%" height="1" fill="#000000" fillOpacity="0.3" />
          <rect width="100%" height="1" y="2" fill="#000000" fillOpacity="0.1" />
        </pattern>

        {/* Animated patterns */}
        <pattern id="moving-dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="1" fill="#ffffff">
            <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </pattern>

        <pattern id="moving-lines" patternUnits="userSpaceOnUse" width="10" height="10">
          <line x1="0" y1="0" x2="10" y2="10" stroke="#ffffff" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
          </line>
        </pattern>
      </defs>
    </svg>
  );
}