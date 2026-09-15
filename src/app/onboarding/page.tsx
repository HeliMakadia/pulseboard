"use client";

import { FormEvent, useState } from "react";
import { Building2, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a workspace name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create workspace.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Create your workspace
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Your workspace is where your team will organize projects,
              manage tasks, and track progress.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="workspace-name"
                  className="text-sm font-medium"
                >
                  Workspace name
                </label>

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="workspace-name"
                    type="text"
                    placeholder="Acme Inc."
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={50}
                    autoFocus
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Choose a name your team will recognize.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="workspace-description"
                  className="text-sm font-medium"
                >
                  Description{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="workspace-description"
                  placeholder="What will your team use this workspace for?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={200}
                  rows={4}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <div className="text-right text-xs text-muted-foreground">
                  {description.length}/200
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating workspace...
                  </>
                ) : (
                  "Create workspace"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You can update your workspace settings later.
          </p>
        </div>
      </div>
    </main>
  );
}