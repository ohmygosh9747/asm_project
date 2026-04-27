import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const readFilter = searchParams.get("read");

    const where: Record<string, unknown> = {};
    if (readFilter !== null && readFilter !== "") {
      where.read = readFilter === "true";
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
