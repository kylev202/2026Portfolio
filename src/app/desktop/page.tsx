import type { Metadata } from "next";
import DesktopShell from "@/components/os/desktop/DesktopShell";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Desktop",
  description: `Operate ${profile.name}'s portfolio as a live desktop: windowed apps, a real terminal, and the work one click away.`,
};

export default function DesktopPage() {
  return <DesktopShell />;
}
