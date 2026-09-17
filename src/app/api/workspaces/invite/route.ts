import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required." },
        { status: 400 }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const membership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: currentUser.id,
          },
        },
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this workspace.",
        },
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

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (existingUser) {
      const existingMembership =
        await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: existingUser.id,
            },
          },
        });

      if (existingMembership) {
        return NextResponse.json(
          {
            error:
              "This user is already a member of the workspace.",
          },
          { status: 409 }
        );
      }
    }

    const existingInvite =
      await prisma.workspaceInvite.findUnique({
        where: {
          workspaceId_email: {
            workspaceId,
            email,
          },
        },
      });

    if (existingInvite) {
      if (existingInvite.expiresAt > new Date()) {
        return NextResponse.json(
          {
            error:
              "An active invitation already exists for this email.",
          },
          { status: 409 }
        );
      }

      await prisma.workspaceInvite.delete({
        where: {
          id: existingInvite.id,
        },
      });
    }

    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const invite = await prisma.workspaceInvite.create({
      data: {
        email,
        token,
        workspaceId,
        invitedById: currentUser.id,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const inviteUrl =
      `${baseUrl}/invite/${invite.token}`;

    return NextResponse.json(
      {
        message: "Invitation created successfully.",
        invite: {
          id: invite.id,
          email: invite.email,
          workspaceId: invite.workspaceId,
          workspaceName: workspace.name,
          expiresAt: invite.expiresAt,
          inviteUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/workspaces/invite error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to create invitation.",
      },
      { status: 500 }
    );
  }
}