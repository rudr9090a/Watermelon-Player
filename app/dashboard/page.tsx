import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your self-hosted Watermelon music library.",
};

export default function DashboardPage() {
  return <DashboardApp />;
}
