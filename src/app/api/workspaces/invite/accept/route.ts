import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
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

    const invite = await prisma.workspaceInvite.findUnique({
      where: {
        token,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "This invitation is invalid or no longer exists." },
        { status: 404 }
      );
    }

    if (invite.expiresAt <= new Date()) {
      await prisma.workspaceInvite.delete({
        where: {
          id: invite.id,
        },
      });

      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    if (
      !user.email ||
      user.email.toLowerCase() !==
        invite.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation was sent to a different email address.",
        },
        { status: 403 }
      );
    }

    const existingMembership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId: user.id,
          },
        },
      });

    if (existingMembership) {
      await prisma.workspaceInvite.delete({
        where: {
          id: invite.id,
        },
      });

      return NextResponse.json({
        message: "You are already a member of this workspace.",
        workspace: invite.workspace,
      });
    }

    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: user.id,
          role: "MEMBER",
        },
      }),

      prisma.workspaceInvite.delete({
        where: {
          id: invite.id,
        },
      }),
    ]);

    return NextResponse.json({
      message: "You have joined the workspace.",
      workspace: invite.workspace,
    });
  } catch (error) {
    console.error(
      "POST /api/workspaces/invite/accept error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to accept invitation.",
      },
      { status: 500 }
    );
  }
}
