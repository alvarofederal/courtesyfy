"use client"

import { QRCodeSVG } from "qrcode.react"

// ─────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────

export type TamanhoCard  = "MINI" | "CARTAO" | "PADRAO" | "COUPON" | "VOUCHER" | "MEIO_A4" | "MDF"
export type EstiloCard   = "CLASSICO" | "MODERNO" | "MINIMALISTA" | "GRADIENTE" | "NEON"
export type PosicaoChave = "TL" | "TR" | "BL" | "BR" | null

export interface CardSize {
  label: string
  desc: string
  mmW: number
  mmH: number
  preW: number
  preH: number
  perFolha: number
  cols: number
  rows: number
}

export const CARD_SIZES: Record<TamanhoCard, CardSize> = {
  MINI:    { label: "Mini",    desc: "63×38 mm · 21/folha",  mmW:  63, mmH:  38, preW: 252, preH: 152, perFolha: 21, cols: 3, rows: 7 },
  CARTAO:  { label: "Cartão",  desc: "70×35 mm · 14/folha",  mmW:  70, mmH:  35, preW: 280, preH: 140, perFolha: 14, cols: 2, rows: 7 },
  PADRAO:  { label: "Padrão",  desc: "85×55 mm · 10/folha",  mmW:  85, mmH:  55, preW: 340, preH: 220, perFolha: 10, cols: 2, rows: 5 },
  COUPON:  { label: "Cupom",   desc: "95×68 mm · 8/folha",   mmW:  95, mmH:  68, preW: 380, preH: 272, perFolha:  8, cols: 2, rows: 4 },
  VOUCHER: { label: "Voucher", desc: "190×68 mm · 4/folha",  mmW: 190, mmH:  68, preW: 570, preH: 204, perFolha:  4, cols: 1, rows: 4 },
  MEIO_A4: { label: "Meio A4", desc: "190×138 mm · 2/folha", mmW: 190, mmH: 138, preW: 570, preH: 414, perFolha:  2, cols: 1, rows: 2 },
  MDF:     { label: "MDF",     desc: "90×90 mm · 6/folha",   mmW:  90, mmH:  90, preW: 360, preH: 360, perFolha:  6, cols: 2, rows: 3 },
}

// ─────────────────────────────────────────────────────────────
// CARD PROPS
// ─────────────────────────────────────────────────────────────

