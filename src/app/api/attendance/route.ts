import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId") || "";
    const date = searchParams.get("date") || "";

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (date) where.date = date;

    const attendances = await db.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: { employee: { select: { fullName: true, employeeId: true } } },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, status, markedBy } = body;

    const attendance = await db.attendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: { status, markedBy },
      create: { employeeId, date, status, markedBy },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, markedBy } = body;

    const attendance = await db.attendance.update({
      where: { id },
      data: { status, markedBy },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
