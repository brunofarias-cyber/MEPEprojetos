interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 40, className = "" }: BrandLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      data-testid="logo-brand"
    >
      <defs>
        <linearGradient id="bookGradient" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="plantGradient" x1="50" y1="100" x2="50" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15803d" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <path d="M10 75 C10 75 30 85 50 75 C70 65 90 75 90 75 V 85 C90 85 70 75 50 85 C30 95 10 85 10 85 V 75 Z" fill="url(#bookGradient)" opacity="0.8"/>
      <path d="M10 70 C10 70 30 80 50 70 C70 60 90 70 90 70 V 80 C90 80 70 70 50 80 C30 90 10 80 10 80 V 70 Z" fill="white" opacity="0.3"/>
      <path d="M50 75 V 85" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 75 Q 50 50 50 30" stroke="url(#plantGradient)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M50 50 Q 70 40 80 20 Q 60 20 50 50" fill="url(#plantGradient)"/>
      <path d="M50 40 Q 30 30 20 10 Q 40 10 50 40" fill="url(#plantGradient)" opacity="0.9"/>
      <circle cx="20" cy="10" r="4" fill="#8b5cf6"/>
      <circle cx="80" cy="20" r="4" fill="#8b5cf6"/>
      <circle cx="35" cy="25" r="3" fill="#8b5cf6"/>
      <circle cx="65" cy="30" r="3" fill="#8b5cf6"/>
      <line x1="50" y1="40" x2="20" y2="10" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5"/>
      <line x1="50" y1="50" x2="80" y2="20" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5"/>
      <line x1="50" y1="35" x2="35" y2="25" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}
