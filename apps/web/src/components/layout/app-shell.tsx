"use client";

import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0f1a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay sidebar backdrop — sidebar hidden on mobile, so this
          is a placeholder for a future mobile drawer implementation */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/60 md:hidden",
          // Hidden for now — will be wired up when mobile drawer is added
          "hidden"
        )}
        aria-hidden="true"
      />

      {/* Main content column */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden",
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Scrollable content area */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "p-6",
            // Subtle grid pattern for the terminal feel
            "bg-[#0a0f1a]"
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              // Cap max width for readability on ultra-wide screens
              "max-w-screen-2xl"
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar collapse indicator line — visual affordance */}
      <style>{`
        /* Ensure smooth sidebar transitions don't cause layout shift */
        aside {
          will-change: width;
        }
      `}</style>
    </div>
  );
}

// Re-export collapsed state hook for convenience
export { useSidebarStore } from "@/stores/sidebar";
