// lib/whatsapp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppConfirmation({
  to,
  patientName,
  professionalName,
  date,
  time,
  appointmentId,
}: {
  to: string;
  patientName: string;
  professionalName: string;
  date: string;
  time: string;
  appointmentId: string;
}) {
  try {
    // Validar e formatar número
    let phoneNumber = to.replace(/\D/g, ''); // Remove tudo que não é número
    
    console.log('📱 Número original:', to);
    console.log('📱 Número limpo:', phoneNumber);
    
    // Se não começar com código do país, adicionar +55 (Brasil)
    if (!phoneNumber.startsWith('55')) {
      phoneNumber = '55' + phoneNumber;
    }
    
    // Adicionar + no início se não tiver
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    console.log('📱 Número formatado final:', phoneNumber);
    console.log('📱 Número WhatsApp sandbox:', process.env.TWILIO_WHATSAPP_NUMBER);

    // Validar se tem 13 dígitos (55 + DDD + número)
    if (phoneNumber.replace('+', '').length !== 13) {
      throw new Error(`Número inválido. Esperado 13 dígitos, recebido: ${phoneNumber.replace('+', '').length}`);
    }

    // Enviar mensagem
    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: `🩺 *Confirmação de Consulta - BaseMedical*

Olá ${patientName}!

Sua consulta foi agendada com sucesso:

👨‍⚕️ Profissional: ${professionalName}
📅 Data: ${date}
🕐 Horário: ${time}

✅ Para confirmar, responda: CONFIRMAR
❌ Para cancelar, responda: CANCELAR

ID: ${appointmentId}`,
    });

    console.log('✅ WhatsApp enviado! SID:', message.sid);
    return { success: true, messageSid: message.sid };
    
  } catch (error: any) {
    console.error('❌ Erro completo ao enviar WhatsApp:', error);
    
    // Logs detalhados para debug
    if (error.code === 20422) {
      console.error('⚠️ ERRO 20422 - Possíveis causas:');
      console.error('1. Número não está registrado no Sandbox do Twilio');
      console.error('2. Formato de número inválido');
      console.error('3. Envie "join industrial-grain" para +14155238886 no WhatsApp');
    }
    
    console.error('Detalhes do erro:', {
      status: error.status,
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo,
      details: error.details,
    });
    
    return { 
      error: error.message || 'Erro ao enviar mensagem',
      code: error.code,
    };
  }
}