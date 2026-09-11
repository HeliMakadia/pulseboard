"use client";

import {
  BarChart3,
  Bell,
  CheckSquare,
  FolderKanban,
  Home,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "My Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>

          <span className="text-lg font-semibold tracking-tight">
            PulseBoard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Manage */}
        <div className="mt-8">
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Manage
          </p>

          <Link
            href="/notifications"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Link>

          <Link
            href="/settings"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Workspace Usage */}
      <div className="border-t p-4">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-medium">Free Workspace</p>

          <p className="mt-1 text-xs text-muted-foreground">
            7 of 10 projects used
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full w-[70%] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </aside>
  );
}