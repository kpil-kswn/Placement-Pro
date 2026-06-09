export default function Logo({ className = "w-32" }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* The Monogram SVG Mark */}
      <svg 
        viewBox="0 5 100 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-16 h-auto text-gray-900"
      >
        {/* The Outer Oval */}
        <ellipse 
          cx="50" cy="65" rx="35" ry="55" 
          stroke="currentColor" 
          strokeWidth="2.5" 
        />
        
        {/* Left 'P' */}
        <text 
          x="38" y="85" 
          fontFamily="ui-serif, Georgia, serif" 
          fontSize="56" 
          textAnchor="middle" 
          fill="currentColor"
        >
          P
        </text>
        
        {/* Right 'P' - Positioned slightly lower/right to create the overlap */}
        <text 
          x="62" y="95" 
          fontFamily="ui-serif, Georgia, serif" 
          fontSize="56" 
          textAnchor="middle" 
          fill="currentColor"
          stroke="#f9fafb" /* This cuts out the background to make it look interlocked */
          strokeWidth="3"
          paintOrder="stroke"
        >
          P
        </text>
      </svg>
    </div>
  );
}