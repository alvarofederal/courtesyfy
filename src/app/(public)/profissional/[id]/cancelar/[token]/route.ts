import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; token: string }> }
) {
  try {
    const params = await context.params;
    const { id, token } = params;

    const appointmentToDelete = await prisma.appointment.findFirst({
      where: {
        confirmationToken: token,
        user: { urlNameProfessional: id }
      },
      include: {
        typeService: true,
        user: true,
      },
    });

    if (!appointmentToDelete) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id: appointmentToDelete.id } });

    const formattedDate = format(appointmentToDelete.appointmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>❌ Consulta Cancelada</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              background: white;
              border-radius: 24px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .cancel-icon { font-size: 80px; margin-bottom: 10px; }
            h1 { font-size: 28px; margin-bottom: 8px; }
            .content { padding: 40px 30px; }
            .info-card {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              border-left: 4px solid #ef4444;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
            }
            .info-row {
              display: flex;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid rgba(239, 68, 68, 0.1);
            }
            .info-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .info-icon { font-size: 24px; margin-right: 12px; min-width: 30px; }
            .info-label {
              font-size: 12px;
              text-transform: uppercase;
              color: #dc2626;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .info-value { font-size: 16px; color: #7f1d1d; font-weight: 600; }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .btn {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="cancel-icon">❌</div>
              <h1>Consulta Cancelada</h1>
              <p>Seu agendamento foi cancelado</p>
            </div>
            <div class="content">
              <div class="info-card">
                <div class="info-row">
                  <div class="info-icon">👤</div>
                  <div>
                    <div class="info-label">Paciente</div>
                    <div class="info-value">${appointmentToDelete.name}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">💼</div>
                  <div>
                    <div class="info-label">Serviço</div>
                    <div class="info-value">${appointmentToDelete.typeService?.name}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">📅</div>
                  <div>
                    <div class="info-label">Data</div>
                    <div class="info-value">${formattedDate}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">🕐</div>
                  <div>
                    <div class="info-label">Horário</div>
                    <div class="info-value">${appointmentToDelete.time}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">🏥</div>
                  <div>
                    <div class="info-label">Profissional</div>
                    <div class="info-value">${appointmentToDelete.user.name}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">📍</div>
                  <div>
                    <div class="info-label">Local</div>
                    <div class="info-value">${appointmentToDelete.address}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer">
              <a href="${process.env.NEXT_PUBLIC_URL}/profissional/${id}" class="btn">
                Fazer Novo Agendamento
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 });
  }
}