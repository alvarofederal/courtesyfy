// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { manageSubscription } from '@/utils/manage-subscription';
import { Plan } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';
import { handlePlanChange } from '@/app/(panel)/dashboard/services/_actions/handle-plan-change';
import { getPlanFromPriceId } from '@/utils/stripe-config';


type PlanType = "FREE" | "PROFESSIONAL" | "TRIAL" | "EXPIRED";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error("❌ Webhook: Signature ausente");
      return NextResponse.json(
        { error: "Signature ausente" },
        { status: 400 }
      );
    }

    console.log("🔔 WEBHOOK STRIPE INICIANDO...");

    const text = await request.text();
    
    const event = stripe.webhooks.constructEvent(
      text, 
      signature, 
      process.env.STRIPE_SECRET_WEBHOOK_KEY as string,
    );

    console.log(`📨 Evento recebido: ${event.type}`);

    switch (event.type) {
      // ✅ ASSINATURA DELETADA (Cancelamento)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`🗑️ Subscription deletada: ${subscription.id}`);

        // Buscar subscription ANTES de deletar
        const oldSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          select: { userId: true, plan: true }
        });

        const oldPlan = oldSubscription?.plan as PlanType || 'PROFESSIONAL';

        // Atualizar/deletar subscription
        await manageSubscription(
          subscription.id,
          subscription.customer.toString(),
          false,
          true
        );

        console.log("✅ ASSINATURA DELETADA NO BANCO DE DADOS");

        // 🔥 SISTEMA INTELIGENTE: Downgrade para FREE
        if (oldSubscription?.userId && oldPlan !== 'FREE') {
          try {
            console.log(`🧠 Downgrade automático: ${oldPlan} → FREE`);

            const result = await handlePlanChange({
              userId: oldSubscription.userId,
              oldPlan: oldPlan,
              newPlan: 'FREE'
            });

            console.log(`✅ ${result.message}`);
            
            if (result.totalTypeServices && result.activeTypeServices) {
              console.log(`📊 Total: ${result.totalTypeServices}, Ativos: ${result.activeTypeServices}`);
            }

          } catch (error) {
            console.error("❌ Erro ao ajustar serviços:", error);
          }
        }

        revalidatePath('/dashboard/plans');
        revalidatePath('/panel/dashboard/services');
        break;
      }

      // ✅ ASSINATURA ATUALIZADA (Upgrade/Downgrade)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`🔄 Subscription atualizada: ${subscription.id}`);

        // Buscar plano ANTES da atualização
        const oldSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          select: { userId: true, plan: true }
        });

        const oldPlan = oldSubscription?.plan as PlanType || 'FREE';

        // 🔥 Determinar novo plano usando helper
        const priceId = subscription.items.data[0]?.price.id;
        const newPlan = priceId ? getPlanFromPriceId(priceId) : 'FREE';

        console.log(`📊 Mudança detectada: ${oldPlan} → ${newPlan}`);

        // Atualizar subscription
        await manageSubscription(
          subscription.id,
          subscription.customer.toString(),
          false,
        );

        // Atualizar campos de cancelamento
        try {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
              canceledAt: subscription.canceled_at 
                ? new Date(subscription.canceled_at * 1000) 
                : null,
              status: subscription.status as any,
            }
          });

          console.log("✅ Campos de cancelamento atualizados");
        } catch (error) {
          console.error("❌ Erro ao atualizar campos:", error);
        }

        // 🔥 SISTEMA INTELIGENTE: Ajustar serviços
        if (oldSubscription?.userId && oldPlan !== newPlan) {
          try {
            console.log(`🧠 Ajustando serviços para ${newPlan}...`);

            const result = await handlePlanChange({
              userId: oldSubscription.userId,
              oldPlan: oldPlan,
              newPlan: newPlan
            });

            console.log(`✅ ${result.message}`);

            if (result.reactivatedCount) {
              console.log(`🎉 ${result.reactivatedCount} serviço(s) reativado(s)!`);
            }

          } catch (error) {
            console.error("❌ Erro ao ajustar serviços:", error);
          }
        }

        revalidatePath('/dashboard/plans');
        revalidatePath('/panel/dashboard/services');
        break;
      }

      // ✅ CHECKOUT COMPLETO (Nova assinatura)
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        console.log(`🛒 Checkout completo: ${checkoutSession.id}`);

        const type = checkoutSession.metadata?.type || "FREE";
        const newPlan = type as PlanType;

        if (checkoutSession.subscription && checkoutSession.customer) {
          // Criar subscription
          await manageSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString(),
            true,
            false,
            type as Plan
          );

          console.log("✅ ASSINATURA CRIADA");

          // 🔥 SISTEMA INTELIGENTE: Configurar serviços
          try {
            const subscription = await prisma.subscription.findFirst({
              where: { stripeCustomerId: checkoutSession.customer.toString() },
              select: { userId: true }
            });

            if (subscription?.userId) {
              console.log(`🧠 Configurando serviços para ${newPlan}...`);

              const result = await handlePlanChange({
                userId: subscription.userId,
                oldPlan: 'FREE', // Assume que vem de FREE
                newPlan: newPlan
              });

              console.log(`✅ ${result.message}`);
            }

          } catch (error) {
            console.error("❌ Erro ao configurar serviços:", error);
          }
        }

        revalidatePath('/dashboard/plans');
        revalidatePath('/panel/dashboard/services');
        break;
      }

      // ⚠️ PAGAMENTO FALHOU
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log(`⚠️ Pagamento falhou: ${invoice.id}`);

        if (invoice.subscription) {
          const subscriptionId = typeof invoice.subscription === 'string' 
            ? invoice.subscription 
            : invoice.subscription.id;

          try {
            await prisma.subscription.update({
              where: { stripeSubscriptionId: subscriptionId },
              data: {
                status: "past_due",
                pastDueAt: new Date(),
              }
            });

            console.log("⚠️ Status: past_due");

          } catch (error) {
            console.error("❌ Erro ao atualizar status:", error);
          }
        }
        break;
      }

      // 💰 REEMBOLSO PROCESSADO
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`💰 Reembolso: ${charge.id}`);

        const refund = charge.refunds?.data[0];

        if (refund) {
          try {
            let userId: string | null = null;

            if (charge.customer) {
              const subscription = await prisma.subscription.findFirst({
                where: { stripeCustomerId: charge.customer.toString() },
                select: { userId: true }
              });
              userId = subscription?.userId || null;
            }

            if (userId) {
              await prisma.refund.create({
                data: {
                  stripeRefundId: refund.id,
                  amount: refund.amount,
                  reason: refund.reason || "Não especificado",
                  userId: userId,
                }
              });

              console.log("✅ REEMBOLSO REGISTRADO");
            }
          } catch (error) {
            console.error("❌ Erro ao registrar reembolso:", error);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("❌ ERRO NO WEBHOOK:", error);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}