export interface CardProps {
  size: CardSize
  corPrimaria: string
  corFundo: string
  corTexto: string
  corSecundaria: string
  img1: string
  img2: string
  opacidade: number
  brilho: number
  saturacao: number
  contraste: number
  raioCantos: number
  nomeLoja: string
  nomeCampanha: string
  posicaoChave?: PosicaoChave
  modoLimpo?: boolean
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function imgFilter(b: number, s: number, c: number) {
  return `brightness(${b}%) saturate(${s}%) contrast(${c}%)`
}

/** Overlay da chave no canto escolhido */
export function KeyOverlayRenderer({
  codigo,
  posicao,
  corPrimaria,
  fontSize,
}: {
  codigo: string
  posicao: Exclude<PosicaoChave, null>
  corPrimaria: string
  fontSize: number
}) {
  const corner: React.CSSProperties = {
    TL: { top: 6, left: 6 },
    TR: { top: 6, right: 6 },
    BL: { bottom: 6, left: 6 },
    BR: { bottom: 6, right: 6 },
  }[posicao]
  return (
    <div style={{
      position: "absolute", zIndex: 10, ...corner,
      background: "rgba(0,0,0,0.72)", borderRadius: 4,
      padding: "3px 7px", border: `1px solid ${corPrimaria}88`,
    }}>
      <code style={{
        fontFamily: "monospace", fontSize, fontWeight: "bold",
        color: "#ffffff", whiteSpace: "nowrap", letterSpacing: 1.2, display: "block",
      }}>
        XXXX-YYYY-ZZZZ-WWWW
      </code>
    </div>
  )
}
export function ini(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "AB"
}
export function isSquare(size: CardSize) {
  return Math.abs(size.mmW / size.mmH - 1) < 0.15
}
export const codeStyle = (size: CardSize, corTexto: string, corPrimaria: string) => ({
  fontFamily: "monospace",
  fontSize: size.preH * 0.07,
  fontWeight: "bold" as const,
  color: corTexto,
  background: corPrimaria + "15",
  border: `1px solid ${corPrimaria}55`,
  borderRadius: 3,
  padding: "1px 5px",
  display: "inline-block",
  whiteSpace: "nowrap" as const,
  overflow: "hidden" as const,
  maxWidth: "100%",
})

// ─────────────────────────────────────────────────────────────
// RENDERERS
// ─────────────────────────────────────────────────────────────

function CardClassicoLandscape({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const logoSz = size.preH * 0.28
  const qrSz   = size.preH * 0.36
  return (
    <div style={{
      width: size.preW, height: size.preH,
      border: `1.5px solid ${corPrimaria}55`, borderRadius: r,
      display: "flex", flexDirection: "row", alignItems: "center",
      padding: `6px 10px 6px 14px`,
      background: corFundo, position: "relative", overflow: "hidden",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: opacidade / 100, pointerEvents: "none",
        filter: imgFilter(b, s, c),
      }} />}
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%",
        background: `linear-gradient(180deg,${corPrimaria},${corPrimaria}88)`,
        borderRadius: `${r}px 0 0 ${r}px` }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", width: size.preW * 0.2, paddingLeft: 4,
        flexShrink: 0, position: "relative", zIndex: 1 }}>
        {img2
          ? <img src={img2} alt="" style={{ width: logoSz, height: logoSz,
              borderRadius: "50%", objectFit: "cover",
              border: `2px solid ${corPrimaria}`, marginBottom: 3 }} />
          : <div style={{ width: logoSz, height: logoSz, borderRadius: "50%",
              background: `linear-gradient(135deg,${corPrimaria}cc,${corPrimaria})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.32, fontWeight: "bold",
              marginBottom: 3, border: `2px solid ${corPrimaria}` }}>{letters}</div>
        }
        <span style={{ fontSize: size.preH * 0.065, color: corPrimaria, fontWeight: "bold",
          textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center", lineHeight: 1.2,
          whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", textOverflow: "ellipsis" }}>
          {nomeLoja || "Sua Loja"}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 2, paddingLeft: 8, overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: size.preH * 0.065, fontWeight: "bold", color: corSecundaria,
          textTransform: "uppercase", letterSpacing: 0.5,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{ fontSize: size.preH * 0.14, fontWeight: "bold", color: corPrimaria, lineHeight: 1 }}>
          20% OFF
        </div>
        <div style={{ fontSize: size.preH * 0.065, color: corSecundaria + "99" }}>Desconto exclusivo</div>
        <code style={codeStyle(size, corTexto, corPrimaria)}>XXXX-YYYY-ZZZZ-WWWW</code>
        <div style={{ fontSize: size.preH * 0.055, color: corSecundaria + "66" }}>Válido até 31/12/2025</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 3, width: qrSz + 18, flexShrink: 0,
        position: "relative", zIndex: 1 }}>
        <div style={{ border: `1.5px solid ${corPrimaria}`, borderRadius: 4, padding: 3, background: "#fff" }}>
          <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
            bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
        </div>
        <span style={{ fontSize: size.preH * 0.055, color: corSecundaria + "88",
          textAlign: "center", lineHeight: 1.3, whiteSpace: "nowrap" }}>Escaneie e ative</span>
      </div>
      <div style={{ position: "absolute", bottom: 3, right: 8,
        fontSize: size.preH * 0.048, color: corSecundaria + "44",
        letterSpacing: 0.4, whiteSpace: "nowrap" }}>
        courtesyfy.com
      </div>
    </div>
  )
}

function CardClassicoSquare({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const pad    = size.preW * 0.055
  const logoSz = size.preW * 0.20
  const qrSz   = size.preW * 0.27
  return (
    <div style={{
      width: size.preW, height: size.preH,
      borderRadius: r, overflow: "hidden",
      background: corFundo, position: "relative",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column",
      border: `1.5px solid ${corPrimaria}55`,
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: opacidade / 100,
        pointerEvents: "none", filter: imgFilter(b, s, c),
      }} />}
      <div style={{ height: 5, background: corPrimaria, flexShrink: 0, position: "relative", zIndex: 1 }} />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${pad * 0.6}px ${pad}px ${pad * 0.4}px`, gap: pad * 0.7,
        position: "relative", zIndex: 1 }}>
        {img2
          ? <img src={img2} alt="" style={{ width: logoSz, height: logoSz,
              borderRadius: "50%", objectFit: "cover",
              border: `2px solid ${corPrimaria}`, flexShrink: 0 }} />
          : <div style={{ width: logoSz, height: logoSz, borderRadius: "50%",
              background: `linear-gradient(135deg,${corPrimaria}cc,${corPrimaria})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.35, fontWeight: "bold",
              border: `2px solid ${corPrimaria}`, flexShrink: 0 }}>{letters}</div>
        }
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div style={{ fontSize: size.preW * 0.07, fontWeight: "bold", color: corPrimaria,
            textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nomeLoja || "Sua Loja"}
          </div>
          <div style={{ fontSize: size.preW * 0.062, color: corSecundaria,
            textTransform: "uppercase", letterSpacing: 0.3, marginTop: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nomeCampanha || "Campanha"}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: corPrimaria + "30",
        margin: `0 ${pad}px`, position: "relative", zIndex: 1 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${pad * 0.6}px ${pad}px`, gap: pad * 0.8,
        position: "relative", zIndex: 1 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: size.preW * 0.18, fontWeight: "bold", color: corPrimaria, lineHeight: 1 }}>
            20% OFF
          </div>
          <div style={{ fontSize: size.preW * 0.062, color: corSecundaria + "99", marginTop: 2 }}>
            Desconto exclusivo
          </div>
          <code style={{ ...codeStyle(size, corTexto, corPrimaria), fontSize: size.preW * 0.065, marginTop: 5 }}>
            XXXX-YYYY-ZZZZ-WWWW
          </code>
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ border: `1.5px solid ${corPrimaria}`, borderRadius: 4, padding: 3, background: "#fff" }}>
            <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
              bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
          </div>
          <span style={{ fontSize: size.preW * 0.052, color: corSecundaria + "77", whiteSpace: "nowrap" }}>Escanear</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 3, left: pad,
        fontSize: size.preW * 0.048, color: corSecundaria + "44", whiteSpace: "nowrap" }}>
        courtesyfy.com · Válido até 31/12/2025
      </div>
    </div>
  )
}

