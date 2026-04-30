// src/app/(public)/profissional/[id]/_actions/create-appointment.ts

"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EmailTemplate } from "../_components/email-template"
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { checkCourtesyEligibility } from "@/lib/courtesy-eligibility";

const formSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    urlNameProfessional: z.string().min(1, "O nome do profissional é obrigatório"),
    email: z.string().email("Email inválido").min(1, "O email é obrigatório"),
    phone: z.string().min(1, "O telefone é obrigatório"),
    address: z.string().min(1, "O endereço é obrigatório"),
    date: z.date(),
    typeServiceId: z.string().min(1, "O serviço é obrigatório"),
    time: z.string().min(1, "O horário é obrigatório"),
    clinicId: z.string().min(1, "O prosfissional é obrigatória"),
})

type FormSchema = z.infer<typeof formSchema>

export async function createNewAppointment(formData: FormSchema) {
    console.log('📝 Iniciando criação de agendamento:', {
        name: formData.name,
        date: formData.date,
        time: formData.time,
        clinicId: formData.clinicId
    });

    const schema = formSchema.safeParse(formData)

    if (!schema.success) {
        console.error('❌ Validação falhou:', schema.error.issues);
        return {
            error: schema.error.issues[0].message
        }
    }

    try {
        const selectedDate = new Date(formData.date)
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        const appointmentDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

        console.log('📅 Data normalizada:', appointmentDate);

        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                appointmentDate: appointmentDate,
                time: formData.time,
                userId: formData.clinicId,
                typeServiceId: formData.typeServiceId,
                address: formData.address,
            }
        })

        if (existingAppointment) {
            console.warn('⚠️ Agendamento duplicado detectado');
            return {
                error: "Este horário já foi agendado. Por favor, selecione outro horário."
            }
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                time: formData.time,
                appointmentDate: appointmentDate,
                typeServiceId: formData.typeServiceId,
                userId: formData.clinicId,
                confirmed: false,
                source: "PUBLIC",
            }
        })

        console.log('✅ Agendamento criado:', newAppointment.id);

        // 🎁 Hook de elegibilidade (best-effort, nao quebra agendamento)
        await checkCourtesyEligibility({
            professionalUserId: formData.clinicId,
            appointmentId: newAppointment.id,
        });

        const [typeService, clinic] = await Promise.all([
            prisma.typeService.findUnique({
                where: { id: formData.typeServiceId }
            }),
            prisma.user.findUnique({
                where: { id: formData.clinicId },
                select: { 
                    name: true,
                    urlNameProfessional: true
                }
            })
        ]);

        if (!typeService) {
            console.error('❌ Serviço não encontrado');
            return {
                error: "Serviço não encontrado"
            }
        }

        try {
            console.log('📱 Tentando enviar WhatsApp...');
            
            const whatsappResult = await sendWhatsAppConfirmation({
                to: formData.phone,
                patientName: formData.name,
                professionalName: clinic?.name || 'Profissional',
                date: format(appointmentDate, "dd/MM/yyyy", { locale: ptBR }),
                time: formData.time,
                appointmentId: newAppointment.id,
            });

            if (whatsappResult.success) {
                console.log('✅ WhatsApp enviado com sucesso!');
            } else {
                console.error('❌ Erro ao enviar WhatsApp:', whatsappResult.error);
            }
        } catch (whatsappError) {
            console.error('❌ Erro no envio de WhatsApp (não crítico):', whatsappError);
        }

        try {
            const resendApiKey = process.env.RESEND_API_KEY;

            if (!resendApiKey) {
                console.warn('⚠️ RESEND_API_KEY não configurada. Email não será enviado.');
            } else {
                console.log('📧 Preparando envio de email para:', formData.email);

                const resend = new Resend(resendApiKey);

                const professionalSlug = clinic?.urlNameProfessional || 'profissional';

                const emailHtml = await render(EmailTemplate({
                    firstName: formData.name,
                    confirmationToken: newAppointment.confirmationToken,
                    clinicSlug: clinic?.urlNameProfessional || 'profissional',
                    clinicName: clinic?.name || 'BaseMedical',
                    serviceName: typeService.name,
                    date: formData.date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }),
                    time: formData.time,
                    address: formData.address,
                }));

                console.log('📨 Enviando email...');

                const { data, error } = await resend.emails.send({
                    from: 'BaseMedical <basemedical@karollynemorais.com.br>',
                    to: formData.email,
                    subject: '✓ Atendimento agendado com sucesso - BaseMedical',
                    html: emailHtml,
                });

                if (error) {
                    console.error('❌ Erro ao enviar email:', error);
                } else {
                    console.log('✅ Email enviado com sucesso:', data?.id);
                }
            }
        } catch (emailError) {
            console.error('❌ Erro no envio de email (não crítico):', emailError);
        }

        return {
            data: newAppointment,
            success: true
        }

    } catch (error) {
        console.error('❌ Erro ao criar agendamento:', error);
        
        if (error instanceof Error) {
            return {
                error: `Erro ao criar agendamento: ${error.message}`
            }
        }

        return {
            error: "Erro ao cadastrar agendamento. Tente novamente."
        }
    }
}