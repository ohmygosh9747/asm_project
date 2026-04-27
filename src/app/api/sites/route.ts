import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/sites — list all sites
export async function GET() {
  try {
    const sites = await db.site.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(sites, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("Sites GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }
}

// POST /api/sites — create a new site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Site name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if site already exists
    const existing = await db.site.findUnique({ where: { name: trimmedName } });
    if (existing) {
      return NextResponse.json(existing); // Return existing, don't fail
    }

    const site = await db.site.create({
      data: { name: trimmedName },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error("Sites POST error:", error);
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  }
}

// DELETE /api/sites — delete a site by name
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Site id is required" }, { status: 400 });
    }

    await db.site.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sites DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  }
}
