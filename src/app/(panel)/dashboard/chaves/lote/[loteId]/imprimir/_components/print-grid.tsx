"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type PosicaoChave = "TL" | "TR" | "BL" | "BR"

type Chave = {
  codigo: string
  landingUrl: string | null
}

interface Campanha {
  nome: string
  tipoBeneficio: string
  valorBeneficio: string | null
  descricaoPremio: string | null
  descricao: string | null
  expiraEm: string
}

interface Loja {
  nome: string
  logoUrl: string | null
  corPrimaria: string
  imagemFundoUrl?: string | null
  opacidadeFundo?: number
}

interface Props {
  chaves: Chave[]
  campanha: Campanha
  loja: Loja
  nomeLote: string
  totalChaves: number
  geradoEm: string
  formato: "cartao" | "mdf"
  autoPrint?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildBenefitLabel(campanha: Campanha): { main: string; sub: string } {
  const val = campanha.valorBeneficio ? parseFloat(campanha.valorBeneficio) : null
  switch (campanha.tipoBeneficio) {
    case "DESCONTO_PERCENTUAL":
      return { main: val ? `${val}% OFF` : "Desconto", sub: campanha.descricao ?? "" }
    case "DESCONTO_FIXO":
      return {
        main: val
          ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} OFF`
          : "Desconto",
        sub: campanha.descricao ?? "",
      }
    case "BRINDE":
      return { main: campanha.descricaoPremio ?? "Brinde", sub: campanha.descricao ?? "" }
    case "SORTEIO":
      return { main: campanha.descricaoPremio ?? "Sorteio", sub: campanha.descricao ?? "" }
    case "FRETE_GRATIS":
      return { main: "Frete Grátis", sub: campanha.descricao ?? "" }
    default:
      return { main: campanha.nome, sub: campanha.descricao ?? "" }
  }
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

// ─── Key Overlay ──────────────────────────────────────────────────────────────
// Renderiza a chave como overlay absoluto no canto escolhido.
// Usa fundo semitransparente escuro + texto branco para funcionar
// sobre qualquer imagem de fundo.

function KeyOverlay({
  codigo,
  posicao,
  brand,
  fontSize = 9,
}: {
  codigo: string
  posicao: PosicaoChave
  brand: string
  fontSize?: number
}) {
  const corner: React.CSSProperties = {
    TL: { top: 6, left: 6 },
    TR: { top: 6, right: 6 },
    BL: { bottom: 6, left: 6 },
    BR: { bottom: 6, right: 6 },
  }[posicao]

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        ...corner,
        background: "rgba(0,0,0,0.72)",
        borderRadius: 4,
        padding: "3px 7px",
        border: `1px solid ${brand}88`,
      }}
    >
      <code
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize,
          fontWeight: "bold",
          color: "#ffffff",
          whiteSpace: "nowrap",
          letterSpacing: 1.2,
          display: "block",
        }}
      >
        {codigo}
      </code>
    </div>
  )
}

// ─── Cartão 7 × 3,5 cm ───────────────────────────────────────────────────────
// RENDER: 4× o tamanho físico → scale(0.25) → qualidade de impressão 4×

const CARTAO_SCALE = 4          // renderiza 4× maior, scale() traz de volta
const CARTAO_W_MM  = 70         // largura física mm
const CARTAO_H_MM  = 35         // altura física mm
const MM_TO_PX     = 3.78       // 1mm ≈ 3.78px @ 96dpi
const CARTAO_W_PX  = Math.round(CARTAO_W_MM * MM_TO_PX * CARTAO_SCALE)  // ~1058px render
const CARTAO_H_PX  = Math.round(CARTAO_H_MM * MM_TO_PX * CARTAO_SCALE)  // ~529px render
const CARTAO_W_CSS = Math.round(CARTAO_W_MM * MM_TO_PX)                  // ~265px cell
const CARTAO_H_CSS = Math.round(CARTAO_H_MM * MM_TO_PX)                  // ~132px cell

function CartaoCard({
  chave,
  campanha,
  loja,
  posicao,
  modoLimpo,
}: {
  chave: Chave
  campanha: Campanha
  loja: Loja
  posicao: PosicaoChave | null
  modoLimpo: boolean
}) {
  const { main, sub } = buildBenefitLabel(campanha)
  const brand     = loja.corPrimaria
  const S         = CARTAO_SCALE           // font/size multiplier

  // ── Modo Limpo: só imagem de fundo + chave overlay ────────────────────────
  if (modoLimpo) {
    return (
      <div style={{ width: CARTAO_W_CSS, height: CARTAO_H_CSS, flexShrink: 0,
        overflow: "hidden", position: "relative" }}>
        <div style={{
          width: CARTAO_W_PX,
          height: CARTAO_H_PX,
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${1 / CARTAO_SCALE})`,
          transformOrigin: "top left",
          borderRadius: 8 * S,
          overflow: "hidden",
          background: "#fff",
        }}>
          {loja.imagemFundoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loja.imagemFundoUrl} alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", pointerEvents: "none",
            }} />
          )}
          <KeyOverlay
            codigo={chave.codigo}
            posicao={posicao ?? "BR"}
            brand={brand}
            fontSize={9 * S}
          />
        </div>
      </div>
    )
  }

  // ── Layout completo ────────────────────────────────────────────────────────
  const logoSz  = CARTAO_H_PX * 0.30
  const qrSz    = CARTAO_H_PX * 0.46
  const qrBoxW  = qrSz + 24
  const logoColW = logoSz + 20

  return (
    <div style={{ width: CARTAO_W_CSS, height: CARTAO_H_CSS, flexShrink: 0,
      overflow: "hidden", position: "relative" }}>
      <div style={{
        width: CARTAO_W_PX,
        height: CARTAO_H_PX,
        position: "absolute",
        top: 0,
        left: 0,
        transform: `scale(${1 / CARTAO_SCALE})`,
        transformOrigin: "top left",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        background: "#fffdf7",
        borderRadius: 8 * S,
        overflow: "hidden",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}>
        {/* Background image */}
        {loja.imagemFundoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loja.imagemFundoUrl} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover",
            opacity: (loja.opacidadeFundo ?? 20) / 100,
            pointerEvents: "none",
          }} />
        )}

        {/* Accent strip esquerda */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: 6 * S, height: "100%",
          background: `linear-gradient(180deg, ${brand}, ${brand}99)`,
          borderRadius: `${8 * S}px 0 0 ${8 * S}px`,
        }} />

        {/* Coluna: logo + nome loja */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", width: logoColW,
          paddingLeft: 10 * S, flexShrink: 0, position: "relative", zIndex: 1,
        }}>
          {loja.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loja.logoUrl} alt={loja.nome} style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              objectFit: "cover", border: `${2 * S}px solid ${brand}`,
              marginBottom: 4 * S,
            }} />
          ) : (
            <div style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}cc, ${brand})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.32, fontWeight: "bold",
              marginBottom: 4 * S, border: `${2 * S}px solid ${brand}`,
            }}>
              {initials(loja.nome)}
            </div>
          )}
          <span style={{
            fontSize: 7 * S, color: brand, fontWeight: "bold",
            textTransform: "uppercase", letterSpacing: 0.4,
            textAlign: "center", lineHeight: 1.2, maxWidth: logoColW - 8,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {loja.nome}
          </span>
        </div>

        {/* Coluna: info campanha + chave */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          gap: 3 * S, paddingLeft: 8 * S, paddingRight: 4 * S,
          overflow: "hidden", position: "relative", zIndex: 1, minWidth: 0,
        }}>
          <div style={{
            fontSize: 7.5 * S, fontWeight: "bold", color: "#5a3e28",
            textTransform: "uppercase", letterSpacing: 0.6,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {campanha.nome}
          </div>
          <div style={{ fontSize: 14 * S, fontWeight: "bold", color: brand, lineHeight: 1 }}>
            {main}
          </div>
          {sub && (
            <div style={{ fontSize: 7 * S, color: "#777", lineHeight: 1.3 }}>
              {sub.length > 50 ? sub.slice(0, 48) + "…" : sub}
            </div>
          )}
          {/* CHAVE — nowrap garantido, fonte calculada para caber em linha única */}
          <code style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 8 * S,
            fontWeight: "bold",
            color: "#2d1a08",
            background: brand + "18",
            border: `${1 * S}px solid ${brand}55`,
            borderRadius: 3 * S,
            padding: `${2 * S}px ${4 * S}px`,
            letterSpacing: 0.8,
            display: "inline-block",
            whiteSpace: "nowrap",   // ← CHAVE SEMPRE EM UMA LINHA
            marginTop: 2 * S,
            alignSelf: "flex-start",
          }}>
            {chave.codigo}
          </code>
          <div style={{ fontSize: 6 * S, color: "#aaa", marginTop: 1 * S }}>
            Válido até: {campanha.expiraEm}
          </div>
        </div>

        {/* Coluna: QR code */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 3 * S,
          width: qrBoxW, paddingRight: 8 * S, flexShrink: 0, position: "relative", zIndex: 1,
        }}>
          <div style={{
            border: `${2 * S}px solid ${brand}`,
            borderRadius: 4 * S, padding: 3 * S, background: "#fff",
          }}>
            {chave.landingUrl ? (
              <QRCodeSVG
                value={chave.landingUrl}
                size={qrSz}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"          // ← H = maior correção de erro, mais robusto na impressão
                marginSize={0}
              />
            ) : (
              <div style={{
                width: qrSz, height: qrSz,
                background: "#f3f4f6", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 7 * S, color: "#9ca3af",
              }}>
                sem URL
              </div>
            )}
          </div>
          <span style={{
            fontSize: 6.5 * S, color: "#aaa", textAlign: "center", lineHeight: 1.3,
          }}>
            Escaneie<br />e ative
          </span>
        </div>

        {/* Watermark */}
        <div style={{
          position: "absolute", bottom: 4 * S, right: 8 * S,
          fontSize: 5.5 * S, color: brand + "44", letterSpacing: 0.4,
        }}>
          courtesyfy.com
        </div>

        {/* Key overlay posicionado (opcional) */}
        {posicao && !modoLimpo && (
          <KeyOverlay
            codigo={chave.codigo}
            posicao={posicao}
            brand={brand}
            fontSize={8 * S}
          />
        )}
      </div>
    </div>
  )
}

