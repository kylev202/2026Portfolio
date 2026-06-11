import type { SVGProps } from "react";

/**
 * Minimal monoline icon set for the desktop. Drawn on a 24px grid, 1.5 stroke,
 * `currentColor` only — no fills, no second hue. They read as instrument marks,
 * not skeuomorphic app tiles (deliberately off the rounded-icon template).
 */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function TerminalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M7 9l3 3-3 3" />
      <path d="M13 15h4" />
    </svg>
  );
}

export function OperatorIcon(props: IconProps) {
  // A small console readout — three meta rows, one active.
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M7 9h6" />
      <path d="M7 12.5h10" />
      <path d="M7 16h4" />
      <circle cx="17.5" cy="9" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WorkIcon(props: IconProps) {
  // Stacked volumes / mounted drives.
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="5" rx="1.2" />
      <rect x="3.5" y="14" width="17" height="5" rx="1.2" />
      <circle cx="7" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PathIcon(props: IconProps) {
  // A commit spine with nodes.
  return (
    <svg {...base(props)}>
      <path d="M7 3v18" />
      <circle cx="7" cy="6" r="2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M9 6h4a3 3 0 0 1 3 3v3" />
      <circle cx="16" cy="14" r="2" />
    </svg>
  );
}

export function ContactIcon(props: IconProps) {
  // An open channel / signal.
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M14.8 14.5a4 4 0 1 1 1-5.8" />
      <path d="M17 17a8 8 0 1 0-2-12" />
    </svg>
  );
}

export function ReadmeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 15.5h6" />
      <path d="M9 8.5h2" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  // Sliders, not a gear — fits the instrument over the template gear.
  return (
    <svg {...base(props)}>
      <path d="M4 7h10" />
      <circle cx="17" cy="7" r="2.2" />
      <path d="M20 17H10" />
      <circle cx="7" cy="17" r="2.2" />
    </svg>
  );
}

export function PowerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v7" />
      <path d="M7.5 7a7 7 0 1 0 9 0" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
