"use client"

import { useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"

// ─── Types ────────────────────────────────────────────────────────────────────

type KeyPos = { x: number; y: number }

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

interface PrintSheetProps {
  chaves: Chave[]
  campanha: Campanha
  loja: Loja
  formato: "cartao" | "mdf"
  keyPos: KeyPos | null
  keyColor: string
  keySize: number   // slider 7–18, convertido internamente para mm
  modoLimpo: boolean
  nomeLote: string
  totalChaves: number
  geradoEm: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MM_PX = 3.7795 // 1mm em px a 96dpi CSS

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function buildBenefitLabel(c: Campanha): { main: string; sub: string } {
  const val = c.valorBeneficio ? parseFloat(c.valorBeneficio) : null
  switch (c.tipoBeneficio) {
    case "DESCONTO_PERCENTUAL":
      return { main: val ? `${val}% OFF` : "Desconto", sub: c.descricao ?? "" }
    case "DESCONTO_FIXO":
      return {
        main: val
          ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} OFF`
          : "Desconto",
        sub: c.descricao ?? "",
      }
    case "BRINDE":
      return { main: c.descricaoPremio ?? "Brinde", sub: c.descricao ?? "" }
    case "SORTEIO":
      return { main: c.descricaoPremio ?? "Sorteio", sub: c.descricao ?? "" }
    case "FRETE_GRATIS":
      return { main: "Frete Grátis", sub: c.descricao ?? "" }
    default:
      return { main: c.nome, sub: c.descricao ?? "" }
  }
}

// ─── KeyBadge ─────────────────────────────────────────────────────────────────
// Renderizado em mm, 100% vetorial na impressão.

function KeyBadge({
  codigo,
  pos,
  color,
  sizeMm,
}: {
  codigo: string
  pos: KeyPos
  color: string
  sizeMm: number
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <code
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: `${sizeMm}mm`,
          fontWeight: "bold",
          color,
          background: "rgba(255,255,255,0.92)",
          padding: "0.5mm 1.5mm",
          border: `0.35mm solid ${color}`,
          borderRadius: "1.2mm",
          whiteSpace: "nowrap",
          display: "block",
          letterSpacing: "0.03em",
        }}
      >
        {codigo}
      </code>
    </div>
  )
}

// ─── CartaoPrintCard (70 × 35 mm) ────────────────────────────────────────────

function CartaoPrintCard({
  chave,
  campanha,
  loja,
  keyPos,
  keyColor,
  keySizeMm,
  modoLimpo,
}: {
  chave: Chave
  campanha: Campanha
  loja: Loja
  keyPos: KeyPos | null
  keyColor: string
  keySizeMm: number
  modoLimpo: boolean
}) {
  const brand = loja.corPrimaria
  const { main, sub } = buildBenefitLabel(campanha)

  const cardStyle: React.CSSProperties = {
    width: "70mm",
    height: "35mm",
    position: "relative",
    overflow: "hidden",
    background: "#fffdf7",
    borderRadius: "1.5mm",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    boxSizing: "border-box",
    breakInside: "avoid",
    pageBreakInside: "avoid",
    border: "0.2mm solid #e5e7eb",
  }

  if (modoLimpo) {
    return (
      <div style={{ ...cardStyle, background: loja.imagemFundoUrl ? "transparent" : "#fff" }}>
        {loja.imagemFundoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.imagemFundoUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {keyPos && (
          <KeyBadge codigo={chave.codigo} pos={keyPos} color={keyColor} sizeMm={keySizeMm} />
        )}
      </div>
    )
  }

  const qrMm = 13
  const qrPx = Math.round(qrMm * MM_PX)

  return (
    <div style={cardStyle}>
      {/* Imagem de fundo */}
      {loja.imagemFundoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={loja.imagemFundoUrl}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: (loja.opacidadeFundo ?? 20) / 100,
          }}
        />
      )}

      {/* Faixa lateral esquerda */}
      <div
        style={{
          position: "absolute", top: 0, left: 0,
          width: "1.5mm", height: "100%",
          background: `linear-gradient(180deg, ${brand}, ${brand}99)`,
          borderRadius: "1.5mm 0 0 1.5mm",
        }}
      />

      {/* Coluna: logo + nome */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          width: "18mm", paddingLeft: "3mm", flexShrink: 0,
          position: "relative", zIndex: 1, overflow: "hidden",
        }}
      >
        {loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.logoUrl}
            alt={loja.nome}
            style={{
              width: "9mm", height: "9mm", borderRadius: "50%",
              objectFit: "cover", border: `0.5mm solid ${brand}`,
              marginBottom: "1mm", display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "9mm", height: "9mm", borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}cc, ${brand})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "3mm", fontWeight: "bold",
              marginBottom: "1mm", border: `0.5mm solid ${brand}`,
              flexShrink: 0,
            }}
          >
            {initials(loja.nome)}
          </div>
        )}
        <div
          style={{
            fontSize: "1.8mm", color: brand, fontWeight: "bold",
            textTransform: "uppercase", letterSpacing: "0.3px",
            textAlign: "center", lineHeight: 1.2,
            width: "100%", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {loja.nome}
        </div>
      </div>

      {/* Coluna: informações */}
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", gap: "0.8mm",
          paddingLeft: "2mm", paddingRight: "1mm",
          overflow: "hidden", position: "relative", zIndex: 1, minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "1.8mm", fontWeight: "bold", color: "#5a3e28",
            textTransform: "uppercase", letterSpacing: "0.3px",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", display: "block",
          }}
        >
          {campanha.nome}
        </div>
        <div style={{ fontSize: "3.5mm", fontWeight: "bold", color: brand, lineHeight: 1 }}>
          {main}
        </div>
        {sub && (
          <div
            style={{
              fontSize: "1.6mm", color: "#777", lineHeight: 1.3,
              overflow: "hidden", maxHeight: "4.5mm",
            }}
          >
            {sub.length > 50 ? sub.slice(0, 48) + "…" : sub}
          </div>
        )}
        <div style={{ fontSize: "1.5mm", color: "#aaa" }}>
          Válido até: {campanha.expiraEm}
        </div>
      </div>

      {/* Coluna: QR code */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "1mm",
          width: "20mm", paddingRight: "2mm",
          flexShrink: 0, position: "relative", zIndex: 1,
        }}
      >
        <div
          style={{
            border: `0.5mm solid ${brand}`,
            borderRadius: "1mm",
            padding: "0.8mm",
            background: "#fff",
          }}
        >
          {chave.landingUrl ? (
            <QRCodeSVG
              value={chave.landingUrl}
              size={qrPx}
              bgColor="#ffffff"
              fgColor="#111827"
              level="H"
              marginSize={0}
              style={{ display: "block", width: `${qrMm}mm`, height: `${qrMm}mm` }}
            />
          ) : (
            <div style={{ width: `${qrMm}mm`, height: `${qrMm}mm`, background: "#f3f4f6" }} />
          )}
        </div>
        <div style={{ fontSize: "1.4mm", color: "#aaa", textAlign: "center", lineHeight: 1.3 }}>
          Escaneie<br />e ative
        </div>
      </div>

      {/* Marca d'água */}
      <div
        style={{
          position: "absolute", bottom: "1mm", right: "2mm",
          fontSize: "1.2mm", color: brand + "44",
        }}
      >
        courtesyfy.com.br
      </div>

      {/* Chave */}
      {keyPos && (
        <KeyBadge codigo={chave.codigo} pos={keyPos} color={keyColor} sizeMm={keySizeMm} />
      )}
    </div>
  )
}

// ─── MdfPrintCard (90 × 90 mm) ───────────────────────────────────────────────

function MdfPrintCard({
  chave,
  campanha,
  loja,
  keyPos,
  keyColor,
  keySizeMm,
  modoLimpo,
}: {
  chave: Chave
  campanha: Campanha
  loja: Loja
  keyPos: KeyPos | null
  keyColor: string
  keySizeMm: number
  modoLimpo: boolean
}) {
  const brand = loja.corPrimaria
  const { main, sub } = buildBenefitLabel(campanha)

  const cardStyle: React.CSSProperties = {
    width: "90mm",
    height: "90mm",
    position: "relative",
    overflow: "hidden",
    background: "#fffdf7",
    borderRadius: "3mm",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "3.5mm 3mm",
    boxSizing: "border-box",
    breakInside: "avoid",
    pageBreakInside: "avoid",
    border: "0.2mm solid #e5e7eb",
  }

  if (modoLimpo) {
    return (
      <div style={{ ...cardStyle, background: loja.imagemFundoUrl ? "transparent" : "#fff" }}>
        {loja.imagemFundoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.imagemFundoUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {keyPos && (
          <KeyBadge codigo={chave.codigo} pos={keyPos} color={keyColor} sizeMm={keySizeMm} />
        )}
      </div>
    )
  }

  const qrMm = 26
  const qrPx = Math.round(qrMm * MM_PX)

  return (
    <div style={cardStyle}>
      {/* Imagem de fundo */}
      {loja.imagemFundoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={loja.imagemFundoUrl}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: (loja.opacidadeFundo ?? 20) / 100,
          }}
        />
      )}

      {/* Faixa superior */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "1.5mm",
          background: `linear-gradient(90deg, ${brand}, ${brand}99)`,
        }}
      />

      {/* Logo + nome */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "1mm", marginTop: "1mm", position: "relative", zIndex: 1,
        }}
      >
        {loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.logoUrl}
            alt={loja.nome}
            style={{
              width: "18mm", height: "18mm", borderRadius: "50%",
              objectFit: "cover", border: `0.5mm solid ${brand}`, display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "18mm", height: "18mm", borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}cc, ${brand})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "6mm", fontWeight: "bold",
              border: `0.5mm solid ${brand}`,
            }}
          >
            {initials(loja.nome)}
          </div>
        )}
        <div
          style={{
            fontSize: "2.2mm", color: brand, fontWeight: "bold",
            textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center",
          }}
        >
          {loja.nome}
        </div>
      </div>

      {/* Benefício */}
      <div
        style={{
          textAlign: "center", position: "relative", zIndex: 1,
          overflow: "hidden", width: "100%",
        }}
      >
        <div
          style={{
            fontSize: "2.2mm", fontWeight: "bold", color: "#5a3e28",
            textTransform: "uppercase", letterSpacing: "0.5px",
            marginBottom: "0.8mm", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
          }}
        >
          {campanha.nome}
        </div>
        <div
          style={{ fontSize: "6mm", fontWeight: "bold", color: brand, lineHeight: 1, marginBottom: "0.8mm" }}
        >
          {main}
        </div>
        {sub && (
          <div
            style={{
              fontSize: "2mm", color: "#777", lineHeight: 1.3,
              overflow: "hidden", maxHeight: "6mm",
            }}
          >
            {sub.length > 60 ? sub.slice(0, 58) + "…" : sub}
          </div>
        )}
      </div>

      {/* QR code */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "1mm", position: "relative", zIndex: 1,
        }}
      >
        <div
          style={{
            border: `0.5mm solid ${brand}`, borderRadius: "1.5mm",
            padding: "1mm", background: "#fff",
          }}
        >
          {chave.landingUrl ? (
            <QRCodeSVG
              value={chave.landingUrl}
              size={qrPx}
              bgColor="#ffffff"
              fgColor="#111827"
              level="H"
              marginSize={0}
              style={{ display: "block", width: `${qrMm}mm`, height: `${qrMm}mm` }}
            />
          ) : (
            <div style={{ width: `${qrMm}mm`, height: `${qrMm}mm`, background: "#f3f4f6" }} />
          )}
        </div>
        <div style={{ fontSize: "1.8mm", color: "#aaa" }}>
          Válido até: {campanha.expiraEm}
        </div>
      </div>

      {/* Marca d'água */}
      <div
        style={{
          position: "absolute", bottom: "1.5mm", right: "2.5mm",
          fontSize: "1.4mm", color: brand + "44",
        }}
      >
        courtesyfy.com.br
      </div>

      {/* Chave */}
      {keyPos && (
        <KeyBadge codigo={chave.codigo} pos={keyPos} color={keyColor} sizeMm={keySizeMm} />
      )}
    </div>
  )
}

// ─── PrintSheet ───────────────────────────────────────────────────────────────

export function PrintSheet({
  chaves,
  campanha,
  loja,
  formato,
  keyPos,
  keyColor,
  keySize,
  modoLimpo,
  nomeLote,
  totalChaves,
  geradoEm,
}: PrintSheetProps) {
  const isCartao = formato === "cartao"

  // Converte o slider de tamanho (7–18) em mm proporcional
  const keySizeMm = parseFloat((keySize * 0.25).toFixed(2))

  // Auto-print após 1.5s para imagens carregarem
  useEffect(() => {
    const t = setTimeout(() => window.print(), 1500)
    return () => clearTimeout(t)
  }, [])

  const sharedProps = { campanha, loja, keyPos, keyColor, keySizeMm, modoLimpo }

  return (
    <>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        @media print {
          .print-toolbar { display: none !important; }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print-page-wrapper {
            padding: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: auto !important;
          }
        }

        @media screen {
          body { background: #e8e8e8; font-family: system-ui, sans-serif; }
          .print-page-wrapper {
            background: white;
            padding: 8mm;
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto 40px;
            box-shadow: 0 4px 32px rgba(0,0,0,0.18);
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* Barra superior — oculta na impressão */}
      <div
        className="print-toolbar"
        style={{
          background: "#111827",
          color: "#fff",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span style={{ fontSize: 13, opacity: 0.65 }}>
          📄 {nomeLote} · {totalChaves} chaves · {geradoEm}
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.45 }}>
            Abrindo diálogo de impressão...
          </span>
          <button
            onClick={() => window.print()}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              padding: "8px 18px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir / Salvar PDF
          </button>
          <button
            onClick={() => window.close()}
            style={{
              background: "none",
              color: "#9ca3af",
              border: "1px solid #374151",
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Folha A4 */}
      <div className="print-page-wrapper">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCartao ? "repeat(2, 70mm)" : "repeat(2, 90mm)",
            gap: "4mm",
            justifyContent: "start",
            alignContent: "start",
          }}
        >
          {chaves.map((chave) =>
            isCartao ? (
              <CartaoPrintCard key={chave.codigo} chave={chave} {...sharedProps} />
            ) : (
              <MdfPrintCard key={chave.codigo} chave={chave} {...sharedProps} />
            ),
          )}
        </div>
      </div>
    </>
  )
}