// ─── MDF 9 × 9 cm ────────────────────────────────────────────────────────────

const MDF_SCALE  = 3
const MDF_MM     = 90
const MDF_W_PX   = Math.round(MDF_MM * MM_TO_PX * MDF_SCALE)
const MDF_CSS    = Math.round(MDF_MM * MM_TO_PX)

function MdfCard({
  chave,
  campanha,
  loja,
  posicao,
  modoLimpo,
}: {
  chave: Chave
  campanha: Campanha
  loja: Loja
  posicao: PosicaoChave | null
  modoLimpo: boolean
}) {
  const { main, sub } = buildBenefitLabel(campanha)
  const brand  = loja.corPrimaria
  const S      = MDF_SCALE

  if (modoLimpo) {
    return (
      <div style={{ width: MDF_CSS, height: MDF_CSS, flexShrink: 0,
        overflow: "hidden", position: "relative" }}>
        <div style={{
          width: MDF_W_PX, height: MDF_W_PX,
          position: "absolute", top: 0, left: 0,
          transform: `scale(${1 / MDF_SCALE})`,
          transformOrigin: "top left",
          borderRadius: 12 * S,
          overflow: "hidden",
          background: "#fff",
        }}>
          {loja.imagemFundoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loja.imagemFundoUrl} alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", pointerEvents: "none",
            }} />
          )}
          <KeyOverlay
            codigo={chave.codigo}
            posicao={posicao ?? "BR"}
            brand={brand}
            fontSize={11 * S}
          />
        </div>
      </div>
    )
  }

  const logoSz = MDF_W_PX * 0.20
  const qrSz   = MDF_W_PX * 0.32

  return (
    <div style={{ width: MDF_CSS, height: MDF_CSS, flexShrink: 0,
      overflow: "hidden", position: "relative" }}>
      <div style={{
        width: MDF_W_PX, height: MDF_W_PX,
        position: "absolute", top: 0, left: 0,
        transform: `scale(${1 / MDF_SCALE})`,
        transformOrigin: "top left",
        borderRadius: 12 * S, overflow: "hidden",
        background: "#fffdf7",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: `${14 * S}px ${12 * S}px`,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        boxSizing: "border-box",
      }}>
        {loja.imagemFundoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loja.imagemFundoUrl} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover",
            opacity: (loja.opacidadeFundo ?? 20) / 100,
            pointerEvents: "none",
          }} />
        )}

        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6 * S,
          background: `linear-gradient(90deg, ${brand}, ${brand}99)`,
        }} />

        {/* Logo + nome */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 4 * S, marginTop: 2 * S, position: "relative", zIndex: 1,
        }}>
          {loja.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loja.logoUrl} alt={loja.nome} style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              objectFit: "cover", border: `${2 * S}px solid ${brand}`,
            }} />
          ) : (
            <div style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}cc, ${brand})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.35, fontWeight: "bold",
              border: `${2 * S}px solid ${brand}`,
            }}>
              {initials(loja.nome)}
            </div>
          )}
          <span style={{
            fontSize: 9 * S, color: brand, fontWeight: "bold",
            textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center",
          }}>
            {loja.nome}
          </span>
        </div>

        {/* Benefício */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 9.5 * S, fontWeight: "bold", color: "#5a3e28",
            textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 * S,
          }}>
            {campanha.nome}
          </div>
          <div style={{
            fontSize: 24 * S, fontWeight: "bold", color: brand, lineHeight: 1,
            marginBottom: 3 * S,
          }}>
            {main}
          </div>
          {sub && (
            <div style={{ fontSize: 8.5 * S, color: "#777", lineHeight: 1.3 }}>
              {sub.length > 60 ? sub.slice(0, 58) + "…" : sub}
            </div>
          )}
        </div>

        {/* QR + chave */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 4 * S, position: "relative", zIndex: 1,
        }}>
          <div style={{
            border: `${2 * S}px solid ${brand}`, borderRadius: 6 * S,
            padding: 4 * S, background: "#fff",
          }}>
            {chave.landingUrl ? (
              <QRCodeSVG
                value={chave.landingUrl}
                size={qrSz}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"
                marginSize={0}
              />
            ) : (
              <div style={{
                width: qrSz, height: qrSz, background: "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8 * S, color: "#9ca3af",
              }}>sem URL</div>
            )}
          </div>
          {/* CHAVE MDF — nowrap garantido */}
          <code style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 9.5 * S,
            fontWeight: "bold",
            color: "#2d1a08",
            background: brand + "18",
            border: `${1 * S}px solid ${brand}55`,
            borderRadius: 3 * S,
            padding: `${3 * S}px ${7 * S}px`,
            letterSpacing: 1.2,
            whiteSpace: "nowrap",   // ← CHAVE SEMPRE EM UMA LINHA
            display: "inline-block",
          }}>
            {chave.codigo}
          </code>
          <span style={{ fontSize: 7 * S, color: "#aaa" }}>
            Válido até: {campanha.expiraEm}
          </span>
        </div>

        {/* Watermark */}
        <div style={{
          position: "absolute", bottom: 5 * S, right: 9 * S,
          fontSize: 6 * S, color: brand + "44", letterSpacing: 0.4,
        }}>
          courtesyfy.com
        </div>

        {/* Key overlay posicionado */}
        {posicao && !modoLimpo && (
          <KeyOverlay
            codigo={chave.codigo}
            posicao={posicao}
            brand={brand}
            fontSize={10 * S}
          />
        )}
      </div>
    </div>
  )
}

