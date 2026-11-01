import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const body = await req.json();
    const { role } = body;

    if (!["OWNER", "SEEKER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER or SEEKER." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data:  { role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("update-role error:", error);
    return NextResponse.json(
      { error: "Failed to update role. Please try again." },
      { status: 500 }
    );
  }
}
