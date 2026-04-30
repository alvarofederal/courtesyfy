// scripts/test-whatsapp.ts
import 'dotenv/config'; // ✅ ADICIONAR ISSO NO TOPO
import { sendWhatsAppConfirmation } from '../src/lib/whatsapp';

async function test() {
  // Debug: verificar se as variáveis foram carregadas
  console.log('🔍 Verificando variáveis de ambiente:');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***definido***' : 'undefined');
  console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER);
  console.log('');

  const result = await sendWhatsAppConfirmation({
    to: '61999545417',
    patientName: 'Teste',
    professionalName: 'Dr. Teste',
    date: '26/11/2024',
    time: '14:00',
    appointmentId: 'test-123',
  });

  console.log('Resultado:', result);
}

test();