// ─── Seletor de posição da chave ──────────────────────────────────────────────

const POSICAO_LABELS: Record<PosicaoChave, string> = {
  TL: "↖ Sup. esquerdo",
  TR: "↗ Sup. direito",
  BL: "↙ Inf. esquerdo",
  BR: "↘ Inf. direito",
}

function PosicaoSelector({
  value,
  onChange,
}: {
  value: PosicaoChave | null
  onChange: (p: PosicaoChave | null) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
        Posição da chave (overlay)
      </span>
      {/* Grid visual 2×2 */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 4, width: 180,
      }}>
        {(["TL", "TR", "BL", "BR"] as PosicaoChave[]).map(pos => (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(value === pos ? null : pos)}
            style={{
              padding: "5px 6px",
              fontSize: 11,
              fontWeight: value === pos ? 700 : 400,
              borderRadius: 6,
              border: value === pos
                ? "1.5px solid #10b981"
                : "1px solid #d1d5db",
              background: value === pos ? "#ecfdf5" : "#fff",
              color: value === pos ? "#065f46" : "#6b7280",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {POSICAO_LABELS[pos]}
          </button>
        ))}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{
            fontSize: 11, color: "#ef4444", background: "none",
            border: "none", cursor: "pointer", textAlign: "left", padding: 0,
          }}
        >
          ✕ Remover overlay
        </button>
      )}
    </div>
  )
}

