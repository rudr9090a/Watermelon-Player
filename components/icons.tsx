import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    focusable: "false" as const,
    ...rest,
  };
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function Eye(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export function AlertCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function CheckCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21.8 10A10 10 0 1 1 17 3.34" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function Library(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M16 12H3" />
      <path d="M16 18H3" />
      <path d="M10 6H3" />
      <path d="M21 6v12" />
      <path d="M21 6h-1.5" />
      <circle cx="19.5" cy="6" r="1.5" />
    </svg>
  );
}

export function Server(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect width="18" height="7" x="3" y="3" rx="2" />
      <rect width="18" height="7" x="3" y="14" rx="2" />
      <path d="M7 6.5h.01" />
      <path d="M7 17.5h.01" />
      <path d="M11 6.5h6" />
      <path d="M11 17.5h6" />
    </svg>
  );
}

export function ShieldCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Music(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function Heart(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

export function Play(props: IconProps) {
  return (
    <svg {...base({ fill: "currentColor", stroke: "none", ...props })}>
      <path d="M6 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 6 4.5Z" />
    </svg>
  );
}

export function Pause(props: IconProps) {
  return (
    <svg {...base({ fill: "currentColor", stroke: "none", ...props })}>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
    </svg>
  );
}

export function LogOut(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function SkipBack(props: IconProps) {
  return (
    <svg {...base({ fill: "currentColor", stroke: "none", ...props })}>
      <path d="M6 4.5a1 1 0 0 1 2 0v15a1 1 0 0 1-2 0Z" />
      <path d="M18.5 5.2v13.6a1 1 0 0 1-1.53.85l-10-6.8a1 1 0 0 1 0-1.7l10-6.8a1 1 0 0 1 1.53.85Z" />
    </svg>
  );
}

export function SkipForward(props: IconProps) {
  return (
    <svg {...base({ fill: "currentColor", stroke: "none", ...props })}>
      <path d="M16 4.5a1 1 0 0 1 2 0v15a1 1 0 0 1-2 0Z" />
      <path d="M5.5 5.2v13.6a1 1 0 0 0 1.53.85l10-6.8a1 1 0 0 0 0-1.7l-10-6.8a1 1 0 0 0-1.53.85Z" />
    </svg>
  );
}

export function Shuffle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h3.5l2.5 3" />
      <path d="M3 17h3.5l9-10H21" />
      <path d="m18 4 3 3-3 3" />
      <path d="M15.5 13.5 18 17h3" />
      <path d="m18 14 3 3-3 3" />
    </svg>
  );
}

export function Repeat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function Volume(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function Home(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function Sparkles(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M4.2 4.2 6.3 6.3" />
      <path d="m17.7 17.7 2.1 2.1" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <path d="m4.2 19.8 2.1-2.1" />
      <path d="m17.7 6.3 2.1-2.1" />
      <path d="M12 8.5 13.6 12 12 15.5 10.4 12 12 8.5Z" />
    </svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Github(props: IconProps) {
  return (
    <svg {...base({ fill: "currentColor", stroke: "none", ...props })}>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function WatermelonMark(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 0, ...props })}>
      <rect x="3" y="9" width="2.6" height="6" rx="1.3" fill="currentColor" />
      <rect x="7.2" y="5" width="2.6" height="14" rx="1.3" fill="currentColor" />
      <rect x="11.4" y="8" width="2.6" height="10" rx="1.3" fill="currentColor" />
      <rect x="15.6" y="3" width="2.6" height="18" rx="1.3" fill="currentColor" />
      <rect x="19.8" y="10" width="1.6" height="7" rx="0.8" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
