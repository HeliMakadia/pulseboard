"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

type Project = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
};

type Workspace = {
  id: string;
  name: string;
  slug: string;
  projects: Project[];
};

export default function ProjectsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load projects.");
        return;
      }

      setWorkspaces(data.workspaces || []);
    } catch {
      setError("Something went wrong while loading projects.");
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
  let cancelled = false;

  async function fetchProjects() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        cache: "no-store",
      });

      const data = await response.json();

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setError(data.error || "Unable to load projects.");
        return;
      }

      setWorkspaces(data.workspaces || []);
    } catch {
      if (!cancelled) {
        setError("Something went wrong while loading projects.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchProjects();

  return () => {
    cancelled = true;
  };
}, []);

  const projects = workspaces.flatMap((workspace) =>
    workspace.projects.map((project) => ({
      ...project,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    }))
  );

  const defaultWorkspace = workspaces[0];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />

              <h1 className="text-2xl font-semibold tracking-tight">
                Projects
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your projects and keep your team moving forward.
            </p>
          </div>

          {defaultWorkspace && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New project
            </button>
          )}
        </div>

        {loading && (
          <div className="flex min-h-60 items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading projects...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="text-lg font-semibold">
              No projects yet
            </h2>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first project to start organizing tasks and
              collaborating with your team.
            </p>

            {defaultWorkspace && (
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create your first project
              </button>
            )}
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {project.key}
                  </div>
                </div>

                <h2 className="mt-5 font-semibold tracking-tight">
                  {project.name}
                </h2>

                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {project.workspaceName}
                </p>

                <p className="mt-3 min-h-10 text-sm leading-5 text-muted-foreground">
                  {project.description || "No description provided."}
                </p>

                <div className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Created{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && defaultWorkspace && (
        <CreateProjectDialog
          workspace={defaultWorkspace}
          onClose={() => setDialogOpen(false)}
          onCreated={loadProjects}
        />
      )}
    </div>
  );
}