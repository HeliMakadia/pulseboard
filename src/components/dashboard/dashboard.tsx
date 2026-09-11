import { Avatar, AvatarFallback } from "@/ui/avatar";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  TrendingUp,
  Zap,
} from "lucide-react";

const stats = [
  {
    title: "Total Tasks",
    value: "128",
    change: "+12.5%",
    description: "from last month",
    icon: ListTodo,
  },
  {
    title: "Completed",
    value: "86",
    change: "+18.2%",
    description: "from last month",
    icon: CheckCircle2,
  },
  {
    title: "Projects",
    value: "12",
    change: "+2",
    description: "new this month",
    icon: FolderKanban,
  },
  {
    title: "On Time",
    value: "92%",
    change: "+4.3%",
    description: "from last month",
    icon: Clock3,
  },
];

export function Dashboard() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Friday, September 11, 2026
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Good morning, Heli 👋
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Here's what's happening across your workspace today.
          </p>
        </div>

        {/* Stats */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Project Progress</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Overview of your active projects
                </p>
              </div>

              <button className="flex items-center gap-1 text-sm font-medium text-primary">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {[
                ["Website Redesign", 82],
                ["Mobile Application", 64],
                ["Marketing Campaign", 48],
                ["Design System", 91],
              ].map(([name, progress]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div>
              <h2 className="font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest workspace updates
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {[
                ["HM", "You completed", "Authentication", "10 min ago"],
                ["RS", "Rahul created", "Payment Integration", "42 min ago"],
                ["PK", "Priya moved", "Dashboard → Done", "1 hr ago"],
                ["HM", "You commented on", "Design System", "2 hrs ago"],
              ].map(([initials, action, item, time]) => (
                <div key={`${initials}-${item}`} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 text-sm">
                    <p>
                      <span className="font-medium">{action}</span>{" "}
                      <span className="text-muted-foreground">{item}</span>
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI teaser */}

        <div className="mt-6 rounded-xl border bg-primary/[0.04] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Your AI Project Assistant</h2>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Get an instant summary of your projects, identify blockers,
                and discover what your team should prioritize next.
              </p>

              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                Generate project insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}