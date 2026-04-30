"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, 
  Calendar, 
  Users, 
  FileText, 
  FileDown, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportData {
  totalConsultations: number;
  confirmedCount: number;
  pendingCount: number;
  revenue: number;
  dateRange: {
    start: string;
    end: string;
  };
  byDoctor: { doctor: string; count: number }[];
  bySpecialty: { specialty: string; count: number }[];
  byService: { service: string; count: number }[];
  byDate: { date: string; count: number }[];
  detailedAppointments: {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    typeService: string;
    doctor: string;
    specialty: string;
    confirmed: boolean | number;
  }[];
}

export default function ReportsPage() {
  
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {

    if (!startDate || !endDate) {
      setError("Por favor, selecione as datas.");
      return;
    }

    if (startDate > endDate) {
      setError("Data de início deve ser anterior à data de fim.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      const response = await fetch(`/api/reports?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar relatório");
      }

      const data = await response.json();
      console.log('📊 Report Data:', data);
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvContent = [
      ["Nome", "Data", "Horário", "Serviço", "Médico", "Especialidade", "Status"],
      ...reportData.detailedAppointments.map(appointment => [
        appointment.name,
        appointment.date,
        appointment.time,
        appointment.typeService,
        appointment.doctor,
        appointment.specialty,
        appointment.confirmed ? "Confirmado" : "Pendente"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-${reportData.dateRange.start}-${reportData.dateRange.end}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    import('jspdf').then((jsPDFModule) => {
      const jsPDF = jsPDFModule.default;
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Atendimentos - BaseMedical', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Período: ${reportData.dateRange.start} até ${reportData.dateRange.end}`, margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Geral:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de Atendimentos: ${reportData.totalConsultations}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Confirmados: ${reportData.confirmedCount} | Pendentes: ${reportData.pendingCount}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Receita Estimada: R$ ${reportData.revenue.toFixed(2)}`, margin, yPosition);
      yPosition += 15;

      const groupedByDate = reportData.detailedAppointments.reduce((acc, appointment) => {
        if (!acc[appointment.date]) {
          acc[appointment.date] = [];
        }
        acc[appointment.date].push(appointment);
        return acc;
      }, {} as Record<string, typeof reportData.detailedAppointments>);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detalhes dos Atendimentos', margin, yPosition);
      yPosition += 10;

      Object.entries(groupedByDate).forEach(([date, appointments]) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(date, margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        appointments.forEach((appointment) => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = margin;
          }

          const status = appointment.confirmed ? "✓" : "⏳";
          pdf.text(`${status} ${appointment.time} - ${appointment.name} (${appointment.typeService})`, margin + 5, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
      });

      pdf.save(`relatorio-basemedical-${reportData.dateRange.start}-${reportData.dateRange.end}.pdf`);
    });
  };

  const confirmationRate = reportData && reportData.totalConsultations > 0
    ? ((reportData.confirmedCount / reportData.totalConsultations) * 100).toFixed(1)
    : "0";

  const isConfirmed = (confirmed: boolean | number) => {
    return confirmed === true || confirmed === 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
              Relatórios e Análises
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Visualize métricas e dados dos seus atendimentos</p>
          </div>
        </div>

        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Selecionar Período
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={generateReport}
                  disabled={loading}
                  className={cn(
                    "w-full h-11",
                    "bg-gradient-to-r from-emerald-500 to-teal-600",
                    "hover:from-emerald-600 hover:to-teal-700"
                  )}
                >
                  {loading ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {reportData && (
          <>
            <div className="grid gap-3 md:gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {reportData.totalConsultations}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 shadow-md">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Confirmados</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {reportData.confirmedCount}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-md">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Pendentes</p>
                      <p className="text-2xl font-bold text-orange-600 mt-1">
                        {reportData.pendingCount}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-md">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Taxa Confirm.</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {confirmationRate}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-md">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Receita</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">
                        R$ {reportData.revenue}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b pb-3">
                  <CardTitle className="text-base">Top Serviços</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {reportData.byService.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.service}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ 
                                width: `${(item.count / reportData.totalConsultations) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Por Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {reportData.byDoctor.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">
                          {item.doctor}
                        </span>
                        <span className="text-base font-bold text-emerald-600">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b pb-3">
                  <CardTitle className="text-base">Por Especialidade</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {reportData.bySpecialty.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">
                          {item.specialty}
                        </span>
                        <span className="text-base font-bold text-teal-600">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg md:text-xl">Detalhes dos Atendimentos</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportToPDF} variant="outline" size="sm">
                      <FileDown className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto px-4 lg:px-6">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Horário</TableHead>
                        <TableHead className="font-semibold">Paciente</TableHead>
                        <TableHead className="font-semibold">Serviço</TableHead>
                        <TableHead className="font-semibold">Profissional</TableHead>
                        <TableHead className="font-semibold text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.detailedAppointments.map((appointment) => (
                        <TableRow key={appointment.id} className="hover:bg-emerald-50">
                          <TableCell className="text-sm">{appointment.date}</TableCell>
                          <TableCell className="text-sm font-medium">
                            <Clock className="w-4 h-4 inline mr-1 text-gray-500" />
                            {appointment.time}
                          </TableCell>
                          <TableCell className="font-medium">{appointment.name}</TableCell>
                          <TableCell className="text-sm">{appointment.typeService}</TableCell>
                          <TableCell className="text-sm">{appointment.doctor}</TableCell>
                          <TableCell className="text-center">
                            {isConfirmed(appointment.confirmed) ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Confirmado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Pendente
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}