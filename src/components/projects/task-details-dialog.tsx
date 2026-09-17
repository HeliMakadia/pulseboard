"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Trash2,
  X,
} from "lucide-react";

type TaskData = {
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

type TaskDetailsDialogProps = {
  task: TaskData | null;
  onClose: () => void;
  onTaskUpdated: (task: TaskData) => void;
  onTaskDeleted: (taskId: string) => void;
};

const statuses = [
  {
    value: "TODO",
    label: "To Do",
    icon: Circle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: Clock3,
  },
  {
    value: "DONE",
    label: "Done",
    icon: CheckCircle2,
  },
];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TaskDetailsDialog({
  task,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailsDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!task) {
    return null;
  }

  const taskId = task.id;

  async function handleSave() {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update task.");
        return;
      }

      onTaskUpdated(data.task);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to delete task.");
        return;
      }

      onTaskDeleted(taskId);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const createdDate = new Date(task.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Task details
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Edit task
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium"
            >
              Title
            </label>

            <input
              id="task-title"
              value={title || task.title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={
                description || task.description || ""
              }
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Add a description..."
              className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>

              <select
                id="task-status"
                value={status || task.status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {statuses.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium"
              >
                Priority
              </label>

              <select
                id="task-priority"
                value={priority || task.priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {priorities.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Created
                </p>

                <p className="text-sm font-medium">
                  {createdDate}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Assignee
              </p>

              <p className="mt-1 text-sm font-medium">
                {task.assignee?.name ||
                  task.assignee?.email ||
                  "Unassigned"}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />

            {deleting
              ? "Deleting..."
              : "Delete task"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}