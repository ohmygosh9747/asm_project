import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "active";

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { employeeId: { contains: search } },
        { position: { contains: search } },
        { companyName: { contains: search } },
        { nationality: { contains: search } },
      ];
    }

    const employees = await db.employee.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        attendances: {
          orderBy: { date: "desc" },
          // Get last 31 days of attendance to ensure dashboard 3-day view always works
          take: 31,
        },
      },
    });

    // Decrypt sensitive fields for display
    const decryptedEmployees = employees.map((emp) => ({
      ...emp,
      passportNumber: emp.passportNumber ? decrypt(emp.passportNumber) : null,
      idNumber: emp.idNumber ? decrypt(emp.idNumber) : null,
    }));

    return NextResponse.json(decryptedEmployees, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Encrypt sensitive fields
    const encryptedData = {
      ...body,
      passportNumber: body.passportNumber ? encrypt(body.passportNumber) : null,
      idNumber: body.idNumber ? encrypt(body.idNumber) : null,
    };

    const employee = await db.employee.create({ data: encryptedData });
    return NextResponse.json(employee);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // Encrypt sensitive fields
    const encryptedData = {
      ...data,
      passportNumber: data.passportNumber ? encrypt(data.passportNumber) : null,
      idNumber: data.idNumber ? encrypt(data.idNumber) : null,
    };

    const employee = await db.employee.update({
      where: { id },
      data: encryptedData,
    });
    return NextResponse.json(employee);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}
