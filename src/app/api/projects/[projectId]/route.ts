import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(
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

    const { projectId } = await params;

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

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        workspace: {
          name: project.workspace.name,
        },
      },
    });
  } catch (error) {
    console.error("Get project error:", error);

    return NextResponse.json(
      { error: "Unable to load project." },
      { status: 500 }
    );
  }
}