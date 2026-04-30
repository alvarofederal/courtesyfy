import { redirect } from "next/navigation"
import QRCode from "qrcode"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AutoPrint } from "./_components/auto-print"

const BASE_URL = "https://basemedical.online"

async function buildQrDataUrl(code: string): Promise<string> {
  const url = `${BASE_URL}/register?courtesy=${encodeURIComponent(code)}`
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
    color: { dark: "#065f46", light: "#ffffff" },
  })
}

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function PrintCourtesiesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard/profile")

  const { ids: idsParam } = await searchParams
  const ids = (idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) redirect("/dashboard/courtesies")

  const now = new Date()

  const eligible = await prisma.courtesyKey.findMany({
    where: {
      id: { in: ids },
      printedAt: null,
      redeemedAt: null,
      validUntil: { gt: now },
    },
    select: {
      id: true,
      code: true,
      validUntil: true,
      batchId: true,
    },
    orderBy: { createdAt: "asc" },
  })

  if (eligible.length === 0) redirect("/dashboard/courtesies")

  await prisma.courtesyKey.updateMany({
    where: { id: { in: eligible.map((k) => k.id) } },
    data: { printedAt: now },
  })

  const eligibleWithQr = await Promise.all(
    eligible.map(async (k) => ({
      ...k,
      qrDataUrl: await buildQrDataUrl(k.code),
    }))
  )

  return (
    <>
      <AutoPrint />
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .courtesy-card { box-shadow: none !important; }
        }
        .cut-line {
          border-top: 1.5px dashed #10b981;
        }
        .courtesy-card {
          break-inside: avoid;
          page-break-inside: avoid;
          position: relative;
          overflow: hidden;
        }
        .stamp {
          transform: rotate(-14deg);
        }
        .pattern-bg {
          background-image:
            radial-gradient(circle at 20% 30%, rgba(16,185,129,0.08) 0, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(20,184,166,0.08) 0, transparent 40%);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 print:bg-white">
        <div className="no-print max-w-4xl mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
          <p className="text-sm text-emerald-900">
            <strong>{eligible.length} chave(s)</strong> marcadas como impressas. A janela de impressão abrirá
            automaticamente. Após imprimir, os códigos não poderão mais ser revelados no painel.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-0">
          {eligibleWithQr.map((k, i) => (
            <div key={k.id}>
              {i > 0 && <div className="cut-line my-4" />}
              <CourtesyCard
                code={k.code}
                validUntil={k.validUntil}
                batchId={k.batchId}
                qrDataUrl={k.qrDataUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function MedicalCross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
    </svg>
  )
}

function Heartbeat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M0 12 L20 12 L28 4 L36 20 L44 8 L52 16 L60 12 L120 12" />
    </svg>
  )
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    </svg>
  )
}

function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="3" />
      <circle cx="25" cy="8" r="2" />
      <circle cx="8" cy="25" r="2" />
      <path d="M 0 50 Q 25 25 50 0" strokeDasharray="2 3" opacity="0.5" />
      <path d="M 0 70 Q 35 35 70 0" strokeDasharray="2 3" opacity="0.3" />
    </svg>
  )
}