// ─── Main PrintGrid ───────────────────────────────────────────────────────────

export function PrintGrid({
  chaves,
  campanha,
  loja,
  nomeLote,
  totalChaves,
  geradoEm,
  formato,
  autoPrint,
}: Props) {
  const [posicao, setPosicao]       = useState<PosicaoChave | null>(null)
  const [modoLimpo, setModoLimpo]   = useState(false)
  const isCartao = formato === "cartao"

  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 1200)
      return () => clearTimeout(t)
    }
  }, [autoPrint])

  // ── CSS de impressão ─────────────────────────────────────────────────────
  // - remove qualquer borda/sombra do wrapper
  // - garante background branco puro
  // - remove a toolbar no print
  const printCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&display=swap');

    @page {
      size: A4 portrait;
      margin: 8mm;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    @media print {
      .no-print         { display: none !important; }
      aside, header, nav { display: none !important; }

      body, body > div,
      body > div > div,
      main {
        overflow: visible !important;
        height: auto !important;
        background: transparent !important;
      }

      .screen-wrapper {
        background: transparent !important;
        padding: 0 !important;
        min-height: 0 !important;
      }

      .a4-sheet {
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: auto !important;
        min-height: 0 !important;
      }

      .print-grid {
        gap: 4mm !important;
      }
    }
  `

  // ── Grid layout ──────────────────────────────────────────────────────────
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isCartao ? "repeat(2, auto)" : "repeat(2, auto)",
    gap: "4mm",
    justifyContent: "start",
    alignContent: "start",
  }

  // ── Toolbar buttons ──────────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontWeight: 600, fontSize: 13, padding: "9px 18px",
    borderRadius: 10, cursor: "pointer", border: "none",
  }

  return (
    <>
      <style>{printCSS}</style>

      <div
        className="screen-wrapper"
        style={{ paddingTop: 28, paddingBottom: 40, background: "#e8e8e8", minHeight: "100vh" }}
      >
        {/* ── Toolbar ── */}
        <div
          className="no-print"
          style={{
            width: "100%", maxWidth: 794,
            margin: "0 auto 14px",
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Voltar */}
          <button
            onClick={() => window.history.back()}
            style={{ ...btnBase, background: "#fff", color: "#374151",
              border: "1.5px solid #e5e7eb" }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>

          {/* Opções centrais */}
          <div style={{
            display: "flex", gap: 12, alignItems: "center",
            flexWrap: "wrap",
          }}>
            {/* Modo Limpo */}
            <label style={{
              display: "flex", alignItems: "center", gap: 7,
              cursor: "pointer", background: "#fff", padding: "8px 14px",
              borderRadius: 10, border: modoLimpo
                ? "1.5px solid #10b981"
                : "1.5px solid #e5e7eb",
              fontSize: 13, fontWeight: 600, color: modoLimpo ? "#065f46" : "#374151",
            }}>
              <input
                type="checkbox"
                checked={modoLimpo}
                onChange={e => setModoLimpo(e.target.checked)}
                style={{ accentColor: "#10b981", width: 14, height: 14 }}
              />
              🖼️ Modo arte própria
            </label>

            {/* Posição overlay */}
            <div style={{
              background: "#fff", padding: "10px 14px", borderRadius: 10,
              border: "1.5px solid #e5e7eb",
            }}>
              <PosicaoSelector value={posicao} onChange={setPosicao} />
            </div>
          </div>

          {/* Imprimir */}
          <button
            onClick={() => window.print()}
            style={{ ...btnBase, background: "#111827", color: "#fff" }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Salvar PDF
          </button>
        </div>

        {/* Info no-print */}
        <div
          className="no-print"
          style={{
            width: "100%", maxWidth: 794, margin: "0 auto 10px",
            display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "#6b7280", background: "#fff",
            padding: "5px 12px", borderRadius: 20, border: "1px solid #e5e7eb" }}>
            📄 {nomeLote} · {totalChaves} chaves · gerado em {geradoEm}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            💡 No diálogo de impressão, escolha <strong>Salvar como PDF</strong> para qualidade máxima
          </span>
        </div>

        {/* A4 Sheet */}
        <div
          className="a4-sheet"
          style={{
            width: 794,
            minHeight: 1123,
            padding: "8mm",
            background: "#fff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
            margin: "0 auto 32px",
            boxSizing: "border-box",
          }}
        >
          <div className="print-grid" style={gridStyle}>
            {chaves.map(chave =>
              isCartao ? (
                <CartaoCard
                  key={chave.codigo}
                  chave={chave}
                  campanha={campanha}
                  loja={loja}
                  posicao={posicao}
                  modoLimpo={modoLimpo}
                />
              ) : (
                <MdfCard
                  key={chave.codigo}
                  chave={chave}
                  campanha={campanha}
                  loja={loja}
                  posicao={posicao}
                  modoLimpo={modoLimpo}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </>
  )
}
