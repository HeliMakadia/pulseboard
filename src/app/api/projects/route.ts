import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function createProjectKey(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 5)
    .toUpperCase();
}

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

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace is required." },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        {
          error:
            "Project name must be between 2 and 80 characters.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this workspace." },
        { status: 403 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    const baseKey = createProjectKey(name);

    let key = baseKey;
    let counter = 1;

    while (
      await prisma.project.findUnique({
        where: {
          workspaceId_key: {
            workspaceId,
            key,
          },
        },
        select: {
          id: true,
        },
      })
    ) {
      key = `${baseKey}${counter}`;
      counter++;
    }

    const project = await prisma.project.create({
      data: {
        name,
        key,
        description: description || null,
        workspaceId,
      },
    });

    return NextResponse.json(
      {
        message: "Project created successfully.",
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);

    return NextResponse.json(
      { error: "Unable to create project." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const memberships = await prisma.workspaceMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        workspace: {
          include: {
            projects: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    const workspaces = memberships.map((membership) => ({
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      projects: membership.workspace.projects,
    }));

    return NextResponse.json({
      workspaces,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return NextResponse.json(
      { error: "Unable to fetch projects." },
      { status: 500 }
    );
  }
}