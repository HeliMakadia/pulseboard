"use client";

import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  Home,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    description: "View workspace overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "My Tasks",
    description: "View and manage your tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Projects",
    description: "View your projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Team",
    description: "View your team",
    href: "/team",
    icon: Users,
  },
  {
    label: "Analytics",
    description: "View project analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return navigation;
    }

    return navigation.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex(0);
  }, [open, search]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.min(current + 1, filteredItems.length - 1),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && filteredItems[selectedIndex]) {
      event.preventDefault();
      navigate(filteredItems[selectedIndex].href);
    }
  };

  return (
    <>
      {/* Desktop search button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted md:flex"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />

        <span>Search</span>

        <span className="ml-8 rounded border bg-background px-1.5 py-0.5 text-xs">
          ⌘ K
        </span>
      </button>

      {/* Command palette */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[15vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="w-full max-w-xl overflow-hidden rounded-xl border bg-background shadow-2xl"
          >
            {/* Search */}
            <div className="flex items-center border-b px-4">
              <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search PulseBoard..."
                className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                onClick={() => setOpen(false)}
                className="ml-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />

                  <p className="mt-3 text-sm font-medium">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <>
                  <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Navigation
                  </p>

                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    const selected = index === selectedIndex;

                    return (
                      <button
                        key={item.href}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => navigate(item.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                          selected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {item.label}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        {selected && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            ↵
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Keyboard hints */}
            <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              <span>
                <kbd className="rounded border bg-background px-1.5 py-0.5">
                  ↑
                </kbd>{" "}
                <kbd className="rounded border bg-background px-1.5 py-0.5">
                  ↓
                </kbd>{" "}
                Navigate
              </span>

              <span>
                <kbd className="rounded border bg-background px-1.5 py-0.5">
                  ↵
                </kbd>{" "}
                Select
              </span>

              <span>
                <kbd className="rounded border bg-background px-1.5 py-0.5">
                  Esc
                </kbd>{" "}
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}