// Email de aprovacao da cortesia condicional. Caprichado — primeiro contato
// importante apos o profissional cumprir o desafio.

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type Props = {
  professionalName?: string | null
  courtesyCode: string
  validUntil: Date
}

const METAL = "#009b87"
const METAL_DARK = "#006b5e"
const METAL_LIGHT = "#00c4a8"
const REDEEM_URL = "https://basemedical.online/dashboard/courtesies/redeem"

export function CourtesyApprovalEmail({
  professionalName,
  courtesyCode,
  validUntil,
}: Props) {
  const firstName = professionalName?.split(" ")[0] || "Doutor(a)"
  const validUntilStr = validUntil.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Html>
      <Head />
      <Preview>
        🎁 Sua cortesia de 3 meses na Basemedical está liberada
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header com gradiente metalico */}
          <Section style={header}>
            <Heading style={h1}>🎁 Cortesia liberada!</Heading>
            <Text style={subtitle}>
              Você cumpriu o desafio. Bem-vindo(a) ao plano completo.
            </Text>
          </Section>

          {/* Saudação */}
          <Section style={contentSection}>
            <Text style={greeting}>Olá, {firstName}!</Text>
            <Text style={paragraph}>
              Sua confiança nos motivou — e você foi rápido(a). Em menos de 48
              horas após se cadastrar, recebeu seu primeiro paciente pela
              Basemedical. Parabéns! 👏
            </Text>
            <Text style={paragraph}>
              Como prometemos na landing, sua cortesia de{" "}
              <strong>3 meses do plano completo</strong> está liberada. É só
              ativar usando o código abaixo:
            </Text>
          </Section>

          {/* Código em destaque */}
          <Section style={codeWrap}>
            <Text style={codeLabel}>SEU CÓDIGO DE CORTESIA</Text>
            <Text style={codeValue}>{courtesyCode}</Text>
            <Text style={codeValid}>
              Válido até <strong>{validUntilStr}</strong>
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={REDEEM_URL} style={ctaButton}>
              Ativar minha cortesia
            </Button>
            <Text style={ctaHint}>
              Faça login, vá em <strong>Cortesias</strong> e cole o código.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* O que você pode fazer */}
          <Section style={contentSection}>
            <Heading as="h2" style={h2}>
              Tudo que você desbloqueia agora
            </Heading>
            <Text style={paragraph}>
              Com o plano completo ativo, você tem acesso a 3 perfis diferentes
              de uso da Basemedical — escolha o que combina com seu momento:
            </Text>

            <Section style={profileCard}>
              <Text style={profileBadge}>PERFIL TOTAL</Text>
              <Text style={profileTitle}>Tudo, do agendamento à gestão</Text>
              <Text style={profileDesc}>
                Página pública com agendamento online, calendário visual com
                status do dia, lembretes vinculados aos atendimentos, QR Code
                pra compartilhar, multi-endereço, relatórios, comentários de
                pacientes. O perfil indicado pra quem quer escala.
              </Text>
            </Section>

            <Section style={profileCard}>
              <Text style={profileBadge}>PERFIL INFO</Text>
              <Text style={profileTitle}>
                Vitrine profissional sem agendamento online
              </Text>
              <Text style={profileDesc}>
                Página pública só com suas informações (especialidade, locais,
                forma de contato). Ideal pra quem ainda gerencia agenda em
                outro lugar mas quer presença digital validada.
              </Text>
            </Section>

            <Section style={profileCard}>
              <Text style={profileBadge}>PERFIL WAITLIST</Text>
              <Text style={profileTitle}>Lista de espera inteligente</Text>
              <Text style={profileDesc}>
                Pra quem está com agenda lotada. O paciente entra na lista, e
                você organiza por prioridade. Ótimo pra especialistas com
                demanda alta.
              </Text>
            </Section>

            <Text style={paragraph}>
              Você pode trocar de perfil quando quiser, dentro do painel.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Próximos passos */}
          <Section style={contentSection}>
            <Heading as="h2" style={h2}>
              Próximos 5 minutos
            </Heading>
            <Text style={stepLine}>
              <strong>1.</strong> Ative o código acima
            </Text>
            <Text style={stepLine}>
              <strong>2.</strong> Configure seu perfil (foto, especialidade,
              presentação)
            </Text>
            <Text style={stepLine}>
              <strong>3.</strong> Compartilhe seu link público — ou QR Code —
              com seus pacientes
            </Text>
            <Text style={stepLine}>
              <strong>4.</strong> Acompanhe sua agenda em tempo real, sem
              WhatsApp na mão
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Suporte */}
          <Section style={contentSection}>
            <Text style={paragraphMuted}>
              Qualquer dúvida, abra um chamado direto pelo painel — em{" "}
              <strong>Chamados</strong>. A gente responde rápido.
            </Text>
            <Text style={paragraphMuted}>
              Bem-vindo(a) à Basemedical. 💚
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Basemedical — Plataforma de Agendamento para Profissionais da
              Saúde
            </Text>
            <Text style={footerText}>
              Você está recebendo este email porque cumpriu o desafio da
              cortesia condicional vindo da nossa landing page.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// === styles ===