function CardClassico(props: CardProps) {
  return isSquare(props.size) ? <CardClassicoSquare {...props} /> : <CardClassicoLandscape {...props} />
}

function CardModerno({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const topH = Math.round(size.preH * 0.40)
  const qrSz  = size.preH * 0.28
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: corFundo, fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", border: `1.5px solid ${corPrimaria}33`,
    }}>
      <div style={{ height: topH, background: `linear-gradient(135deg,${corPrimaria},${corPrimaria}bb)`,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
          height: "100%", objectFit: "cover", opacity: opacidade / 100,
          filter: imgFilter(b, s, c), mixBlendMode: "overlay" }} />}
        {img2
          ? <img src={img2} alt="" style={{ width: topH * 0.52, height: topH * 0.52,
              borderRadius: "50%", objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.8)", position: "relative", zIndex: 1 }} />
          : <div style={{ width: topH * 0.52, height: topH * 0.52, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: topH * 0.22, fontWeight: "bold",
              position: "relative", zIndex: 1 }}>{letters}</div>
        }
        <div style={{ position: "absolute", top: 6, left: 8, fontSize: topH * 0.17,
          fontWeight: "bold", color: "rgba(255,255,255,0.9)", zIndex: 1,
          whiteSpace: "nowrap", overflow: "hidden", maxWidth: "60%" }}>
          {nomeLoja || "Sua Loja"}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "row",
        alignItems: "center", padding: "6px 10px", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: size.preH * 0.065, fontWeight: "bold", color: corSecundaria,
            textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nomeCampanha || "Campanha"}
          </div>
          <div style={{ fontSize: size.preH * 0.13, fontWeight: "bold", color: corPrimaria, lineHeight: 1 }}>
            20% OFF
          </div>
          <code style={{ ...codeStyle(size, corTexto, corPrimaria), marginTop: 3 }}>
            XXXX-YYYY-ZZZZ-WWWW
          </code>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          gap: 2, flexShrink: 0 }}>
          <div style={{ border: `2px solid ${corPrimaria}`, borderRadius: 5, padding: 3, background: "#fff" }}>
            <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
              bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
          </div>
          <span style={{ fontSize: size.preH * 0.052, color: corSecundaria + "77", whiteSpace: "nowrap" }}>Escanear</span>
        </div>
      </div>
    </div>
  )
}

