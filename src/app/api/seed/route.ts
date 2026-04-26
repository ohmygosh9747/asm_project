import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Check if super admin exists
    const existingAdmin = await db.user.findFirst({ where: { role: "super_admin" } });
    if (existingAdmin) {
      return NextResponse.json({ message: "Database already seeded" });
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.user.create({
      data: {
        email: "superadmin@asm.com",
        name: "Super Admin",
        password: hashedPassword,
        role: "super_admin",
      },
    });

    // Create admin
    await db.user.create({
      data: {
        email: "admin@asm.com",
        name: "Admin User",
        password: hashedPassword,
        role: "admin",
      },
    });

    // Create sample employees with new fields
    const employees = [
      {
        employeeId: "EMP-001",
        fullName: "Elihoud Singirangabo",
        nationality: "Rwandan",
        dateOfBirth: "1990-03-15",
        phone: "+966 50 123 4567",
        email: "elihoud@asm.com",
        position: "Helper",
        joinDate: "2023-06-10",
        companyName: "Colourful Tracks Paints",
        passportStatus: "Valid",
        idStatus: "Valid",
        rating: 4,
        emergencyContact: "+966 55 111 2233",
        address: "Riyadh, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-002",
        fullName: "Mohammed Hassan",
        nationality: "Egyptian",
        dateOfBirth: "1992-07-22",
        phone: "+966 55 234 5678",
        email: "mohammed@asm.com",
        position: "Mason",
        joinDate: "2022-05-15",
        companyName: "Al-Salem Construction",
        passportStatus: "Valid",
        idStatus: "Pending",
        rating: 3,
        emergencyContact: "+966 50 222 3344",
        address: "Jeddah, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-003",
        fullName: "John Okafor",
        nationality: "Nigerian",
        dateOfBirth: "1988-11-30",
        phone: "+966 54 345 6789",
        email: "john@asm.com",
        position: "Welder",
        joinDate: "2021-09-01",
        companyName: "Steel Works Co.",
        passportStatus: "Expired",
        idStatus: "Valid",
        rating: 5,
        emergencyContact: "+966 56 333 4455",
        address: "Dammam, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-004",
        fullName: "Rajesh Kumar",
        nationality: "Indian",
        dateOfBirth: "1995-04-18",
        phone: "+966 53 456 7890",
        email: "rajesh@asm.com",
        position: "Electrician",
        joinDate: "2023-02-14",
        companyName: "Power Tech Solutions",
        passportStatus: "Valid",
        idStatus: "Valid",
        rating: 4,
        emergencyContact: "+966 57 444 5566",
        address: "Riyadh, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-005",
        fullName: "Karim Diabate",
        nationality: "Ghanaian",
        dateOfBirth: "1991-09-05",
        phone: "+966 51 567 8901",
        email: "karim@asm.com",
        position: "Plumber",
        joinDate: "2022-06-20",
        companyName: "Gulf Plumbing Services",
        passportStatus: "Valid",
        idStatus: "Expired",
        rating: 2,
        emergencyContact: "+966 55 555 6677",
        address: "Riyadh, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-006",
        fullName: "Abdul Rahman",
        nationality: "Bangladeshi",
        dateOfBirth: "1993-01-12",
        phone: "+966 52 678 9012",
        email: "abdul@asm.com",
        position: "Painter",
        joinDate: "2024-03-01",
        companyName: "Colourful Tracks Paints",
        passportStatus: "Pending",
        idStatus: "Valid",
        rating: 3,
        emergencyContact: "+966 58 666 7788",
        address: "Makkah, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-007",
        fullName: "Samuel Mwangi",
        nationality: "Kenyan",
        dateOfBirth: "1989-06-25",
        phone: "+966 53 789 0123",
        email: "samuel@asm.com",
        position: "Foreman",
        joinDate: "2020-11-15",
        companyName: "Al-Salem Construction",
        passportStatus: "Valid",
        idStatus: "Valid",
        rating: 5,
        emergencyContact: "+966 59 777 8899",
        address: "Jeddah, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-008",
        fullName: "Patrick Mbeki",
        nationality: "South African",
        dateOfBirth: "1987-12-08",
        phone: "+966 54 890 1234",
        email: "patrick@asm.com",
        position: "Crane Operator",
        joinDate: "2021-08-22",
        companyName: "Heavy Lift Operations",
        passportStatus: "Valid",
        idStatus: "Valid",
        rating: 4,
        emergencyContact: "+966 50 888 9900",
        address: "Dammam, Saudi Arabia",
        status: "active",
      },
    ];

    for (const emp of employees) {
      await db.employee.create({ data: emp });
    }

    return NextResponse.json({ message: "Database seeded successfully", credentials: { superAdmin: "superadmin@asm.com / admin123", admin: "admin@asm.com / admin123" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
