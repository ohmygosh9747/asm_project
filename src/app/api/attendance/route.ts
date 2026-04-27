import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Convert a JS Date to DD-MM-YYYY string
function toDateStr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Get day name from DD-MM-YYYY string
function getDayNameFromDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "Unknown";
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  return DAY_NAMES[d.getDay()];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId") || "";
    const date = searchParams.get("date") || "";
    const month = searchParams.get("month") || ""; // 1-12
    const year = searchParams.get("year") || "";   // e.g. 2026

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (date) where.date = date;

    // Filter by month/year: find all dates matching DD-MM-YYYY where MM=month and YYYY=year
    if (month && year) {
      const mm = String(month).padStart(2, "0");
      const yyyy = String(year);
      // SQLite LIKE query: date ends with -MM-YYYY
      where.date = { endsWith: `-${mm}-${yyyy}` };
    } else if (date) {
      where.date = date;
    }

    const attendances = await db.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: { employee: { select: { fullName: true, employeeId: true } } },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, status, markedBy, dayName } = body;

    // Compute dayName from date if not provided
    const computedDayName = dayName || getDayNameFromDate(date);

    const attendance = await db.attendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: { status, markedBy, dayName: computedDayName },
      create: { employeeId, date, status, markedBy, dayName: computedDayName },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, markedBy, dayName } = body;

    const data: any = { status, markedBy };
    if (dayName) data.dayName = dayName;

    const attendance = await db.attendance.update({
      where: { id },
      data,
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
