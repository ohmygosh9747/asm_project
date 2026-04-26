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

    // Create sample employees
    const employees = [
      {
        employeeId: "EMP-001",
        fullName: "Ahmed Al-Rashid",
        nationality: "Saudi Arabian",
        dateOfBirth: "1985-03-15",
        phone: "+966 50 123 4567",
        email: "ahmed@asm.com",
        position: "Project Manager",
        department: "Operations",
        joinDate: "2020-01-10",
        skills: "Project Management, Leadership, Communication",
        experience: "15 years in construction management",
        education: "BSc Civil Engineering, KFUPM",
        languages: "Arabic, English",
        emergencyContact: "+966 55 111 2233",
        address: "Riyadh, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-002",
        fullName: "Mohammed Hassan",
        nationality: "Egyptian",
        dateOfBirth: "1990-07-22",
        phone: "+966 55 234 5678",
        email: "mohammed@asm.com",
        position: "Site Engineer",
        department: "Engineering",
        joinDate: "2021-05-15",
        skills: "AutoCAD, Structural Analysis, Site Supervision",
        experience: "10 years in structural engineering",
        education: "MSc Structural Engineering, Cairo University",
        languages: "Arabic, English, French",
        emergencyContact: "+966 50 222 3344",
        address: "Jeddah, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-003",
        fullName: "Ali Al-Farsi",
        nationality: "Omani",
        dateOfBirth: "1988-11-30",
        phone: "+966 54 345 6789",
        email: "ali@asm.com",
        position: "Safety Officer",
        department: "HSE",
        joinDate: "2019-09-01",
        skills: "NEBOSH, OSHA, Risk Assessment, Fire Safety",
        experience: "12 years in health and safety",
        education: "BSc Occupational Health, Sultan Qaboos University",
        languages: "Arabic, English",
        emergencyContact: "+966 56 333 4455",
        address: "Dammam, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-004",
        fullName: "Fatima Al-Zahra",
        nationality: "Jordanian",
        dateOfBirth: "1992-04-18",
        phone: "+966 53 456 7890",
        email: "fatima@asm.com",
        position: "HR Coordinator",
        department: "Human Resources",
        joinDate: "2022-02-14",
        skills: "Recruitment, Employee Relations, HRIS, Payroll",
        experience: "8 years in human resources",
        education: "BA Business Administration, University of Jordan",
        languages: "Arabic, English",
        emergencyContact: "+966 57 444 5566",
        address: "Riyadh, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-005",
        fullName: "Khalid bin Salman",
        nationality: "Saudi Arabian",
        dateOfBirth: "1983-09-05",
        phone: "+966 51 567 8901",
        email: "khalid@asm.com",
        position: "Finance Manager",
        department: "Finance",
        joinDate: "2018-06-20",
        skills: "Financial Analysis, Budgeting, SAP, Auditing",
        experience: "18 years in finance and accounting",
        education: "MBA Finance, King Saud University",
        languages: "Arabic, English",
        emergencyContact: "+966 55 555 6677",
        address: "Riyadh, Saudi Arabia",
        status: "active",
      },
      {
        employeeId: "EMP-006",
        fullName: "Omar Siddiqui",
        nationality: "Pakistani",
        dateOfBirth: "1995-01-12",
        phone: "+966 52 678 9012",
        email: "omar@asm.com",
        position: "Electrician",
        department: "Maintenance",
        joinDate: "2023-03-01",
        skills: "Electrical Wiring, PLC Programming, Motor Controls",
        experience: "5 years in industrial electrical work",
        education: "Diploma Electrical Engineering, NED University",
        languages: "Urdu, Arabic, English",
        emergencyContact: "+966 58 666 7788",
        address: "Makkah, Saudi Arabia",
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
