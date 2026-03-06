"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = clerkPubKey.length > 0 && !clerkPubKey.includes("replace_me");

const ROUTE_TITLES: Record<string, string> = {
  "/": "Command Center",
  "/companies": "Companies",
  "/launches": "Launch Tracker",
  "/research": "AI Research",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  const exactMatch = ROUTE_TITLES[pathname];
  if (exactMatch !== undefined) {
    return exactMatch;
  }
  // Prefix match for nested routes (longest match wins)
  const prefixMatch = Object.keys(ROUTE_TITLES)
    .filter((route) => route !== "/" && pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];
  return (prefixMatch !== undefined ? ROUTE_TITLES[prefixMatch] : undefined) ?? "Space Intel";
}

export function Topbar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        "flex items-center h-16 px-4 shrink-0",
        "bg-[#0a0f1a] border-b border-[#1e293b]",
        "gap-4"
      )}
    >
      {/* Left: Page title */}
      <div className="flex-none min-w-0 hidden sm:block">
        <h1 className="text-white font-semibold text-base truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Global search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div
          className={cn(
            "relative flex items-center",
            "bg-[#111827] border border-[#1e293b] rounded-lg",
            "transition-colors duration-150",
            "focus-within:border-[#3b82f6]/50 focus-within:bg-[#111827]"
          )}
        >
          {/* Search icon */}
          <Search className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none shrink-0" />

          {/* Input */}
          <input
            type="text"
            placeholder="Search companies, contracts, launches..."
            className={cn(
              "w-full h-9 pl-9 pr-14 text-sm",
              "bg-transparent text-white placeholder:text-gray-500",
              "outline-none border-none ring-0",
              "rounded-lg"
            )}
            readOnly
          />

          {/* Keyboard shortcut hint */}
          <div className="absolute right-3 flex items-center gap-0.5 pointer-events-none">
            <kbd
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px]",
                "bg-[#1e293b] text-gray-500 font-mono border border-[#334155]",
                "leading-none"
              )}
            >
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 flex-none">
        {/* Notifications */}
        <button
          className={cn(
            "relative flex items-center justify-center w-9 h-9 rounded-md",
            "text-gray-400 hover:text-white hover:bg-[#1e293b]",
            "transition-colors duration-150"
          )}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Notification dot placeholder */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
        </button>

        {/* User avatar — uses Clerk UserButton when configured, placeholder otherwise */}
        {hasClerk ? (
          <ClerkUserButton />
        ) : (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1e293b] text-gray-400"
            title="Sign in (configure Clerk to enable auth)"
          >
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </header>
  );
}

function ClerkUserButton() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { UserButton } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
          userButtonPopoverCard:
            "bg-[#111827] border border-[#1e293b] shadow-xl",
          userButtonPopoverActionButton:
            "text-gray-300 hover:text-white hover:bg-[#1e293b]",
          userButtonPopoverActionButtonText: "text-sm",
          userButtonPopoverFooter: "hidden",
        },
      }}
    />
  );
}
