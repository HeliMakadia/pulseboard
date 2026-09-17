"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  Circle,
  Clock3,
  GripVertical,
} from "lucide-react";
import { TaskDetailsDialog } from "@/components/projects/task-details-dialog";

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

type KanbanBoardProps = {
  tasks: Task[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
};

const columns = [
  {
    id: "TODO",
    title: "To Do",
    icon: Circle,
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    icon: Clock3,
  },
  {
    id: "DONE",
    title: "Done",
    icon: CheckCircle2,
  },
];

function SortableTask({
  task,
  onTaskClick,
}: {
  task: Task;
  onTaskClick: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      status: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityClass =
    task.priority === "URGENT"
      ? "bg-destructive/10 text-destructive"
      : task.priority === "HIGH"
        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
        : task.priority === "LOW"
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-primary";

  const initial = (
    task.assignee?.name ||
    task.assignee?.email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onTaskClick(task)}
      className={`group cursor-pointer rounded-xl border bg-background p-4 shadow-sm transition ${
        isDragging
          ? "z-10 opacity-70 shadow-lg"
          : "hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-60 transition hover:text-foreground hover:opacity-100 active:cursor-grabbing"
          aria-label={`Drag ${task.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">
            {task.title}
          </p>

          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide ${priorityClass}`}
            >
              {task.priority}
            </span>

            <div className="flex items-center gap-2">
              {formattedDueDate && (
                <span className="text-[11px] text-muted-foreground">
                  📅 {formattedDueDate}
                </span>
              )}

              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary"
                title={
                  task.assignee?.name ||
                  task.assignee?.email ||
                  "Unassigned"
                }
              >
                {initial}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: (typeof columns)[number];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      status: column.id,
    },
  });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[420px] rounded-xl border bg-muted/20 transition ${
        isOver ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />

          <h3 className="text-sm font-semibold">
            {column.title}
          </h3>
        </div>

        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[360px] space-y-3 p-3">
          {tasks.length === 0 ? (
            <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-xs text-muted-foreground">
                Drop tasks here
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
}: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = String(active.id);

    const newStatus =
      typeof over.data.current?.status === "string"
        ? over.data.current.status
        : String(over.id);

    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (
      !task ||
      !columns.some(
        (column) => column.id === newStatus
      )
    ) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    const response = await fetch(
      `/api/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        data.error || "Unable to update task."
      );
      return;
    }

    onTaskUpdated(data.task);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.id
            );

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onTaskClick={setSelectedTask}
              />
            );
          })}
        </div>
      </DndContext>

      <TaskDetailsDialog
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updatedTask) => {
          onTaskUpdated(updatedTask);
          setSelectedTask(updatedTask);
        }}
        onTaskDeleted={(taskId) => {
          onTaskDeleted(taskId);
          setSelectedTask(null);
        }}
      />
    </>
  );
}