function CardMinimalista({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const logoSz = size.preH * 0.26
  const qrSz   = size.preH * 0.32
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: corFundo, fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column",
      border: `1px solid ${corTexto}22`, position: "relative",
    }}>
      {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
        height: "100%", objectFit: "cover", opacity: opacidade / 100,
        filter: imgFilter(b, s, c), pointerEvents: "none" }} />}
      <div style={{ height: 3, background: corPrimaria, flexShrink: 0, position: "relative", zIndex: 1 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center",
        padding: "8px 12px", gap: 10, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
          {img2
            ? <img src={img2} alt="" style={{ width: logoSz, height: logoSz,
                borderRadius: "50%", objectFit: "cover" }} />
            : <div style={{ width: logoSz, height: logoSz, borderRadius: "50%",
                background: corPrimaria + "22", display: "flex", alignItems: "center",
                justifyContent: "center", color: corPrimaria,
                fontSize: logoSz * 0.33, fontWeight: "bold" }}>{letters}</div>
          }
          <span style={{ fontSize: size.preH * 0.057, color: corSecundaria,
            fontWeight: 600, textAlign: "center", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {nomeLoja || "Loja"}
          </span>
        </div>
        <div style={{ width: 1, alignSelf: "stretch", margin: "4px 0",
          background: corTexto + "15", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: size.preH * 0.062, color: corSecundaria + "aa",
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nomeCampanha || "Campanha"}
          </div>
          <div style={{ fontSize: size.preH * 0.16, fontWeight: "300", color: corPrimaria,
            letterSpacing: -0.5, lineHeight: 1 }}>20% OFF</div>
          <code style={{ ...codeStyle(size, corTexto, corPrimaria), marginTop: 4, fontSize: size.preH * 0.062 }}>
            XXXX-YYYY-ZZZZ-WWWW
          </code>
        </div>
        <div style={{ flexShrink: 0, opacity: 0.85 }}>
          <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
            bgColor="transparent" fgColor={corTexto} level="M" marginSize={0} />
        </div>
      </div>
    </div>
  )
}

function CardGradiente({
  size, corPrimaria, corFundo, corTexto: _ct, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const logoSz = size.preH * 0.36
  const qrSz   = size.preH * 0.33
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: `linear-gradient(135deg,${corPrimaria} 0%,${corFundo} 100%)`,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "row", alignItems: "center",
      padding: "8px 12px", gap: 10, position: "relative",
    }}>
      {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
        height: "100%", objectFit: "cover", opacity: opacidade / 100,
        filter: imgFilter(b, s, c), mixBlendMode: "overlay", pointerEvents: "none" }} />}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 4, position: "relative", zIndex: 1 }}>
        {img2
          ? <img src={img2} alt="" style={{ width: logoSz, height: logoSz,
              borderRadius: "50%", objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.5)" }} />
          : <div style={{ width: logoSz, height: logoSz, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.32, fontWeight: "bold" }}>{letters}</div>
        }
        <span style={{ fontSize: size.preH * 0.068, color: "rgba(255,255,255,0.9)",
          fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>
          {nomeLoja || "Loja"}
        </span>
      </div>
      <div style={{ flex: 1, position: "relative", zIndex: 1, paddingLeft: 4, minWidth: 0 }}>
        <div style={{ fontSize: size.preH * 0.07, color: "rgba(255,255,255,0.75)",
          textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{ fontSize: size.preH * 0.17, fontWeight: "bold",
          color: "#fff", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
          20% OFF
        </div>
        <div style={{ marginTop: 6, background: "rgba(255,255,255,0.2)",
          borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
          <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.065,
            color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>
            XXXX-YYYY-ZZZZ-WWWW
          </code>
        </div>
      </div>
      <div style={{ flexShrink: 0, position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.9)", borderRadius: 6, padding: 4 }}>
        <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
          bgColor="transparent" fgColor="#111827" level="M" marginSize={0} />
      </div>
    </div>
  )
}

function CardNeon({
  size, corPrimaria, corFundo: _cf, corTexto: _ct, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const logoSz = size.preH * 0.30
  const qrSz   = size.preH * 0.32
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: "#0a0a0a", fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "row", alignItems: "center",
      padding: "6px 10px", gap: 8, position: "relative",
      border: `1.5px solid ${corPrimaria}`,
      boxShadow: `0 0 12px ${corPrimaria}55, inset 0 0 30px rgba(0,0,0,0.5)`,
    }}>
      {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
        height: "100%", objectFit: "cover", opacity: (opacidade / 100) * 0.5,
        filter: imgFilter(b, s, c), pointerEvents: "none" }} />}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,transparent,${corPrimaria},transparent)` }} />
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 3, position: "relative", zIndex: 1 }}>
        {img2
          ? <img src={img2} alt="" style={{ width: logoSz, height: logoSz,
              borderRadius: "50%", objectFit: "cover",
              border: `2px solid ${corPrimaria}`, boxShadow: `0 0 8px ${corPrimaria}66` }} />
          : <div style={{ width: logoSz, height: logoSz, borderRadius: "50%",
              background: corPrimaria + "22", border: `2px solid ${corPrimaria}`,
              boxShadow: `0 0 8px ${corPrimaria}55`, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: corPrimaria, fontSize: logoSz * 0.33, fontWeight: "bold" }}>{letters}</div>
        }
        <span style={{ fontSize: size.preH * 0.063, color: corPrimaria, fontWeight: 700,
          textAlign: "center", textShadow: `0 0 6px ${corPrimaria}`,
          whiteSpace: "nowrap" }}>{nomeLoja || "Loja"}</span>
      </div>
      <div style={{ flex: 1, position: "relative", zIndex: 1, paddingLeft: 6, minWidth: 0 }}>
        <div style={{ fontSize: size.preH * 0.063, color: "rgba(255,255,255,0.50)",
          textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{ fontSize: size.preH * 0.16, fontWeight: "bold",
          color: corPrimaria, lineHeight: 1, textShadow: `0 0 12px ${corPrimaria}` }}>
          20% OFF
        </div>
        <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.065,
          color: "rgba(255,255,255,0.75)", background: corPrimaria + "18",
          border: `1px solid ${corPrimaria}55`, borderRadius: 4,
          padding: "1px 5px", display: "inline-block", marginTop: 4,
          whiteSpace: "nowrap" }}>
          XXXX-YYYY-ZZZZ-WWWW
        </code>
      </div>
      <div style={{ flexShrink: 0, position: "relative", zIndex: 1,
        border: `1.5px solid ${corPrimaria}`, borderRadius: 6, padding: 3,
        background: "#fff", boxShadow: `0 0 10px ${corPrimaria}44` }}>
        <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
          bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ROUTER — exported
// ─────────────────────────────────────────────────────────────

function CardLimpo({
  size, corPrimaria, corFundo, img1, opacidade,
  brilho: b, saturacao: s, contraste: c, raioCantos: r,
  posicaoChave,
}: CardProps) {
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r,
      overflow: "hidden", background: corFundo, position: "relative",
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", filter: imgFilter(b, s, c),
        pointerEvents: "none",
      }} />}
      {posicaoChave && (
        <KeyOverlayRenderer
          codigo="XXXX-YYYY-ZZZZ-WWWW"
          posicao={posicaoChave}
          corPrimaria={corPrimaria}
          fontSize={size.preH * 0.082}
        />
      )}
    </div>
  )
}

export function CardRenderer(props: CardProps & { estilo: EstiloCard }) {
  if (props.modoLimpo) return <CardLimpo {...props} />
  // Overlay adicional em qualquer estilo
  const overlay = props.posicaoChave ? (
    <KeyOverlayRenderer
      codigo="XXXX-YYYY-ZZZZ-WWWW"
      posicao={props.posicaoChave}
      corPrimaria={props.corPrimaria}
      fontSize={props.size.preH * 0.072}
    />
  ) : null

  let card: React.ReactNode
  switch (props.estilo) {
    case "MODERNO":      card = <CardModerno {...props} />; break
    case "MINIMALISTA":  card = <CardMinimalista {...props} />; break
    case "GRADIENTE":    card = <CardGradiente {...props} />; break
    case "NEON":         card = <CardNeon {...props} />; break
    default:             card = <CardClassico {...props} />
  }

  if (!overlay) return <>{card}</>
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {card}
      {overlay}
    </div>
  )
}
