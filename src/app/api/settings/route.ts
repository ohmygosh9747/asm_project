import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, darkMode } = body;
    const user = await db.user.update({
      where: { id: userId },
      data: { darkMode },
    });
    return NextResponse.json({ darkMode: user.darkMode });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
