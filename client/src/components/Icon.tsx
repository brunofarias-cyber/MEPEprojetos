interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className = "" }: IconProps) {
  const icons: Record<string, JSX.Element> = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />,
    users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />,
    plus: <line x1="12" y1="5" x2="12" y2="19" />,
    check: <polyline points="20 6 9 17 4 12" />,
    clock: <circle cx="12" cy="12" r="10" />,
    award: <circle cx="12" cy="8" r="7" />,
    calendar: <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />,
    barChart: <line x1="18" y1="20" x2="18" y2="10" />,
    settings: <circle cx="12" cy="12" r="3" />,
    leaf: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" />,
    edit: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />,
    x: <line x1="18" y1="6" x2="6" y2="18" />,
    alert: <circle cx="12" cy="12" r="10" />,
    grid: <rect x="3" y="3" width="7" height="7" />,
    rocket: <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />,
    logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
    upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
    download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
    link: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  };

  const extras: Record<string, JSX.Element> = {
    book: <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />,
    users: <circle cx="9" cy="7" r="4" />,
    plus: <line x1="5" y1="12" x2="19" y2="12" />,
    calendar: <line x1="16" y1="2" x2="16" y2="6" />,
    alert: <line x1="12" y1="8" x2="12" y2="12" />,
    grid: <rect x="14" y="3" width="7" height="7" />,
    barChart: <line x1="12" y1="20" x2="12" y2="4" />,
    link: <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    x: <line x1="6" y1="18" x2="18" y2="6" />,
  };

  const extras2: Record<string, JSX.Element> = {
    calendar: <line x1="8" y1="2" x2="8" y2="6" />,
    alert: <line x1="12" y1="16" x2="12.01" y2="16" />,
    grid: <rect x="14" y="14" width="7" height="7" />,
    barChart: <line x1="6" y1="20" x2="6" y2="14" />,
  };

  const extras3: Record<string, JSX.Element> = {
    calendar: <line x1="3" y1="10" x2="21" y2="10" />,
    grid: <rect x="3" y="14" width="7" height="7" />,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name]}
      {extras[name]}
      {extras2[name]}
      {extras3[name]}
    </svg>
  );
}
