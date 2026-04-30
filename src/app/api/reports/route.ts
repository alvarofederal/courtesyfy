import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: "startDate must be before endDate" },
        { status: 400 }
      );
    }

    // Get appointments within date range for the current user (doctor)
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
        appointmentDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        typeService: true,
        user: {
          include: {
            profession: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    // Group by doctor
    const byDoctor = appointments.reduce((acc, appointment) => {
      const doctorName = appointment.user.name || "Unknown Doctor";
      if (!acc[doctorName]) {
        acc[doctorName] = 0;
      }
      acc[doctorName]++;
      return acc;
    }, {} as Record<string, number>);

    // Group by specialty
    const bySpecialty = appointments.reduce((acc, appointment) => {
      const specialty = appointment.user.specialty || "Unknown Specialty";
      if (!acc[specialty]) {
        acc[specialty] = 0;
      }
      acc[specialty]++;
      return acc;
    }, {} as Record<string, number>);

    // Group by service
    const byService = appointments.reduce((acc, appointment) => {
      const serviceName = appointment.typeService?.name || "Unknown Service";
      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName]++;
      return acc;
    }, {} as Record<string, number>);

    // Group by date
    const byDate = appointments.reduce((acc, appointment) => {
      const date = appointment.appointmentDate.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    const reportData = {
      totalConsultations: appointments.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      byDoctor: Object.entries(byDoctor).map(([name, count]) => ({
        doctor: name,
        count,
      })),
      bySpecialty: Object.entries(bySpecialty).map(([name, count]) => ({
        specialty: name,
        count,
      })),
      byService: Object.entries(byService).map(([name, count]) => ( {
        service: name,
        count,
      })),
      byDate: Object.entries(byDate).map(([date, count]) => ({
        date,
        count,
      })),
      detailedAppointments: appointments.map((appointment) => ({
        id: appointment.id,
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        date: appointment.appointmentDate.toLocaleDateString('pt-BR'),
        time: appointment.time,
        service: appointment.typeService?.name,
        doctor: appointment.user.name || "Unknown",
        specialty: appointment.user.specialty || "Unknown",
      })),
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
