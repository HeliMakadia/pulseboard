"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
};

type CreateProjectDialogProps = {
  workspace: Workspace;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateProjectDialog({
  workspace,
  onClose,
  onCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          workspaceId: workspace.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create project.");
        setLoading(false);
        return;
      }

      onCreated();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Create project</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Creating in {workspace.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <label
                htmlFor="project-name"
                className="text-sm font-medium"
              >
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                placeholder="Website Redesign"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                autoFocus
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="project-description"
                className="text-sm font-medium"
              >
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <textarea
                id="project-description"
                rows={4}
                maxLength={200}
                placeholder="What is this project about?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="text-right text-xs text-muted-foreground">
                {description.length}/200
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-lg px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}