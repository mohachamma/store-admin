import type { ReactNode } from "react";
import { BottomBar } from "@/components/shell/BottomBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-[calc(var(--bottombar-h)+env(safe-area-inset-bottom)+1.5rem)] pt-5 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