function CourtesyCard({
  code,
  validUntil,
  batchId,
  qrDataUrl,
}: {
  code: string
  validUntil: Date
  batchId: string | null
  qrDataUrl: string
}) {
  return (
    <div className="courtesy-card pattern-bg bg-white border-2 border-emerald-300 rounded-2xl shadow-lg">
      {/* Barra superior colorida com padrão */}
      <div className="h-3 rounded-t-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 flex">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-white/40" />
          ))}
        </div>
      </div>

      <div className="p-6 relative">
        {/* Flourishes nos cantos */}
        <CornerFlourish className="absolute top-0 left-0 w-20 h-20 text-emerald-300 opacity-40" />
        <CornerFlourish className="absolute bottom-0 right-0 w-20 h-20 text-teal-300 opacity-40 rotate-180" />

        {/* Cruz médica decorativa de fundo */}
        <MedicalCross className="absolute top-4 right-16 w-16 h-16 text-emerald-50" />
        <MedicalCross className="absolute bottom-8 left-16 w-10 h-10 text-teal-50" />

        <div className="relative grid grid-cols-[1fr_auto] gap-6 items-stretch">
          <div className="space-y-4">
            {/* Header com logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <MedicalCross className="w-7 h-7 text-white" />
                </div>
                <Sparkle className="absolute -top-1 -right-1 w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="font-extrabold text-xl text-gray-900 leading-tight">
                  Base<span className="text-emerald-600">Medical</span>
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold tracking-wide">
                  Agendamentos dos Profissionais da Saúde
                </p>
              </div>
            </div>

            {/* Linha de batimento cardíaco */}
            <div className="text-emerald-500">
              <Heartbeat className="w-full h-4" />
            </div>

            {/* Código destacado */}
            <div className="relative rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-400 px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-1 flex items-center gap-1">
                <Sparkle className="w-3 h-3" /> Chave de Cortesia
              </p>
              <p className="font-mono text-2xl font-black tracking-widest text-gray-900 select-all">
                {code}
              </p>
            </div>

            {/* Infos secundárias */}
            <div className="flex gap-4 text-xs">
              <div className="flex-1 bg-white/60 rounded-md px-3 py-2 border border-emerald-100">
                <p className="text-gray-500 text-[10px] uppercase tracking-wide">Válida até</p>
                <p className="font-bold text-emerald-700 text-sm">
                  {validUntil.toLocaleDateString("pt-BR")}
                </p>
              </div>
              {batchId && (
                <div className="flex-1 bg-white/60 rounded-md px-3 py-2 border border-emerald-100">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide">Lote</p>
                  <p className="font-mono font-bold text-gray-700 text-sm">
                    {batchId.slice(0, 8)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Canhoto / QR Code */}
          <div className="flex flex-col items-center justify-center border-l-2 border-dashed border-emerald-400 pl-6 pr-2 relative">
            <div className="relative p-2 bg-white rounded-lg border-2 border-emerald-500 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR code para cadastro com cortesia"
                className="w-28 h-28 block"
              />
              <Sparkle className="absolute -top-2 -left-2 w-5 h-5 text-amber-400" />
              <Sparkle className="absolute -bottom-1 -right-2 w-4 h-4 text-amber-400" />
            </div>
            <p className="mt-2 text-[9px] uppercase tracking-widest text-emerald-700 font-bold text-center leading-tight">
              Escaneie para
              <br />
              cadastrar
            </p>
          </div>
        </div>

        {/* Instruções de resgate */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-emerald-200 relative">
          <div className="absolute -top-3 left-4 bg-white px-2">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
              ★ Como resgatar ★
            </p>
          </div>
          <p className="text-[10.5px] text-gray-700 leading-relaxed mt-1">
            <strong className="text-emerald-700">1. Pelo QR Code (mais rápido):</strong> escaneie
            com a câmera do celular. Você será levado direto à tela de cadastro — pode criar a conta
            com <strong>Google</strong> ou com <strong>email + senha</strong> (validação por código
            enviado ao email). Ao finalizar o onboarding, a cortesia é ativada automaticamente.
            <br />
            <strong className="text-emerald-700">2. Manualmente:</strong> acesse{" "}
            <span className="font-mono font-bold text-emerald-700">
              {BASE_URL}/dashboard/profile
            </span>{" "}
            após o cadastro, clique em{" "}
            <strong className="text-emerald-700">“Ganhei uma Cortesia”</strong> e, em{" "}
            <strong className="text-emerald-700">“Já tenho uma chave”</strong>, digite os números.
            Se não funcionar, solicite uma nova em{" "}
            <strong className="text-emerald-700">“Solicitar”</strong>.
          </p>
          <p className="text-[9px] text-gray-400 mt-2 italic">
            Chave anônima e intransferível. Uso único. Após resgatada, concede acesso ao plano
            Profissional até a data de validade.
          </p>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="h-2 rounded-b-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500" />
    </div>
  )
}
