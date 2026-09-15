import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { taskId } = await params;
    const body = await request.json();

    const status =
      typeof body.status === "string"
        ? body.status
        : undefined;

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : undefined;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : undefined;

    const priority =
      typeof body.priority === "string"
        ? body.priority
        : undefined;

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    const isMember = task.project.workspace.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have access to this task." },
        { status: 403 }
      );
    }

    const validStatuses = [
      "TODO",
      "IN_PROGRESS",
      "DONE",
    ];

    const validPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid task status." },
        { status: 400 }
      );
    }

    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid task priority." },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(status && { status }),
        ...(title !== undefined && {
          title: title || task.title,
        }),
        ...(description !== undefined && {
          description: description || null,
        }),
        ...(priority && { priority }),
      },
    });

    return NextResponse.json({
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      { error: "Unable to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    const isMember = task.project.workspace.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have access to this task." },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return NextResponse.json(
      { error: "Unable to delete task." },
      { status: 500 }
    );
  }
}