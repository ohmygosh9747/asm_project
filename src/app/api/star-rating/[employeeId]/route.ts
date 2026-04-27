import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const mm = String(currentMonth).padStart(2, "0");
    const yyyy = String(currentYear);

    // Get current month attendance
    const monthAttendance = await db.attendance.findMany({
      where: {
        employeeId,
        date: { endsWith: `-${mm}-${yyyy}` },
      },
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

    // Update the employee's stored rating
    await db.employee.update({
      where: { id: employeeId },
      data: { rating },
    });

    return NextResponse.json({
      employeeId,
      rating,
      breakdown: {
        base: 5.0,
        absentDeduction: absentCount > 2 ? -((absentCount - 2) * 0.1) : 0,
        fineDeduction: -(fineCount * 1.0),
        warningDeduction: -(warningCount * 0.5),
        overtimeBonus: +(totalOvertimeHours * 0.2),
        absentCount,
        fineCount,
        warningCount,
        totalOvertimeHours,
      },
    });
  } catch (error) {
    console.error("Star rating calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate star rating" }, { status: 500 });
  }
}
