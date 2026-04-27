import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email") || "";
    
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, darkMode: true },
    });
    
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
