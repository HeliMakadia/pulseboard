import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: {
        token,
      },
      include: {
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invite.expiresAt < new Date()) {
      await prisma.workspaceInvite.delete({
        where: {
          id: invite.id,
        },
      });

      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      email: invite.email,
      workspaceName: invite.workspace.name,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("Invitation details error:", error);

    return NextResponse.json(
      { error: "Unable to load invitation" },
      { status: 500 }
    );
  }
}