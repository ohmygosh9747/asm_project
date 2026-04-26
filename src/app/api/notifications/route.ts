import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "";

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;
    const notification = await db.notification.update({
      where: { id },
      data: { read },
    });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
