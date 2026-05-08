"use client"

import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  QrCode, Key, BarChart3, CheckCircle2, ArrowRight,
  Zap, Shield, Users, Gift, Sparkles, ChevronRight,
} from "lucide-react"
import { SplashScreen } from "./_components/splash-screen"

/* ─── helpers ─────────────────────────────────────────────────── */
function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

/* ─── Animated background grid ───────────────────────────────── */
function GridBg({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(16,185,129,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,${opacity}) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }}
    />
  )
}

/* ─── Glowing orb ─────────────────────────────────────────────── */
function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("absolute rounded-full blur-[120px] pointer-events-none", className)}
      style={style}
    />
  )
}

/* ─── Lightning bolt ──────────────────────────────────────────── */
function LightningBolt() {
  return (
    <>
      {/* Flash breve que ilumina toda a seção */}
      <div
        className="sky-flash-layer absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* O raio em si */}
      <div className="lightning-wrap" aria-hidden="true">
        <svg
          className="bolt-svg"
          viewBox="0 0 800 650"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin meet"
        >
          <defs>
            {/* Bloom em 3 camadas: glow exterior suave → mid → core nítido */}
            <filter id="bolt-bloom" x="-90%" y="-5%" width="280%" height="115%">
              <feGaussianBlur stdDeviation="28" result="b3" in="SourceGraphic"/>
              <feGaussianBlur stdDeviation="10" result="b2" in="SourceGraphic"/>
              <feGaussianBlur stdDeviation="3"  result="b1" in="SourceGraphic"/>
              <feMerge>
                <feMergeNode in="b3"/>
                <feMergeNode in="b2"/>
                <feMergeNode in="b1"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* ── Grupo principal com bloom ── */}
          <g filter="url(#bolt-bloom)" className="bolt-group">
            {/* Halo externo no tronco — linha grossa e translúcida */}
            <path
              d="M400,0 L383,66 L417,66 L391,162 L427,162 L400,278 L438,278 L403,396 L434,468 L406,568"
              stroke="rgba(180,255,215,0.32)" strokeWidth="10"
              strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Core branco do tronco — linha fina e brilhante */}
            <path
              d="M400,0 L383,66 L417,66 L391,162 L427,162 L400,278 L438,278 L403,396 L434,468 L406,568"
              stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Galho direito superior — nasce em 427,162 */}
            <path
              d="M427,162 L471,244 L507,362 L526,455"
              stroke="rgba(180,255,215,0.28)" strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M427,162 L471,244 L507,362 L526,455"
              stroke="white" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.8"
            />
            {/* Galho esquerdo médio — nasce em 438,278 */}
            <path
              d="M438,278 L380,355 L342,452 L314,545"
              stroke="rgba(180,255,215,0.22)" strokeWidth="6"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M438,278 L380,355 L342,452 L314,545"
              stroke="white" strokeWidth="1"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.72"
            />
            {/* Espalhamento esquerdo — nasce em 403,396 */}
            <path
              d="M403,396 L357,458 L320,538 L290,615"
              stroke="white" strokeWidth="0.9"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
            />
            {/* Espalhamento direito — nasce em 434,468 */}
            <path
              d="M434,468 L476,528 L502,598"
              stroke="white" strokeWidth="0.9"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.45"
            />
            {/* Sub-galho direito — nasce em 507,362 */}
            <path d="M507,362 L538,422" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.5"/>
            {/* Sub-galho esquerdo — nasce em 380,355 */}
            <path d="M380,355 L340,412" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.45"/>
            {/* Mini galho — nasce em 471,244 */}
            <path d="M471,244 L508,298 L524,368" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.38"/>
            {/* Mini galho — nasce em 342,452 */}
            <path d="M342,452 L308,508" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.35"/>
          </g>

          {/* Brilho de impacto — halo oval na base do raio */}
          <ellipse
            cx="418" cy="568" rx="130" ry="22"
            fill="rgba(255,255,255,0.14)"
            className="bolt-impact"
            style={{ filter: "blur(14px)" }}
          />
        </svg>
      </div>
    </>
  )
}

