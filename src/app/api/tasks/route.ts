import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const projectId =
      typeof body.projectId === "string" ? body.projectId : "";

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project is required." },
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
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
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

    const isMember = project.workspace.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have access to this project." },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
      },
    });

    return NextResponse.json(
      {
        message: "Task created successfully.",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);

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
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

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
            members: true,
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

    const isMember = project.workspace.members.some(
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
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);

    return NextResponse.json(
      { error: "Unable to load tasks." },
      { status: 500 }
    );
  }
}