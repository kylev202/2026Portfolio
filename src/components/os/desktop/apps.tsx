import type { ComponentType, SVGProps } from "react";
import type { LaunchSpec } from "./WindowManager";
import {
  ContactIcon,
  OperatorIcon,
  PathIcon,
  ReadmeIcon,
  SettingsIcon,
  TerminalIcon,
  WorkIcon,
} from "./icons";
import TerminalApp from "./apps/TerminalApp";
import AboutApp from "./apps/AboutApp";
import ProjectsApp from "./apps/ProjectsApp";
import PathApp from "./apps/PathApp";
import ContactApp from "./apps/ContactApp";
import ReadmeApp from "./apps/ReadmeApp";
import SettingsApp from "./apps/SettingsApp";

export type AppDef = LaunchSpec & {
  /** Dock / icon / menu-bar display name. */
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  Component: ComponentType;
  /** App focuses its own first field on open (e.g. Terminal); skip container focus. */
  autoFocusContent?: boolean;
};

/**
 * The desktop's installed apps. `title` is the title-bar path; `defaultSize` is
 * the floating size on open; `minSize` floors the resize. Order here is the dock
 * and desktop-icon order.
 */
export const APPS: AppDef[] = [
  {
    id: "terminal",
    name: "Terminal",
    title: "~/uplink",
    Icon: TerminalIcon,
    Component: TerminalApp,
    defaultSize: { w: 560, h: 420 },
    minSize: { w: 340, h: 240 },
    autoFocusContent: true,
  },
  {
    id: "about",
    name: "About",
    title: "~/operator",
    Icon: OperatorIcon,
    Component: AboutApp,
    defaultSize: { w: 620, h: 540 },
    minSize: { w: 340, h: 300 },
  },
  {
    id: "projects",
    name: "Projects",
    title: "~/work",
    Icon: WorkIcon,
    Component: ProjectsApp,
    defaultSize: { w: 660, h: 560 },
    minSize: { w: 360, h: 300 },
  },
  {
    id: "path",
    name: "Experience",
    title: "~/path",
    Icon: PathIcon,
    Component: PathApp,
    defaultSize: { w: 560, h: 540 },
    minSize: { w: 340, h: 300 },
  },
  {
    id: "contact",
    name: "Contact",
    title: "~/contact",
    Icon: ContactIcon,
    Component: ContactApp,
    defaultSize: { w: 580, h: 480 },
    minSize: { w: 340, h: 300 },
  },
  {
    id: "readme",
    name: "Readme",
    title: "readme.md",
    Icon: ReadmeIcon,
    Component: ReadmeApp,
    defaultSize: { w: 540, h: 520 },
    minSize: { w: 340, h: 300 },
  },
  {
    id: "settings",
    name: "Settings",
    title: "~/settings",
    Icon: SettingsIcon,
    Component: SettingsApp,
    defaultSize: { w: 480, h: 520 },
    minSize: { w: 340, h: 320 },
  },
];

export const appById = (id: string): AppDef | undefined => APPS.find((a) => a.id === id);
