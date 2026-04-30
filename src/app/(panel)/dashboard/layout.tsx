// src/app/(panel)/dashboard/layout.tsx
import { SidebarDashboard } from "./_components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarDashboard>
      {children}
    </SidebarDashboard>
  )
}