const body: React.CSSProperties = {
  backgroundColor: "#f5f7fa",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: "32px 16px",
}

const container: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 20px 60px -20px rgba(0,155,135,0.25)",
  border: "1px solid #e5e7eb",
}

const header: React.CSSProperties = {
  background: `linear-gradient(135deg, ${METAL_DARK} 0%, ${METAL} 50%, ${METAL_LIGHT} 100%)`,
  padding: "40px 32px",
  textAlign: "center",
}

const h1: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: 800,
  margin: 0,
  lineHeight: 1.2,
}

const subtitle: React.CSSProperties = {
  color: "rgba(255,255,255,0.95)",
  fontSize: "16px",
  margin: "12px 0 0 0",
}

const contentSection: React.CSSProperties = {
  padding: "0 32px",
}

const greeting: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#111827",
  margin: "32px 0 16px 0",
}

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#374151",
  margin: "0 0 16px 0",
}

const paragraphMuted: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "#6b7280",
  margin: "0 0 12px 0",
}

const codeWrap: React.CSSProperties = {
  margin: "24px 32px",
  padding: "28px 24px",
  textAlign: "center",
  background:
    "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
  border: `2px dashed ${METAL}`,
  borderRadius: "12px",
}

const codeLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  color: METAL_DARK,
  margin: "0 0 8px 0",
}

const codeValue: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 800,
  fontFamily: "'Courier New', monospace",
  letterSpacing: "2px",
  color: "#064e3b",
  margin: "0 0 8px 0",
}

const codeValid: React.CSSProperties = {
  fontSize: "13px",
  color: "#065f46",
  margin: 0,
}

const ctaSection: React.CSSProperties = {
  padding: "0 32px",
  textAlign: "center",
}

const ctaButton: React.CSSProperties = {
  background: `linear-gradient(135deg, ${METAL_LIGHT} 0%, ${METAL} 50%, ${METAL_DARK} 100%)`,
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 700,
  padding: "14px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 10px 30px -10px rgba(0,155,135,0.6)",
}

const ctaHint: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "12px 0 0 0",
}

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "32px 32px",
}

const h2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#111827",
  margin: "0 0 16px 0",
}

const profileCard: React.CSSProperties = {
  margin: "16px 0",
  padding: "16px",
  borderLeft: `4px solid ${METAL}`,
  backgroundColor: "#f9fafb",
  borderRadius: "0 8px 8px 0",
}

const profileBadge: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "1.5px",
  color: METAL_DARK,
  margin: "0 0 4px 0",
}

const profileTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#111827",
  margin: "0 0 8px 0",
}

const profileDesc: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.5,
  color: "#4b5563",
  margin: 0,
}

const stepLine: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.7,
  color: "#374151",
  margin: "0 0 4px 0",
}

const footer: React.CSSProperties = {
  padding: "24px 32px",
  textAlign: "center",
  backgroundColor: "#f9fafb",
}

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 4px 0",
  lineHeight: 1.5,
}
