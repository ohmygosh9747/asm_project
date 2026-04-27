import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// STAR RATING CALCULATION
// ============================================================
async function recalculateStarRating(employeeId: string) {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const mm = String(currentMonth).padStart(2, "0");
    const yyyy = String(currentYear);

    const monthAttendance = await db.attendance.findMany({
      where: { employeeId, date: { endsWith: `-${mm}-${yyyy}` } },
    });

    const absentCount = monthAttendance.filter((a) => a.status === "absent").length;
    const totalOvertimeHours = monthAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
    const fineCount = await db.fine.count({ where: { employeeId } });
    const warningCount = await db.warning.count({ where: { employeeId } });

    let rating = 5.0;
    if (absentCount > 2) rating -= (absentCount - 2) * 0.1;
    rating -= fineCount * 1.0;
    rating -= warningCount * 0.5;
    rating += totalOvertimeHours * 0.2;
    rating = Math.max(0.0, Math.min(5.0, Math.round(rating * 10) / 10));

    await db.employee.update({ where: { id: employeeId }, data: { rating } });
  } catch (error) {
    console.error("Star rating recalculation error:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const readFilter = searchParams.get("read");
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");   // e.g. 2026

    const where: Record<string, unknown> = {};
    if (readFilter !== null && readFilter !== "") {
      where.read = readFilter === "true";
    }

    // Filter by month/year using createdAt
    if (month || year) {
      if (month && year) {
        const mm = parseInt(month) - 1;
        const yyyy = parseInt(year);
        const start = new Date(yyyy, mm, 1);
        const end = new Date(yyyy, mm + 1, 1);
        where.createdAt = { gte: start, lt: end };
      } else if (year) {
        const yyyy = parseInt(year);
        const start = new Date(yyyy, 0, 1);
        const end = new Date(yyyy + 1, 0, 1);
        where.createdAt = { gte: start, lt: end };
      } else if (month) {
        const mm = parseInt(month) - 1;
        const yyyy = new Date().getFullYear();
        const start = new Date(yyyy, mm, 1);
        const end = new Date(yyyy, mm + 1, 1);
        where.createdAt = { gte: start, lt: end };
      }
    }

    const fines = await db.fine.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeId: true,
            position: true,
            companyName: true,
            photoUrl: true,
            phone: true,
            nationality: true,
            idNumber: true,
          },
        },
      },
    });
    return NextResponse.json(fines);
  } catch (error) {
    console.error("Fines GET error:", error);
    return NextResponse.json({ error: "Failed to fetch fines" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, reason, amount, createdBy } = body;

    if (!employeeId || !employeeName || !reason || amount === undefined || amount === null) {
      return NextResponse.json({ error: "employeeId, employeeName, reason, and amount are required" }, { status: 400 });
    }

    const fine = await db.fine.create({
      data: {
        employeeId,
        employeeName,
        reason,
        amount: parseFloat(String(amount)),
        createdBy: createdBy || null,
      },
    });

    // Recalculate star rating for this employee
    await recalculateStarRating(employeeId);

    return NextResponse.json(fine, { status: 201 });
  } catch (error) {
    console.error("Fines POST error:", error);
    return NextResponse.json({ error: "Failed to create fine" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "Fine id is required" }, { status: 400 });
    }

    const fine = await db.fine.update({
      where: { id },
      data: { read: read !== undefined ? read : true },
    });

    return NextResponse.json(fine);
  } catch (error) {
    console.error("Fines PUT error:", error);
    return NextResponse.json({ error: "Failed to update fine" }, { status: 500 });
  }
}
