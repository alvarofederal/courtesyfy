import Link from "next/link"
import {
  QrCode,
  Key,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Gift,
  Ticket,
  TrendingUp,
  ChevronRight,
  Star,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Courtesyfy</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-white/60 text-sm hover:text-white transition-colors">Como funciona</a>
            <a href="#recursos" className="text-white/60 text-sm hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="text-white/60 text-sm hover:text-white transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/70 text-sm hover:text-white transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-black pt-32 pb-24 px-6 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">MVP disponível — comece hoje mesmo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Cortesias que{" "}
              <span className="text-emerald-400">geram resultado</span>{" "}
              real para sua loja
            </h1>

            <p className="text-white/60 text-xl md:text-2xl leading-relaxed max-w-2xl mb-10">
              Crie campanhas com chaves únicas, distribua QR Codes e valide resgates com rastreamento completo. Tudo em uma plataforma simples.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors group"
              >
                Criar conta gratuita
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium text-lg px-8 py-4 rounded-xl transition-colors"
              >
                Ver como funciona
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {[
                { value: "100%", label: "Rastreável" },
                { value: "QR Code", label: "Incluso em todos os planos" },
                { value: "0 taxa", label: "Por resgate" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">{stat.value}</span>
                  <span className="text-white/40 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Como funciona</span>
            <h2 className="text-4xl font-bold text-black mt-2 mb-4">Três passos simples</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Do cadastro ao resgate validado, o processo é direto e sem complicação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Ticket,
                title: "Crie sua campanha",
                desc: "Defina o benefício, quantidade de chaves, validade e regras. Em minutos sua campanha está pronta.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                step: "02",
                icon: QrCode,
                title: "Gere e distribua",
                desc: "Gere um lote de chaves únicas com QR Code. Imprima, envie por WhatsApp ou publique nas redes sociais.",
                color: "bg-black text-white",
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "Valide o resgate",
                desc: "O operador escaneia a chave ou digita o código. O sistema valida em tempo real e registra o resgate.",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="border border-gray-100 rounded-2xl p-8 h-full hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-5xl font-bold text-gray-100">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-24 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Recursos</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">Tudo que você precisa</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Uma plataforma completa para gerenciar cortesias de forma profissional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Key,
                title: "Chaves únicas",
                desc: "Códigos no formato XXXX-XXXX-XXXX-XXXX com verificação de unicidade garantida.",
              },
              {
                icon: QrCode,
                title: "QR Code automático",
                desc: "Cada chave gera um QR Code pronto para impressão ou envio digital.",
              },
              {
                icon: Shield,
                title: "Anti-fraude",
                desc: "Chave resgatada é imutável. Nenhum resgate duplicado, sem brechas.",
              },
              {
                icon: BarChart3,
                title: "Métricas em tempo real",
                desc: "Acompanhe resgates, taxa de conversão e desempenho de cada campanha.",
              },
              {
                icon: Users,
                title: "Múltiplos operadores",
                desc: "Cadastre sua equipe com diferentes níveis de acesso: admin e operador.",
              },
              {
                icon: Gift,
                title: "Tipos de benefício",
                desc: "Desconto, brinde, sorteio, frete grátis, cashback — você escolhe.",
              },
              {
                icon: TrendingUp,
                title: "Exportação de dados",
                desc: "Exporte lotes de chaves em PDF, CSV ou PNG para campanha física.",
              },
              {
                icon: Zap,
                title: "Validação instantânea",
                desc: "Resgate validado em menos de 1 segundo. Zero espera no balcão.",
              },
              {
                icon: Star,
                title: "Landing page da chave",
                desc: "Página pública personalizada com os detalhes do benefício e ativação.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="border border-white/8 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-white/3 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <feat.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE CAMPANHA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Para todo tipo de promoção</span>
              <h2 className="text-4xl font-bold text-black mt-2 mb-6 leading-tight">
                Funciona para qualquer campanha do seu negócio
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Seja uma promoção de aniversário, ação sazonal ou programa de fidelidade — o Courtesyfy adapta ao seu modelo.
              </p>
              <div className="space-y-4">
                {[
                  "Cupons de desconto com QR Code impresso",
                  "Brindes para primeiros clientes do mês",
                  "Sorteios rastreáveis sem planilha",
                  "Frete grátis controlado por código único",
                  "Cashback com validade e limite de uso",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">Campanha Aniversário</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">ATIVA</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Geradas", value: "500" },
                      { label: "Resgatadas", value: "312" },
                      { label: "Conversão", value: "62%" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-white font-bold text-xl">{m.value}</p>
                        <p className="text-white/40 text-xs mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/50 text-xs mb-3">Últimos resgates</p>
                  {[
                    { code: "ANIV-3K2F-7X9P", time: "há 2 min", status: "Resgatado" },
                    { code: "ANIV-8M1Q-5T4R", time: "há 5 min", status: "Resgatado" },
                    { code: "ANIV-2W6L-9H3N", time: "há 9 min", status: "Resgatado" },
                  ].map((r) => (
                    <div key={r.code} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white text-xs font-mono">{r.code}</p>
                        <p className="text-white/30 text-xs">{r.time}</p>
                      </div>
                      <span className="text-emerald-400 text-xs font-medium">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Planos</span>
            <h2 className="text-4xl font-bold text-black mt-2 mb-4">Simples e sem surpresas</h2>
            <p className="text-gray-500 text-lg">Comece grátis. Escale conforme seu negócio crescer.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Essencial",
                price: "Grátis",
                period: "",
                desc: "Para quem está começando",
                highlight: false,
                features: [
                  "Até 3 campanhas ativas",
                  "100 chaves por mês",
                  "QR Code incluso",
                  "Painel básico de métricas",
                  "Suporte por email",
                ],
                cta: "Começar grátis",
                href: "/register",
              },
              {
                name: "Profissional",
                price: "R$ 97",
                period: "/mês",
                desc: "Para lojas em crescimento",
                highlight: true,
                features: [
                  "Campanhas ilimitadas",
                  "5.000 chaves por mês",
                  "Landing page personalizada",
                  "Exportação PDF e CSV",
                  "Múltiplos operadores",
                  "Métricas avançadas",
                  "Suporte prioritário",
                ],
                cta: "Assinar agora",
                href: "/register",
              },
              {
                name: "Empresarial",
                price: "Sob consulta",
                period: "",
                desc: "Para redes e franquias",
                highlight: false,
                features: [
                  "Multi-unidades",
                  "Chaves ilimitadas",
                  "White-label",
                  "API de integração",
                  "Relatórios consolidados",
                  "SLA dedicado",
                  "Onboarding assistido",
                ],
                cta: "Falar com vendas",
                href: "/register",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 relative ${
                  plan.highlight
                    ? "bg-black text-white border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-black"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? "text-white/50" : "text-gray-500"}`}>{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-black"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm mb-1 ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`}
                      />
                      <span className={`text-sm ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-black"
                  }`}
                >
                  {plan.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-black py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Pronto para transformar suas promoções?
          </h2>
          <p className="text-white/50 text-xl mb-10">
            Crie sua conta grátis e comece a gerar cortesias rastreáveis hoje mesmo. Sem cartão de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-colors group"
          >
            Criar conta gratuita
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-white/30 text-sm mt-5">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 border-t border-white/8 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Key className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold">Courtesyfy</span>
            </div>

            <div className="flex items-center gap-8">
              <Link href="/login" className="text-white/40 hover:text-white/70 text-sm transition-colors">Entrar</Link>
              <Link href="/register" className="text-white/40 hover:text-white/70 text-sm transition-colors">Cadastrar</Link>
              <a href="#planos" className="text-white/40 hover:text-white/70 text-sm transition-colors">Planos</a>
            </div>

            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} Courtesyfy. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
