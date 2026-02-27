"use client";

import { type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Rocket,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Command Center", href: "/", icon: Home },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Launches", href: "/launches", icon: Rocket },
  { label: "Research", href: "/research", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen shrink-0",
        "bg-[#0a0f1a] border-r border-[#1e293b]",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        // Hide on mobile, show on md+
        "hidden md:flex"
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-[#1e293b] shrink-0",
          isCollapsed ? "justify-center px-0" : "px-5 gap-3"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#3b82f6]/10 shrink-0">
          <Rocket className="w-4 h-4 text-[#3b82f6]" />
        </div>
        {!isCollapsed && (
          <span className="text-white font-semibold text-sm tracking-wide whitespace-nowrap overflow-hidden">
            Space Intel
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center h-10 rounded-md",
                "transition-all duration-150 ease-in-out",
                isCollapsed ? "justify-center px-0" : "px-3 gap-3",
                isActive
                  ? [
                      "bg-[#3b82f6]/10 text-[#3b82f6]",
                      "before:absolute before:left-0 before:top-1 before:bottom-1",
                      "before:w-0.5 before:rounded-full before:bg-[#3b82f6]",
                    ]
                  : [
                      "text-gray-400",
                      "hover:bg-[#1e293b] hover:text-white",
                    ]
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors duration-150",
                  isActive ? "text-[#3b82f6]" : "text-gray-400 group-hover:text-white"
                )}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-[#1e293b]">
        {/* Version label */}
        {!isCollapsed && (
          <div className="px-5 py-2">
            <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
              v0.1.0 MVP
            </span>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            "flex items-center w-full h-10",
            "text-gray-500 hover:text-white hover:bg-[#1e293b]",
            "transition-colors duration-150",
            isCollapsed ? "justify-center px-0" : "px-3 gap-3"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="text-xs text-gray-500">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
