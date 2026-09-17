import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const projectId =
      typeof body.projectId === "string"
        ? body.projectId
        : "";

    const assigneeId =
      typeof body.assigneeId === "string" &&
      body.assigneeId.trim()
        ? body.assigneeId
        : null;

    const dueDate =
      typeof body.dueDate === "string" &&
      body.dueDate.trim()
        ? new Date(body.dueDate)
        : null;

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {
          error:
            "Task title must be 200 characters or less.",
        },
        { status: 400 }
      );
    }

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid due date." },
        { status: 400 }
      );
    }

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

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const isMember =
      project.workspace.members.some(
        (member) => member.userId === user.id
      );

    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have access to this project." },
        { status: 403 }
      );
    }

    if (assigneeId) {
      const assigneeIsMember =
        project.workspace.members.some(
          (member) => member.userId === assigneeId
        );

      if (!assigneeIsMember) {
        return NextResponse.json(
          {
            error:
              "The selected assignee is not a member of this workspace.",
          },
          { status: 400 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
        assigneeId,
        dueDate,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { task },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/tasks error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to create task." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const projectId =
      searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

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

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const isMember =
      project.workspace.members.some(
        (member) => member.userId === user.id
      );

    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have access to this project." },
        { status: 403 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      tasks,
    });
  } catch (error) {
    console.error(
      "GET /api/tasks error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load tasks." },
      { status: 500 }
    );
  }
}