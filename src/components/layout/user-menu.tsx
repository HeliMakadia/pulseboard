"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
};

export function UserMenu({ name, email }: UserMenuProps) {
  const displayName = name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
    
      <div className="group relative">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-offset-background transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Open user menu"
        >
          {initial}
        </button>

        <div className="invisible absolute right-0 top-11 z-50 w-52 translate-y-1 rounded-xl border bg-popover p-1.5 opacity-0 shadow-lg transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{displayName}</p>
            {email && (
              <p className="truncate text-xs text-muted-foreground">
                {email}
              </p>
            )}
          </div>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}