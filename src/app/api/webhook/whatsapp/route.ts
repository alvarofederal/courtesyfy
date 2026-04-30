// app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    // Validar assinatura Twilio
    const twilioSignature = req.headers.get('x-twilio-signature') || '';
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      twilioSignature,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`,
      Object.fromEntries(params)
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const messageBody = params.get('Body')?.toLowerCase();
    const from = params.get('From');
    
    // Extrair appointmentId da mensagem (você pode usar um formato específico)
    // Por exemplo: "CONFIRM_abc123" ou "CANCEL_abc123"
    
    if (messageBody?.includes('confirmar') || messageBody?.includes('sim')) {
      // Atualizar status no banco
      // await prisma.appointment.update({
      //   where: { id: appointmentId },
      //   data: { status: 'CONFIRMED' }
      // });
      
      return NextResponse.json({ success: true });
    }
    
    if (messageBody?.includes('cancelar') || messageBody?.includes('não')) {
      // await prisma.appointment.update({
      //   where: { id: appointmentId },
      //   data: { status: 'CANCELLED' }
      // });

    client.messages
        .create({
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            contentSid: accountSid,
            contentVariables: '{"1":"12/1","2":"3pm"}',
            to: 'whatsapp:+556199545417'
        })
        .then((message: any) => console.log(message.sid))
        .done();
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}



