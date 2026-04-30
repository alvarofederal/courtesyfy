import Link from "next/link"
import { Header } from "../../_components/header"
import { Footer } from "../../_components/footer"
import { TrackedCTA } from "./_components/tracked-cta"
import { LandingPageview } from "./_components/landing-pageview"
import {
  Stethoscope,
  CalendarCheck,
  AlertCircle,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  Gift,
  ShieldCheck,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react"

export const metadata = {
  title: "Basemedical para Médicos — Reduza faltas e organize sua agenda",
  description:
    "Plataforma de agendamento pensada para médicos. Cadastre 1 paciente em 48h e ganhe 3 meses grátis.",
}

const METAL = "#009b87"
const METAL_DARK = "#006b5e"
const METAL_LIGHT = "#00c4a8"

export default function MedicosLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <LandingPageview landing="medicos" />
      <Header />

      {/* HERO */}
      <section
        className="relative overflow-hidden pt-32 pb-24 px-6"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(0,155,135,0.25), transparent 60%), radial-gradient(900px 500px at 90% 30%, rgba(0,196,168,0.15), transparent 60%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,155,135,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,155,135,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container mx-auto max-w-6xl relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{
                background: `linear-gradient(135deg, ${METAL_DARK}33, ${METAL}33)`,
                borderColor: `${METAL}66`,
                color: METAL_LIGHT,
              }}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              EXCLUSIVO PARA MÉDICOS
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Pare de perder receita com{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL}, ${METAL_DARK})`,
                }}
              >
                faltas e desorganização
              </span>{" "}
              da agenda.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed">
              Médicos perdem em média <strong className="text-white">15% da receita mensal</strong> com no-shows e
              janelas vazias. A Basemedical organiza sua agenda, lembra o paciente e mostra exatamente onde está
              vazando dinheiro.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <TrackedCTA
                cta="hero"
                landing="medicos"
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md font-semibold text-base shadow-lg transition-all hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${METAL_LIGHT} 0%, ${METAL} 50%, ${METAL_DARK} 100%)`,
                  boxShadow: `0 10px 40px -10px ${METAL}aa`,
                }}
              >
                Quero meus 3 meses grátis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </TrackedCTA>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md font-medium text-base border border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors"
              >
                Ver como funciona
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: METAL_LIGHT }} />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: METAL_LIGHT }} />
                Configura em 5 min
              </div>
            </div>
          </div>

          {/* Mockup do produto */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-2xl blur-2xl opacity-50"
              style={{ background: `linear-gradient(135deg, ${METAL}, ${METAL_DARK})` }}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900 border border-white/10">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-500 ml-2">basemedical.online/dashboard</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5" style={{ color: METAL }} />
                    Abril 2026
                  </h3>
                  <span className="text-xs text-gray-500">Sua agenda em tempo real</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center font-semibold text-gray-400 py-1">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1
                    const status =
                      [3, 7, 14, 21, 28].includes(day)
                        ? "full"
                        : [2, 5, 8, 12, 15, 19, 22, 26, 29].includes(day)
                        ? "partial"
                        : [1, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27, 30].includes(day)
                        ? "empty"
                        : null
                    const cls =
                      status === "full"
                        ? "bg-red-100 border-red-400 text-red-800"
                        : status === "partial"
                        ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                        : status === "empty"
                        ? "bg-green-100 border-green-400 text-green-800"
                        : "border-gray-200 text-gray-400"
                    return (
                      <div
                        key={day}
                        className={`h-8 rounded border flex items-center justify-center text-xs font-semibold ${cls}`}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded border border-green-400 bg-green-100" /> Aberta
                    <div className="w-3 h-3 rounded border border-yellow-400 bg-yellow-100 ml-3" /> Parcial
                    <div className="w-3 h-3 rounded border border-red-400 bg-red-100 ml-3" /> Cheia
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Reconhece alguma dessas?
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Conversamos com dezenas de médicos. Estas são as três dores que mais aparecem.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertCircle,
                title: "Pacientes que somem",
                text: "Marcam, não confirmam, não vêm. Você bloqueia o horário, perde a receita e ainda atrasa quem está esperando.",
              },
              {
                icon: TrendingDown,
                title: "Receita invisível",
                text: "Você sente que perdeu dinheiro no mês, mas não sabe quanto, nem por que. Sem dado, sem decisão.",
              },
              {
                icon: Clock,
                title: "Agenda no WhatsApp",
                text: "Confirmar paciente por mensagem consome horas. Esquecimento, conflito de horário, retrabalho.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${METAL}22`, border: `1px solid ${METAL}44` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: METAL_LIGHT }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 bg-zinc-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${METAL}22`, color: METAL_LIGHT, border: `1px solid ${METAL}44` }}
            >
              COMO FUNCIONA
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Em 5 minutos sua agenda{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL_DARK})`,
                }}
              >
                deixa de ser problema.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Você abre sua agenda",
                text: "Define os horários disponíveis por local de atendimento. Calendário visual mostra cada dia em verde, amarelo ou vermelho.",
              },
              {
                n: "02",
                title: "O paciente agenda sozinho",
                text: "Link público ou QR Code. Ele vê só os horários disponíveis. Sem WhatsApp, sem confusão.",
              },
              {
                n: "03",
                title: "Você acompanha tudo num só lugar",
                text: "Lembretes vinculados ao agendamento, histórico, status, chamados de suporte. Receita visível.",
              },
            ].map((step) => (
              <div key={step.n} className="relative">
                <div
                  className="text-7xl font-black mb-4 opacity-30"
                  style={{ color: METAL_LIGHT }}
                >
                  {step.n}
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTA — destaque metálico */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${METAL_DARK} 0%, #000 50%, ${METAL_DARK} 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, ${METAL_LIGHT}44, transparent 50%), radial-gradient(circle at 70% 50%, ${METAL}44, transparent 50%)`,
          }}
        />

        <div className="container mx-auto max-w-4xl relative">
          <div
            className="rounded-3xl p-1"
            style={{
              background: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL}, ${METAL_DARK}, #000)`,
            }}
          >
            <div className="bg-black rounded-3xl p-10 md:p-14">
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL})`,
                    color: "#000",
                  }}
                >
                  <Gift className="w-4 h-4" />
                  OFERTA DE LANÇAMENTO
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Use 1 vez. Receba{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL})`,
                    }}
                  >
                    3 meses grátis.
                  </span>
                </h2>

                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                  Acreditamos que você só vai ver o valor da Basemedical usando de verdade. Por isso,{" "}
                  <strong className="text-white">cadastre 1 paciente nas primeiras 48 horas</strong> e libera
                  automaticamente <strong className="text-white">3 meses do plano completo</strong>.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-10 text-left">
                  {[
                    { n: "1", t: "Crie sua conta", s: "Em 2 minutos." },
                    { n: "2", t: "Cadastre 1 paciente", s: "Em até 48h após o cadastro." },
                    { n: "3", t: "3 meses liberados", s: "Crédito automático na conta." },
                  ].map((item) => (
                    <div
                      key={item.n}
                      className="p-5 rounded-xl border border-white/10 bg-white/[0.03]"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-3"
                        style={{
                          background: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL_DARK})`,
                          color: "#000",
                        }}
                      >
                        {item.n}
                      </div>
                      <div className="font-bold mb-1">{item.t}</div>
                      <div className="text-sm text-gray-400">{item.s}</div>
                    </div>
                  ))}
                </div>

                <TrackedCTA
                  cta="offer"
                  landing="medicos"
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-md font-bold text-lg shadow-2xl transition-all hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${METAL_LIGHT} 0%, ${METAL} 50%, ${METAL_DARK} 100%)`,
                    color: "#000",
                    boxShadow: `0 20px 60px -15px ${METAL}`,
                  }}
                >
                  Garantir meus 3 meses agora
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </TrackedCTA>

                <p className="mt-6 text-xs text-gray-500">
                  Oferta válida para os primeiros médicos cadastrados. Sem fidelidade. Cancele quando quiser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES + MOCKUP DA AGENDA */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Tudo que um médico precisa{" "}
                <span style={{ color: METAL_LIGHT }}>e nada do que não precisa.</span>
              </h2>
              <ul className="space-y-4">
                {[
                  "Calendário visual com status do dia (verde / amarelo / vermelho)",
                  "Página pública de agendamento com seu link e QR Code",
                  "Lembretes vinculados a cada agendamento, com upload de imagem",
                  "Bloqueio automático de horários conflitantes",
                  "Suporte direto via chamados — sem ficar caçando WhatsApp",
                  "Multi-endereço para quem atende em mais de um consultório",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-6 h-6 flex-shrink-0 mt-0.5"
                      style={{ color: METAL_LIGHT }}
                    />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-4 rounded-2xl blur-2xl opacity-40"
                style={{ background: `linear-gradient(135deg, ${METAL_LIGHT}, ${METAL})` }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl text-gray-900 overflow-hidden border border-white/10">
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                  <h3 className="font-bold flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5" style={{ color: METAL }} />
                    Agenda do Dia
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    sexta-feira, 24 de abril de 2026
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { t: "08:00", n: "Maria Silva", s: "Consulta de rotina", c: "confirmed" },
                    { t: "09:00", n: "João Pereira", s: "Retorno", c: "confirmed" },
                    { t: "10:00", n: "—", s: "Disponível", c: "free" },
                    { t: "11:00", n: "Ana Costa", s: "Primeira consulta", c: "pending" },
                    { t: "14:00", n: "Carlos Souza", s: "Resultado de exames", c: "confirmed" },
                  ].map((apt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        apt.c === "free"
                          ? "border-dashed border-gray-200 bg-gray-50"
                          : apt.c === "pending"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-emerald-100 bg-emerald-50/50"
                      }`}
                    >
                      <div
                        className="font-bold text-sm w-12 text-center"
                        style={{ color: apt.c === "free" ? "#9ca3af" : METAL_DARK }}
                      >
                        {apt.t}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{apt.n}</div>
                        <div className="text-xs text-gray-500 truncate">{apt.s}</div>
                      </div>
                      {apt.c !== "free" && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUEM ESTÁ POR TRÁS */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-3xl text-center">
          <Users className="w-12 h-12 mx-auto mb-6" style={{ color: METAL_LIGHT }} />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Construído com médicos. Para médicos.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            A Basemedical nasceu de uma observação clínica real: nossa Product Owner é médica e via
            colegas perdendo receita, tempo e paciência com agendas mal gerenciadas. Cada
            funcionalidade aqui foi validada com profissionais de verdade.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(800px 400px at 50% 50%, ${METAL_DARK}, #000)`,
          }}
        />
        <div className="container mx-auto max-w-3xl relative text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-6" style={{ color: METAL_LIGHT }} />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto pra parar de perder paciente?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Crie sua conta grátis. Cadastre 1 paciente. Receba 3 meses do plano completo.
          </p>
          <TrackedCTA
            cta="final"
            landing="medicos"
            href="/register"
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-md font-bold text-lg shadow-2xl transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${METAL_LIGHT} 0%, ${METAL} 50%, ${METAL_DARK} 100%)`,
              color: "#000",
              boxShadow: `0 20px 60px -15px ${METAL}`,
            }}
          >
            Começar agora — é grátis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </TrackedCTA>
        </div>
      </section>

      <Footer />
    </div>
  )
}
