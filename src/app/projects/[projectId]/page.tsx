"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Plus,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  workspace: {
    name: string;
  };
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
};

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const [projectResponse, tasksResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`, {
          cache: "no-store",
        }),
        fetch(`/api/tasks?projectId=${projectId}`, {
          cache: "no-store",
        }),
      ]);

      const projectData = await projectResponse.json();
      const tasksData = await tasksResponse.json();

      if (!projectResponse.ok) {
        setError(projectData.error || "Unable to load project.");
        return;
      }

      if (!tasksResponse.ok) {
        setError(tasksData.error || "Unable to load tasks.");
        return;
      }

      setProject(projectData.project);
      setTasks(tasksData.tasks || []);
    } catch {
      setError("Something went wrong while loading the project.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  let cancelled = false;

  async function fetchProject() {
    try {
      setLoading(true);
      setError("");

      const [projectResponse, tasksResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`, {
          cache: "no-store",
        }),
        fetch(`/api/tasks?projectId=${projectId}`, {
          cache: "no-store",
        }),
      ]);

      const projectData = await projectResponse.json();
      const tasksData = await tasksResponse.json();

      if (cancelled) {
        return;
      }

      if (!projectResponse.ok) {
        setError(projectData.error || "Unable to load project.");
        return;
      }

      if (!tasksResponse.ok) {
        setError(tasksData.error || "Unable to load tasks.");
        return;
      }

      setProject(projectData.project);
      setTasks(tasksData.tasks || []);
    } catch {
      if (!cancelled) {
        setError("Something went wrong while loading the project.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchProject();

  return () => {
    cancelled = true;
  };
}, [projectId]);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskTitle.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create task.");
        return;
      }

      setTasks((current) => [data.task, ...current]);

      setTaskTitle("");
      setTaskDescription("");
    } catch {
      setError("Something went wrong while creating the task.");
    } finally {
      setCreating(false);
    }
  }

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading project...
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Project Header */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            {project.workspace.name}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
              {project.key}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {project.description || "No description provided."}
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total Tasks
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Completed
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {completedTasks}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              In Progress
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {inProgressTasks}
            </p>
          </div>
        </div>

        {/* Create Task */}
        <div className="mb-8 rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Create task</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a task to this project.
            </p>
          </div>

          <form
            onSubmit={createTask}
            className="space-y-4 p-6"
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(event) =>
                setTaskTitle(event.target.value)
              }
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <textarea
              rows={3}
              placeholder="Add a description (optional)"
              value={taskDescription}
              onChange={(event) =>
                setTaskDescription(event.target.value)
              }
              className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating || !taskTitle.trim()}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {creating ? "Creating..." : "Create task"}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tasks */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Tasks</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tasks currently belonging to this project.
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Circle className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="font-medium">No tasks yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first task above.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 px-6 py-4 transition hover:bg-muted/30"
                >
                  <div className="mt-0.5">
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : task.status === "IN_PROGRESS" ? (
                      <Clock3 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{task.status}</span>
                      <span>•</span>
                      <span>{task.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}