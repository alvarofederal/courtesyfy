import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  confirmationToken: string; // ✅ Trocar de appointmentId
  clinicSlug: string;
  clinicName: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
}

export function EmailTemplate({ 
  firstName, 
  confirmationToken, // ✅ Trocar
  clinicSlug,
  clinicName, 
  serviceName, 
  date, 
  time,
  address 
}: EmailTemplateProps) {
const confirmUrl = `${process.env.NEXT_PUBLIC_URL}/profissional/${clinicSlug}/confirmar/${confirmationToken}`;
const cancelUrl = `${process.env.NEXT_PUBLIC_URL}/profissional/${clinicSlug}/cancelar/${confirmationToken}`;
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#f3f4f6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Container Principal */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f3f4f6' }}>
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              {/* Card do Email */}
              <table width="600" cellPadding="0" cellSpacing="0" style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                {/* Header com Gradiente */}
                <tr>
                  <td style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                    padding: '40px 30px',
                    textAlign: 'center'
                  }}>
                    <h1 style={{
                      margin: 0,
                      color: '#ffffff',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      letterSpacing: '-0.5px'
                    }}>
                      ✓ Agendamento Confirmado
                    </h1>
                    <p style={{
                      margin: '10px 0 0 0',
                      color: '#ffffff',
                      fontSize: '16px',
                      opacity: 0.95
                    }}>
                      BaseMedical
                    </p>
                  </td>
                </tr>

                {/* Corpo do Email */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    {/* Saudação */}
                    <p style={{
                      margin: '0 0 20px 0',
                      fontSize: '18px',
                      color: '#1f2937',
                      lineHeight: '1.6'
                    }}>
                      Olá <strong style={{ color: '#10b981' }}>{firstName}</strong>,
                    </p>

                    <p style={{
                      margin: '0 0 30px 0',
                      fontSize: '16px',
                      color: '#4b5563',
                      lineHeight: '1.6'
                    }}>
                      Seu atendimento foi agendado com sucesso! Veja os detalhes abaixo:
                    </p>

                    {/* Card de Detalhes */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{
                      backgroundColor: '#f0fdfa',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                      marginBottom: '30px'
                    }}>
                      <tr>
                        <td style={{ padding: '24px' }}>
                          <h2 style={{
                            margin: '0 0 20px 0',
                            fontSize: '20px',
                            color: '#065f46',
                            fontWeight: '600'
                          }}>
                            📋 Detalhes do Atendimento
                          </h2>

                          {/* Item: Profissional */}
                          <table width="100%" cellPadding="8" cellSpacing="0" style={{ marginBottom: '12px' }}>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#047857',
                                fontWeight: '600',
                                width: '120px'
                              }}>
                                🏥 Profissional:
                              </td>
                              <td style={{
                                fontSize: '15px',
                                color: '#065f46'
                              }}>
                                {clinicName}
                              </td>
                            </tr>
                          </table>

                          {/* Item: Serviço */}
                          <table width="100%" cellPadding="8" cellSpacing="0" style={{ marginBottom: '12px' }}>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#047857',
                                fontWeight: '600',
                                width: '120px'
                              }}>
                                💼 Serviço:
                              </td>
                              <td style={{
                                fontSize: '15px',
                                color: '#065f46'
                              }}>
                                {serviceName}
                              </td>
                            </tr>
                          </table>

                          {/* Item: Local */}
                          <table width="100%" cellPadding="8" cellSpacing="0" style={{ marginBottom: '12px' }}>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#047857',
                                fontWeight: '600',
                                width: '120px'
                              }}>
                                📍 Local do atendimento:
                              </td>
                              <td style={{
                                fontSize: '15px',
                                color: '#065f46'
                              }}>
                                {address}
                              </td>
                            </tr>
                          </table>

                          {/* Item: Data */}
                          <table width="100%" cellPadding="8" cellSpacing="0" style={{ marginBottom: '12px' }}>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#047857',
                                fontWeight: '600',
                                width: '120px'
                              }}>
                                📅 Data do agendamento:
                              </td>
                              <td style={{
                                fontSize: '15px',
                                color: '#065f46',
                                fontWeight: '600'
                              }}>
                                {date}
                              </td>
                            </tr>
                          </table>

                          {/* Item: Horário */}
                          <table width="100%" cellPadding="8" cellSpacing="0">
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#047857',
                                fontWeight: '600',
                                width: '120px'
                              }}>
                                ⏰ Horário do agendamento:
                              </td>
                              <td style={{
                                fontSize: '15px',
                                color: '#065f46',
                                fontWeight: '600'
                              }}>
                                {time}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Botões de Ação */}
                    <p style={{
                      margin: '0 0 20px 0',
                      fontSize: '16px',
                      color: '#4b5563',
                      textAlign: 'center'
                    }}>
                      Por favor, confirme sua presença:
                    </p>

                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center" style={{ padding: '0 0 30px 0' }}>
                          {/* Botão Confirmar */}
                          <a href={confirmUrl} style={{
                            display: 'inline-block',
                            padding: '16px 32px',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginRight: '12px',
                            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                          }}>
                            ✓ CONFIRMAR PRESENÇA
                          </a>

                          {/* Botão Cancelar */}
                          <a href={cancelUrl} style={{
                            display: 'inline-block',
                            padding: '16px 32px',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)'
                          }}>
                            ✗ CANCELAR
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Informações Adicionais */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      border: '1px solid #fbbf24',
                      marginBottom: '20px'
                    }}>
                      <tr>
                        <td style={{ padding: '16px' }}>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#92400e',
                            lineHeight: '1.5'
                          }}>
                            <strong>⚠️ Importante:</strong> Chegue com 10 minutos de antecedência. 
                            Em caso de imprevistos, entre em contato com antecedência.
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Mensagem Final */}
                    <p style={{
                      margin: '0',
                      fontSize: '15px',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      textAlign: 'center'
                    }}>
                      Estamos ansiosos para atendê-lo!<br />
                      Qualquer dúvida, entre em contato conosco.
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{
                    backgroundColor: '#f9fafb',
                    padding: '30px',
                    textAlign: 'center',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <p style={{
                      margin: '0 0 10px 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <strong style={{ color: '#10b981' }}>BaseMedical</strong>
                    </p>
                    <p style={{
                      margin: '0 0 10px 0',
                      fontSize: '13px',
                      color: '#9ca3af'
                    }}>
                      Sistema de Agendamento Online
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      © {new Date().getFullYear()} BaseMedical. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}