"use client";

import { Bell, Search, Command } from "lucide-react";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { MobileSidebar } from "./mobile-sidebar";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <CommandPalette />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <Bell className="h-4 w-4" />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="h-6 w-px bg-border" />

        <Avatar className="h-8 w-8">
          <AvatarFallback>HM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}