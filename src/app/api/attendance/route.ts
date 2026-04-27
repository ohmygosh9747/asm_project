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
    return NextResponse.json(attendances, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, status, markedBy, dayName, overtimeHours } = body;

    // Validate required fields
    if (!employeeId || !date || !status) {
      return NextResponse.json({ error: "Missing required fields: employeeId, date, status" }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ["present", "absent", "no_site", "overtime", "not_marked"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    // Compute dayName from date if not provided
    const computedDayName = dayName || getDayNameFromDate(date);

    // If overtime is selected, auto-set status as present and save overtime hours
    let actualStatus = status;
    let actualOvertimeHours: number | null = null;
    if (status === "overtime") {
      actualStatus = "present";
      actualOvertimeHours = overtimeHours ? parseFloat(String(overtimeHours)) : 0;
    }

    const data: any = { status: actualStatus, markedBy, dayName: computedDayName };
    // Set overtimeHours
    if (actualOvertimeHours !== null) {
      data.overtimeHours = actualOvertimeHours;
    } else {
      data.overtimeHours = null;
    }

    const attendance = await db.attendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: data,
      create: { employeeId, date, ...data },
    });

    // Auto-warning logic: if marking absent, check for 3 consecutive absences
    if (actualStatus === "absent") {
      try {
        const today = new Date();
        const last3Dates: string[] = [];
        for (let i = 0; i < 3; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          last3Dates.push(toDateStr(d));
        }

        // Get attendance for the last 3 days for this employee
        const recentAttendance = await db.attendance.findMany({
          where: {
            employeeId,
            date: { in: last3Dates },
          },
        });

        // Check if all 3 days are absent
        const allAbsent = last3Dates.every((dateStr) => {
          const att = recentAttendance.find((a) => a.date === dateStr);
          return att?.status === "absent";
        });

        if (allAbsent) {
          // Check if a warning already exists for this employee with the same absentDates
          const absentDatesJson = JSON.stringify(last3Dates);
          const existingWarning = await db.warning.findFirst({
            where: {
              employeeId,
              absentDates: absentDatesJson,
            },
          });

          if (!existingWarning) {
            // Get employee name
            const employee = await db.employee.findUnique({
              where: { id: employeeId },
              select: { fullName: true },
            });

            if (employee) {
              await db.warning.create({
                data: {
                  employeeId,
                  employeeName: employee.fullName,
                  reason: "3 consecutive days absence",
                  isAutoGenerated: true,
                  absentDates: absentDatesJson,
                  createdBy: "system",
                },
              });
            }
          }
        }
      } catch (warningError) {
        // Don't fail the attendance marking if the warning check fails
        console.error("Auto-warning check error:", warningError);
      }
    }

    // Recalculate star rating for this employee
    await recalculateStarRating(employeeId);

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: `Failed to mark attendance: ${error instanceof Error ? error.message : "Unknown error"}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, markedBy, dayName, overtimeHours } = body;

    // If overtime is selected, auto-set status as present and save overtime hours
    let actualStatus = status;
    let actualOvertimeHours: number | null = null;
    if (status === "overtime") {
      actualStatus = "present";
      actualOvertimeHours = overtimeHours ? parseFloat(String(overtimeHours)) : 0;
    }

    const data: any = { status: actualStatus, markedBy };
    if (dayName) data.dayName = dayName;
    // Set overtimeHours
    if (actualOvertimeHours !== null) {
      data.overtimeHours = actualOvertimeHours;
    } else if (status) {
      data.overtimeHours = null;
    }

    const attendance = await db.attendance.update({
      where: { id },
      data,
    });

    // Same auto-warning logic for PUT (updating existing attendance to absent)
    if (actualStatus === "absent") {
      try {
        const empId = attendance.employeeId;
        const today = new Date();
        const last3Dates: string[] = [];
        for (let i = 0; i < 3; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          last3Dates.push(toDateStr(d));
        }

        const recentAttendance = await db.attendance.findMany({
          where: {
            employeeId: empId,
            date: { in: last3Dates },
          },
        });

        const allAbsent = last3Dates.every((dateStr) => {
          const att = recentAttendance.find((a) => a.date === dateStr);
          return att?.status === "absent";
        });

        if (allAbsent) {
          const absentDatesJson = JSON.stringify(last3Dates);
          const existingWarning = await db.warning.findFirst({
            where: {
              employeeId: empId,
              absentDates: absentDatesJson,
            },
          });

          if (!existingWarning) {
            const employee = await db.employee.findUnique({
              where: { id: empId },
              select: { fullName: true },
            });

            if (employee) {
              await db.warning.create({
                data: {
                  employeeId: empId,
                  employeeName: employee.fullName,
                  reason: "3 consecutive days absence",
                  isAutoGenerated: true,
                  absentDates: absentDatesJson,
                  createdBy: "system",
                },
              });
            }
          }
        }
      } catch (warningError) {
        console.error("Auto-warning check error:", warningError);
      }
    }

    // Recalculate star rating for this employee
    await recalculateStarRating(attendance.employeeId);

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ============================================================
// STAR RATING CALCULATION
// ============================================================
// Everyone starts at 5.0
// - Each absent day beyond 2 per month: -0.1
// - Each fine: -1.0
// - Each warning: -0.5
// - Each overtime hour: +0.2
// Clamped to 0.0 - 5.0

async function recalculateStarRating(employeeId: string) {
  try {
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

    // Count absences this month
    const absentCount = monthAttendance.filter((a) => a.status === "absent").length;

    // Count overtime hours this month (from attendance records where overtimeHours > 0)
    const totalOvertimeHours = monthAttendance.reduce((sum, a) => {
      return sum + (a.overtimeHours || 0);
    }, 0);

    // Count total fines for this employee (all time)
    const fineCount = await db.fine.count({
      where: { employeeId },
    });

    // Count total warnings for this employee (all time)
    const warningCount = await db.warning.count({
      where: { employeeId },
    });

    // Calculate rating
    let rating = 5.0;
    // Deduct for extra absences (beyond 2 per month)
    if (absentCount > 2) {
      rating -= (absentCount - 2) * 0.1;
    }
    // Deduct for fines
    rating -= fineCount * 1.0;
    // Deduct for warnings
    rating -= warningCount * 0.5;
    // Add for overtime
    rating += totalOvertimeHours * 0.2;

    // Clamp to 0.0 - 5.0
    rating = Math.max(0.0, Math.min(5.0, Math.round(rating * 10) / 10));

    // Update employee
    await db.employee.update({
      where: { id: employeeId },
      data: { rating },
    });
  } catch (error) {
    console.error("Star rating recalculation error:", error);
  }
}
