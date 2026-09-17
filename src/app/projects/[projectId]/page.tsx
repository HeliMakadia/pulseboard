"use client";

import { FormEvent, useEffect, useState } from "react";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { useParams } from "next/navigation";
import {
  Circle,
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

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProject() {
      try {
        setLoading(true);
        setError("");

        const [projectResponse, tasksResponse, membersResponse] =
          await Promise.all([
            fetch(`/api/projects/${projectId}`, {
              cache: "no-store",
            }),
            fetch(`/api/tasks?projectId=${projectId}`, {
              cache: "no-store",
            }),
            fetch("/api/workspaces/members", {
              cache: "no-store",
            }),
          ]);

        const projectData = await projectResponse.json();
        const tasksData = await tasksResponse.json();
        const membersData = await membersResponse.json();

        if (cancelled) {
          return;
        }

        if (!projectResponse.ok) {
          setError(
            projectData.error || "Unable to load project."
          );
          return;
        }

        if (!tasksResponse.ok) {
          setError(
            tasksData.error || "Unable to load tasks."
          );
          return;
        }

        if (!membersResponse.ok) {
          setError(
            membersData.error ||
              "Unable to load workspace members."
          );
          return;
        }

        setProject(projectData.project);
        setTasks(tasksData.tasks || []);

        const allMembers: Member[] = (
          membersData.workspaces || []
        ).flatMap(
          (workspace: { members: Member[] }) =>
            workspace.members || []
        );

        const uniqueMembers = Array.from(
          new Map(
            allMembers.map((member) => [
              member.id,
              member,
            ])
          ).values()
        );

        setMembers(uniqueMembers);
      } catch {
        if (!cancelled) {
          setError(
            "Something went wrong while loading the project."
          );
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

  async function createTask(
    event: FormEvent<HTMLFormElement>
  ) {
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
          description:
            taskDescription.trim() || null,
          projectId,
          assigneeId: assigneeId || null,
          dueDate: dueDate
            ? new Date(
                `${dueDate}T23:59:59`
              ).toISOString()
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create task."
        );
        return;
      }

      setTasks((current) => [
        data.task,
        ...current,
      ]);

      setTaskTitle("");
      setTaskDescription("");
      setAssigneeId("");
      setDueDate("");
    } catch {
      setError(
        "Something went wrong while creating the task."
      );
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
            {project.description ||
              "No description provided."}
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
            <h2 className="font-semibold">
              Create task
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a task to this project.
            </p>
          </div>

          <form
            onSubmit={createTask}
            className="space-y-4 p-6"
          >
            {/* Title */}
            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(event) =>
                setTaskTitle(event.target.value)
              }
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            {/* Description */}
            <textarea
              rows={3}
              placeholder="Add a description (optional)"
              value={taskDescription}
              onChange={(event) =>
                setTaskDescription(
                  event.target.value
                )
              }
              className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            {/* Assignee + Due Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-assignee"
                  className="mb-2 block text-sm font-medium"
                >
                  Assignee
                </label>

                <select
                  id="task-assignee"
                  value={assigneeId}
                  onChange={(event) =>
                    setAssigneeId(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name ||
                        member.email ||
                        "Unnamed member"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-due-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Due date
                </label>

                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  creating ||
                  !taskTitle.trim()
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {creating
                  ? "Creating..."
                  : "Create task"}
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
            <h2 className="font-semibold">
              Tasks
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tasks currently belonging to this project.
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Circle className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="font-medium">
                No tasks yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first task above.
              </p>
            </div>
          ) : (
            <div className="p-4">
              <KanbanBoard
                tasks={tasks}
                onTaskUpdated={(updatedTask) => {
                  setTasks((currentTasks) =>
                    currentTasks.map((task) =>
                      task.id ===
                      updatedTask.id
                        ? updatedTask
                        : task
                    )
                  );
                }}
                onTaskDeleted={(taskId) => {
                  setTasks((currentTasks) =>
                    currentTasks.filter(
                      (task) =>
                        task.id !== taskId
                    )
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}