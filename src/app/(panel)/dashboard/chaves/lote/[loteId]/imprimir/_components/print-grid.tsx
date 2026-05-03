"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect } from "react"

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
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

// ── Cartão 3,5 × 7 cm ─────────────────────────────────────────────────────────
function CartaoCard({ chave, campanha, loja }: { chave: Chave; campanha: Campanha; loja: Loja }) {
  const { main, sub } = buildBenefitLabel(campanha)
  const brand = loja.corPrimaria

  return (
    <div
      className="cartao"
      style={{
        border: `1.5px dashed ${brand}`,
        borderRadius: 8,
        padding: "6px 8px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        background: "linear-gradient(135deg, #fffdf7 60%, #fdf3e3 100%)",
        position: "relative",
        overflow: "hidden",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* Background image */}
      {loja.imagemFundoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={loja.imagemFundoUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: (loja.opacidadeFundo ?? 20) / 100,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Left accent strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 5,
          height: "100%",
          background: `linear-gradient(180deg, ${brand}, ${brand}aa)`,
          borderRadius: "8px 0 0 8px",
        }}
      />

      {/* Col — store */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 60,
          paddingLeft: 6,
        }}
      >
        {loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.logoUrl}
            alt={loja.nome}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${brand}`,
              marginBottom: 3,
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}cc, ${brand})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: "bold",
              marginBottom: 3,
              border: `2px solid ${brand}`,
            }}
          >
            {initials(loja.nome)}
          </div>
        )}
        <span
          style={{
            fontSize: 6.5,
            color: brand,
            fontWeight: "bold",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            lineHeight: 1.2,
          }}
        >
          {loja.nome}
        </span>
      </div>

      {/* Col — campaign info */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2,
          paddingLeft: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 7.5,
            fontWeight: "bold",
            color: "#5a3e28",
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          {campanha.nome}
        </div>
        <div style={{ fontSize: 13, fontWeight: "bold", color: brand, lineHeight: 1.1 }}>
          {main}
        </div>
        {sub && (
          <div style={{ fontSize: 7, color: "#777", lineHeight: 1.3 }}>
            {sub.length > 60 ? sub.slice(0, 58) + "…" : sub}
          </div>
        )}
        <code
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 8.5,
            fontWeight: "bold",
            color: "#3a2510",
            background: "#fdf3e3",
            border: `1px solid ${brand}`,
            borderRadius: 3,
            padding: "2px 4px",
            letterSpacing: 1,
            display: "inline-block",
            marginTop: 2,
          }}
        >
          {chave.codigo}
        </code>
        <div style={{ fontSize: 6, color: "#aaa", marginTop: 1 }}>
          Válido até: {campanha.expiraEm}
        </div>
      </div>

      {/* Col — QR */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          minWidth: 68,
        }}
      >
        <div
          style={{
            border: `1.5px solid ${brand}`,
            borderRadius: 4,
            padding: 3,
            background: "#fff",
          }}
        >
          {chave.landingUrl ? (
            <QRCodeSVG
              value={chave.landingUrl}
              size={56}
              bgColor="#ffffff"
              fgColor="#111827"
              level="M"
              marginSize={0}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 7,
                color: "#9ca3af",
              }}
            >
              sem URL
            </div>
          )}
        </div>
        <span style={{ fontSize: 6, color: "#aaa", textAlign: "center", lineHeight: 1.3 }}>
          Escaneie
          <br />e ative
        </span>
      </div>

      {/* Footer watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 3,
          right: 7,
          fontSize: 5.5,
          color: "#ddd",
          letterSpacing: 0.4,
        }}
      >
        courtesyfy.com
      </div>
    </div>
  )
}

// ── MDF 9 × 9 cm ──────────────────────────────────────────────────────────────
function MdfCard({ chave, campanha, loja }: { chave: Chave; campanha: Campanha; loja: Loja }) {
  const { main, sub } = buildBenefitLabel(campanha)
  const brand = loja.corPrimaria

  return (
    <div
      style={{
        width: "90mm",
        height: "90mm",
        border: `2px solid ${brand}`,
        borderRadius: 12,
        padding: "6mm",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(160deg, #fffdf7 40%, #fdf3e3 100%)",
        position: "relative",
        overflow: "hidden",
        breakInside: "avoid",
        pageBreakInside: "avoid",
        boxSizing: "border-box",
      }}
    >
      {/* Background image */}
      {loja.imagemFundoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={loja.imagemFundoUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: (loja.opacidadeFundo ?? 20) / 100,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${brand}, ${brand}99)`,
          borderRadius: "10px 10px 0 0",
        }}
      />

      {/* Store header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          marginTop: 4,
        }}
      >
        {loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.logoUrl}
            alt={loja.nome}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${brand}`,
            }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}cc, ${brand})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: "bold",
              border: `2px solid ${brand}`,
            }}
          >
            {initials(loja.nome)}
          </div>
        )}
        <span
          style={{
            fontSize: 8,
            color: brand,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            textAlign: "center",
          }}
        >
          {loja.nome}
        </span>
      </div>

      {/* Benefit */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: "bold",
            color: "#5a3e28",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 2,
          }}
        >
          {campanha.nome}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: brand,
            lineHeight: 1,
            marginBottom: 3,
          }}
        >
          {main}
        </div>
        {sub && (
          <div style={{ fontSize: 8, color: "#777", lineHeight: 1.3 }}>
            {sub.length > 70 ? sub.slice(0, 68) + "…" : sub}
          </div>
        )}
      </div>

      {/* QR code */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div
          style={{
            border: `2px solid ${brand}`,
            borderRadius: 6,
            padding: 4,
            background: "#fff",
          }}
        >
          {chave.landingUrl ? (
            <QRCodeSVG
              value={chave.landingUrl}
              size={80}
              bgColor="#ffffff"
              fgColor="#111827"
              level="M"
              marginSize={0}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "#9ca3af",
              }}
            >
              sem URL
            </div>
          )}
        </div>
        <code
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            fontWeight: "bold",
            color: "#3a2510",
            background: "#fdf3e3",
            border: `1px solid ${brand}`,
            borderRadius: 3,
            padding: "2px 5px",
            letterSpacing: 1.2,
          }}
        >
          {chave.codigo}
        </code>
        <span style={{ fontSize: 6.5, color: "#aaa" }}>Válido até: {campanha.expiraEm}</span>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 8,
          fontSize: 6,
          color: "#ddd",
          letterSpacing: 0.4,
        }}
      >
        courtesyfy.com
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
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
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 800)
      return () => clearTimeout(t)
    }
  }, [autoPrint])

  const isCartao = formato === "cartao"

  const gridStyle: React.CSSProperties = isCartao
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        gap: "5mm",
      }
    : {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "5mm",
      }

  const pageMargin = isCartao ? "10mm" : "15mm"

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: ${pageMargin}; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          .no-print            { display: none !important; }
          aside                { display: none !important; }
          header               { display: none !important; }
          body, body > div,
          body > div > div,
          main                 { overflow: visible !important; height: auto !important; }
          .screen-bg           { background: transparent !important; padding: 0 !important; min-height: 0 !important; }
          .a4-sheet            { box-shadow: none !important; margin: 0 !important; padding: 0 !important;
                                 width: auto !important; min-height: 0 !important; }
        }
      `}</style>

      {/* Single render tree:
          - screen: gray bg + A4 white card with shadow
          - print:  .screen-bg and .a4-sheet classes strip decoration via @media print above */}
      <div
        className="screen-bg"
        style={{ paddingTop: 32, paddingBottom: 32, background: "#f0f0f0", minHeight: "100vh" }}
      >
        {/* Barra acima da folha — some ao imprimir */}
        <div
          className="no-print"
          style={{ width: "210mm", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              fontSize: 14,
              padding: "10px 20px",
              borderRadius: 12,
              border: "1.5px solid #e5e7eb",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#111827",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Enviar para impressora
          </button>
        </div>
        <div
          className="a4-sheet"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm",
            background: "#fff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            margin: "0 auto 24px",
          }}
        >
          <div style={gridStyle}>
            {chaves.map((chave) =>
              isCartao ? (
                <CartaoCard key={chave.codigo} chave={chave} campanha={campanha} loja={loja} />
              ) : (
                <MdfCard key={chave.codigo} chave={chave} campanha={campanha} loja={loja} />
              ),
            )}
          </div>
        </div>
      </div>
    </>
  )
}
