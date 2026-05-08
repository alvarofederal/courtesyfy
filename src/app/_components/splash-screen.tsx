"use client"

import { useEffect, useState } from "react"
import { Key } from "lucide-react"

export function SplashScreen() {
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "done">("in")

  useEffect(() => {
    // Já mostrou nesta sessão? Pula.
    if (sessionStorage.getItem("splash_shown")) {
      setPhase("done")
      return
    }

    // Fase: in → hold → out → done
    const t1 = setTimeout(() => setPhase("hold"), 700)       // fade-in termina
    const t2 = setTimeout(() => setPhase("out"),  3200)      // começa fade-out
    const t3 = setTimeout(() => {
      setPhase("done")
      sessionStorage.setItem("splash_shown", "1")
    }, 4000)                                                  // remove do DOM

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (phase === "done") return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        transition: phase === "out"
          ? "opacity 0.8s ease, transform 0.8s ease"
          : "opacity 0.7s ease, transform 0.7s ease",
        opacity:   phase === "in" ? 0 : phase === "out" ? 0 : 1,
        transform: phase === "in" ? "scale(0.92)" : phase === "out" ? "scale(1.04)" : "scale(1)",
      }}
    >
      {/* Halo de luz atrás do logo */}
      <div style={{
        position: "absolute",
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
        filter: "blur(40px)",
        animation: "splash-breathe 2.5s ease-in-out infinite",
      }} />

      {/* Ícone */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 22,
        background: "linear-gradient(135deg, #10b981, #059669)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 1px rgba(16,185,129,0.3), 0 0 32px rgba(16,185,129,0.4), 0 0 64px rgba(16,185,129,0.15)",
        animation: "splash-breathe 2.5s ease-in-out infinite",
        position: "relative",
      }}>
        <Key style={{ width: 36, height: 36, color: "#fff", strokeWidth: 2 }} />
      </div>

      {/* Nome */}
      <div style={{
        fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
        fontSize: 36,
        fontWeight: 700,
        letterSpacing: "-0.5px",
        lineHeight: 1,
        userSelect: "none",
      }}>
        <span style={{ color: "#ffffff" }}>Courtesy</span>
        <span style={{
          color: "#10b981",
          textShadow: "0 0 20px rgba(16,185,129,0.6), 0 0 40px rgba(16,185,129,0.3)",
        }}>fy</span>
      </div>

      {/* Tagline sutil */}
      <p style={{
        fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
        fontSize: 13,
        fontWeight: 400,
        color: "rgba(255,255,255,0.25)",
        letterSpacing: "0.5px",
        marginTop: -12,
      }}>
        Campanhas que geram resultado
      </p>

      {/* Barra de progresso */}
      <div style={{
        position: "absolute",
        bottom: 56,
        left: "50%",
        transform: "translateX(-50%)",
        width: 48,
        height: 3,
        borderRadius: 99,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          borderRadius: 99,
          background: "linear-gradient(90deg, #10b981, #34d399)",
          animation: "splash-progress 3.2s linear forwards",
          boxShadow: "0 0 8px rgba(16,185,129,0.6)",
        }} />
      </div>

      <style>{`
        @keyframes splash-breathe {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }
        @keyframes splash-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
