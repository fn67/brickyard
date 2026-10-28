// Line icons used across the interface. All are decorative: the button text or aria-label names them.

interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function Svg({ size = 18, strokeWidth = 1.75, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden="true">
      <g fill="currentColor">
        <rect x="0" y="0" width="1" height="2" />
        <rect x="4" y="0" width="1" height="2" />
        <rect x="1" y="1" width="3" height="1" />
        <rect x="1" y="2" width="1" height="2" />
        <rect x="3" y="2" width="1" height="2" />
        <rect x="2" y="3" width="1" height="1" />
        <rect x="0" y="4" width="1" height="1" />
        <rect x="4" y="4" width="1" height="1" />
      </g>
    </svg>
  );
}

export const SunIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Svg>
);

export const MoonIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg size={18} strokeWidth={1.9} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const ShuffleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </Svg>
);

export const CubeIcon = (p: IconProps) => (
  <Svg size={15} strokeWidth={1.9} {...p}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </Svg>
);

export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

export const DownloadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const WarningIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

export const MinusIcon = (p: IconProps) => (
  <Svg size={16} strokeWidth={2} {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg size={16} strokeWidth={2} {...p}>
    <path d="M5 12h14M12 5v14" />
  </Svg>
);

export const GridIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
);

export const LayersIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <path d="m12 2 10 5-10 5L2 7l10-5Z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </Svg>
);

export const DropIcon = (p: IconProps) => (
  <Svg size={20} {...p}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </Svg>
);
