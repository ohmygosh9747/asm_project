import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Get total unread notification count across all types (requests, warnings, fines)
export async function GET(request: NextRequest) {
  try {
    // Count unread warnings
    const unreadWarnings = await db.warning.count({
      where: { read: false },
    });

    // Count unread fines
    const unreadFines = await db.fine.count({
      where: { read: false },
    });

    // Count pending (unread) delete requests
    const unreadRequests = await db.deleteRequest.count({
      where: { status: "pending", read: false },
    });

    const total = unreadWarnings + unreadFines + unreadRequests;

    return NextResponse.json({
      total,
      warnings: unreadWarnings,
      fines: unreadFines,
      requests: unreadRequests,
    });
  } catch (error) {
    console.error("Notification count error:", error);
    return NextResponse.json({ total: 0, warnings: 0, fines: 0, requests: 0 }, { status: 500 });
  }
}
