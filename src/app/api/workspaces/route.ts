import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
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

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required." },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Workspace name must be between 2 and 50 characters." },
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

    const baseSlug = createSlug(name);

    if (!baseSlug) {
      return NextResponse.json(
        { error: "Please enter a valid workspace name." },
        { status: 400 }
      );
    }

    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.workspace.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description: description || null,
        ownerId: user.id,

        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(
      {
        message: "Workspace created successfully.",
        workspace,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create workspace error:", error);

    return NextResponse.json(
      { error: "Unable to create workspace." },
      { status: 500 }
    );
  }
}