/* ─── Hero card mockup ────────────────────────────────────────── */
function HeroCard() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2400)
    return () => clearInterval(id)
  }, [])

  const codes = ["1A2B-3C4D-5EFF-7GH", "9XKP-2MQR-8VNZ-4JT", "3FYB-7LWD-1CPX-6HA"]
  const code = codes[tick % codes.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.6, duration: 1, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full max-w-[440px] mx-auto"
      style={{ perspective: 1000 }}
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-3xl blur-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.25) 0%, transparent 70%)" }} />

      {/* Card body */}
      <div className="glow-card glass-card-dark relative rounded-3xl overflow-hidden">
        {/* Top accent line */}
        <div className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), rgba(110,231,183,0.8), rgba(16,185,129,0.6), transparent)" }} />

        <div className="p-8">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400/80 uppercase">
              Cortesia Ativa
            </span>
          </div>

          {/* Code + QR row */}
          <div className="flex items-center gap-6">
            {/* Code */}
            <div className="flex-1">
              <p className="text-xs text-white/30 mb-2 uppercase tracking-widest">Código</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="font-mono text-lg font-bold tracking-wider"
                  style={{
                    color: "#e0f7ff",
                    textShadow: "0 0 20px rgba(16,185,129,0.7), 0 0 40px rgba(16,185,129,0.3)",
                  }}
                >
                  {code}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            {/* QR placeholder */}
            <div
              className="relative w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.25)",
                boxShadow: "0 0 20px rgba(16,185,129,0.15), inset 0 0 20px rgba(16,185,129,0.05)",
              }}
            >
              <QrCode className="w-8 h-8" style={{ color: "rgba(16,185,129,0.9)" }} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-white/25 font-mono">courtesyfy.com</span>
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.08)", color: "rgba(16,185,129,0.7)", border: "1px solid rgba(16,185,129,0.15)" }}>
              Válido • 30 dias
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px w-full opacity-30"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)" }} />
      </div>

      {/* Floating stats */}
      {/* Stats abaixo do card — nunca se sobrepõem */}
      <div className="flex gap-3 mt-4 px-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="glass-card flex-1 rounded-2xl px-4 py-3 text-xs"
        >
          <p className="text-white/40 mb-0.5">Resgatadas hoje</p>
          <p className="text-white font-bold text-base">
            <span className="text-emerald-400">↑</span> 1.247
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="glass-card flex-1 rounded-2xl px-4 py-3 text-xs"
        >
          <p className="text-white/40 mb-0.5">Taxa de conversão</p>
          <p className="text-white font-bold text-base">
            <span className="text-emerald-400">94.2%</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─── Navbar ──────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(5,5,5,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span
          className="logo-shine font-bold tracking-tight select-none"
          style={{
            fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
            fontSize: "clamp(20px, 2.5vw, 26px)",
          }}
        >
          <span style={{ color: "#ffffff" }}>Courtesy</span>
          <span style={{ color: "#10b981", textShadow: "0 0 16px rgba(16,185,129,0.55)" }}>fy</span>
        </span>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {[["#como-funciona", "Como funciona"], ["#recursos", "Recursos"], ["#planos", "Planos"]].map(([href, label]) => (
            <a key={href} href={href} className="text-white/50 hover:text-white transition-colors duration-200">
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors px-3 py-1.5">
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 24px rgba(16,185,129,0.3)" }}
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

/* ─── Section header ──────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[3px]"
      style={{ color: "#10b981" }}>
      <span className="w-6 h-px" style={{ background: "#10b981" }} />
      {children}
      <span className="w-6 h-px" style={{ background: "#10b981" }} />
    </span>
  )
}

/* ─── Glass card ──────────────────────────────────────────────── */
function GlassCard({
  children, className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("glow-card glass-card rounded-2xl transition-all duration-500 hover:-translate-y-1", className)}>
      {children}
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.4], ["0%", "20%"])

  const features = [
    { icon: Key,      title: "Chaves Únicas",         desc: "Cada chave é única, verificada criptograficamente. Zero duplicatas, zero fraudes." },
    { icon: QrCode,   title: "QR Code Inteligente",   desc: "Geração automática de QR codes com página de resgate personalizada para cada loja." },
    { icon: Shield,   title: "Anti-fraude em Tempo Real", desc: "Validação instantânea via scan ou digitação. Sistema bloqueia tentativas de reuso." },
    { icon: BarChart3,title: "Analytics Detalhado",   desc: "Taxa de ativação, conversão e ROI por campanha. Dados em tempo real." },
    { icon: Users,    title: "Múltiplos Operadores",  desc: "Adicione sua equipe com permissões granulares. Cada um acessa só o que precisa." },
    { icon: Gift,     title: "Tipos de Benefício",    desc: "Desconto %, fixo, brinde, sorteio, frete grátis ou cashback. Total flexibilidade." },
  ]

  const plans = [
    {
      name: "Essencial",
      price: "Grátis",
      desc: "Para começar",
      highlight: false,
      features: ["3 campanhas ativas", "100 chaves/mês", "QR Code básico", "Página de resgate"],
    },
    {
      name: "Profissional",
      price: "R$ 97",
      period: "/mês",
      desc: "Mais popular",
      highlight: true,
      features: ["Campanhas ilimitadas", "5.000 chaves/mês", "Layout personalizado", "Analytics avançado", "Múltiplos operadores", "Exportação CSV"],
    },
    {
      name: "Empresarial",
      price: "Consulta",
      desc: "Para grandes redes",
      highlight: false,
      features: ["White label", "API completa", "Multi-unidades", "SLA dedicado", "Onboarding dedicado"],
    },
  ]

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: "#050505", color: "#fff" }}>

      <SplashScreen />

      {/* ── Fundo luminoso global ── */}
      <div className="luminous-bg" aria-hidden="true">
        <div className="luminous-rays" />
        <div className="luminous-star" />
        <div className="luminous-orb3" />
        <div className="luminous-scanline" />
      </div>

      <Navbar />

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Background layers */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <GridBg opacity={0.035} />
        </motion.div>

        {/* Glowing orbs */}
        <Orb className="w-[700px] h-[700px] -top-40 -left-40 opacity-20"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)" }} />
        <Orb className="w-[500px] h-[500px] top-1/3 right-0 opacity-15"
          style={{ background: "radial-gradient(circle, rgba(110,231,183,0.25), transparent 70%)" }} />
        <Orb className="w-[400px] h-[400px] bottom-0 left-1/3 opacity-10"
          style={{ background: "radial-gradient(circle, rgba(5,150,105,0.3), transparent 70%)" }} />

        {/* Raio de tempestade — desce do topo central */}
        <LightningBolt />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 w-full relative" style={{ zIndex: 2 }}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 mb-8 text-sm font-medium"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#10b981",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Plataforma de Cortesias para Lojistas
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="text-5xl md:text-6xl lg:text-[4.2rem] font-semibold leading-[1.08] tracking-tight mb-6"
              >
                Campanhas que<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #10b981 0%, #6ee7b7 45%, #34d399 100%)" }}
                >
                  geram resultado
                </span>
                <br />
                de verdade.
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Crie campanhas com chaves únicas e QR Codes inteligentes.
                Distribua, valide e acompanhe em tempo real — tudo em um só lugar.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 mb-14"
              >
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2.5 text-base font-semibold px-8 py-4 rounded-2xl text-black transition-all hover:scale-[1.03] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 0 32px rgba(16,185,129,0.35), 0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  Criar conta gratuita
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 text-base font-medium px-8 py-4 rounded-2xl transition-all hover:border-white/30"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                >
                  Ver como funciona
                </a>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-8 pt-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {[
                  { value: "50K+", label: "Chaves geradas" },
                  { value: "94%", label: "Taxa de resgate" },
                  { value: "< 1s", label: "Validação" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold" style={{ color: "#10b981" }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — card mockup */}
            <div className="flex justify-center lg:justify-end">
              <HeroCard />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #050505)" }} />
      </section>

      {/* ═══ COMO FUNCIONA ══════════════════════════════════════ */}
      <section id="como-funciona" className="py-32 px-6 relative">
        <GridBg opacity={0.025} />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <SectionLabel>Como funciona</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5 mb-4">
              Do zero ao resgate em{" "}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #10b981, #6ee7b7)" }}>
                3 passos
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Simples para o lojista, premium para o cliente.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Key,          title: "Crie a campanha",      desc: "Configure benefícios, quantidade de chaves, validade e layout de impressão personalizado." },
              { step: "02", icon: QrCode,       title: "Distribua os cards",   desc: "Imprima os cards com QR Code único. O cliente escaneia e ativa no próprio celular." },
              { step: "03", icon: CheckCircle2, title: "Valide em tempo real", desc: "O operador escaneia ou digita o código. Resgate registrado instantaneamente." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <GlassCard className="p-8 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <span
                      className="text-[5rem] font-black leading-none select-none"
                      style={{ color: "rgba(16,185,129,0.08)", fontVariantNumeric: "tabular-nums" }}
                    >
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-2"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <item.icon className="w-5 h-5" style={{ color: "#10b981" }} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {item.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CARD SHOWCASE ══════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <Orb className="w-[800px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,1), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionLabel>Design Premium</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5 mb-4">
              Cards que impressionam
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Personalize cores, imagens e layout. Imprima em cartão ou MDF sublimação.
            </p>
          </motion.div>

          {/* Cards grid demo */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { bg: "#1a1a2e", accent: "#10b981",  label: "Tech / Digital" },
              { bg: "#1a0a0a", accent: "#f87171",  label: "Gastronomia" },
              { bg: "#0a1a0a", accent: "#4ade80",  label: "Mercado / Varejo" },
              { bg: "#1a1508", accent: "#fbbf24",  label: "Moda / Boutique" },
              { bg: "#0f0f1a", accent: "#a78bfa",  label: "Beleza / Estética" },
              { bg: "#0a1520", accent: "#34d399",  label: "Fitness / Academia" },
            ].map((theme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-4 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.accent}30`,
                  boxShadow: `0 0 24px ${theme.accent}10`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: `${theme.accent}80` }}>
                    {theme.label}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.accent }} />
                </div>
                <p className="font-mono text-sm font-bold mb-2"
                  style={{ color: theme.accent, textShadow: `0 0 12px ${theme.accent}60` }}>
                  XXXX-XXXX-XXXX
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>QR • Personalizado</span>
                  <div className="w-6 h-6 rounded" style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}30` }}>
                    <QrCode className="w-full h-full p-0.5" style={{ color: theme.accent }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RECURSOS ════════════════════════════════════════════ */}
      <section id="recursos" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <SectionLabel>Recursos</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5 mb-4">
              Tudo que sua operação precisa
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Uma plataforma completa. Do lojista pequeno à grande rede.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className="p-7 h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <feat.icon className="w-5 h-5" style={{ color: "#10b981" }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {feat.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLANOS ══════════════════════════════════════════════ */}
      <section id="planos" className="py-32 px-6 relative">
        <Orb className="w-[600px] h-[300px] top-1/2 right-0 -translate-y-1/2 opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,1), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <SectionLabel>Planos</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5 mb-4">
              Simples. Transparente.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Comece grátis. Escale quando precisar.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn("relative rounded-2xl p-8 transition-all duration-300", plan.highlight && "md:-translate-y-4")}
                style={{
                  background: plan.highlight
                    ? "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)"
                    : "rgba(255,255,255,0.03)",
                  border: plan.highlight
                    ? "1px solid rgba(16,185,129,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: plan.highlight
                    ? "0 0 40px rgba(16,185,129,0.12), 0 24px 48px -12px rgba(0,0,0,0.5)"
                    : "none",
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full text-black"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    Mais popular
                  </div>
                )}

                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{plan.desc}</p>
                <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>

                <div className="mb-6 flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#10b981" }} />
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="block text-center text-sm font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                  style={plan.highlight
                    ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "#000", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {plan.highlight ? "Assinar agora" : "Começar"}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══════════════════════════════════════════ */}
      <section className="py-40 px-6 relative overflow-hidden">
        <GridBg opacity={0.05} />

        {/* Raios de luz */}
        <div className="cta-rays" aria-hidden="true">
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray" />
          <div className="cta-ray-origin" />
        </div>

        {/* Halo difuso de fundo */}
        <Orb className="w-[700px] h-[350px] top-0 left-1/2 -translate-x-1/2 opacity-[0.18]"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,1), transparent 65%)" }} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>Pronto para começar?</SectionLabel>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mt-6 mb-6">
              Transforme suas promoções<br />em{" "}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #10b981, #6ee7b7, #34d399)" }}>
                resultados reais
              </span>
            </h2>
            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
              Crie sua conta gratuitamente. Nenhum cartão necessário.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 text-base font-semibold px-10 py-5 rounded-2xl text-black transition-all hover:scale-[1.04] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 0 48px rgba(16,185,129,0.4), 0 16px 32px rgba(0,0,0,0.4)",
              }}
            >
              Criar minha primeira campanha
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════ */}
      <footer className="py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <Key className="w-3 h-3 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white/80">
              Courtesy<span style={{ color: "#10b981" }}>fy</span>
            </span>
          </div>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2026 Courtesyfy. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="hover:text-white transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
