import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const employee = await db.employee.findUnique({
      where: { id },
      include: { attendances: { orderBy: { date: "desc" } } },
    });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const decrypted = {
      ...employee,
      passportNumber: employee.passportNumber ? decrypt(employee.passportNumber) : null,
      idNumber: employee.idNumber ? decrypt(employee.idNumber) : null,
      salary: employee.salary ? decrypt(employee.salary) : null,
    };

    return NextResponse.json(decrypted);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
