import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const readFilter = searchParams.get("read");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (readFilter !== null && readFilter !== "") {
      where.read = readFilter === "true";
    }

    const requests = await db.deleteRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deleteRequest = await db.deleteRequest.create({ data: body });

    // Create notification for super admins with employee & request IDs in link
    const superAdmins = await db.user.findMany({ where: { role: "super_admin" } });
    for (const admin of superAdmins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          title: "Delete Request",
          message: `Request to delete employee: ${body.employeeName}`,
          type: "warning",
          link: `employee-detail:${body.employeeId}:delete:${deleteRequest.id}`,
        },
      });
    }

    return NextResponse.json(deleteRequest);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, reviewedBy, read } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      data.status = status;
      data.reviewedBy = reviewedBy;
      data.updatedAt = new Date();
    }
    if (read !== undefined) {
      data.read = read;
    }

    const deleteRequest = await db.deleteRequest.update({
      where: { id },
      data,
    });

    // If approved, soft-delete the employee
    if (status === "approved") {
      await db.employee.update({
        where: { id: deleteRequest.employeeId },
        data: { status: "deleted" },
      });
    }

    // Notify the requester only when status changes
    if (status) {
      await db.notification.create({
        data: {
          userId: deleteRequest.requestedBy,
          title: `Delete Request ${status === "approved" ? "Approved" : "Rejected"}`,
          message: `Your request to delete ${deleteRequest.employeeName} has been ${status}`,
          type: status === "approved" ? "success" : "danger",
        },
      });
    }

    return NextResponse.json(deleteRequest);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
