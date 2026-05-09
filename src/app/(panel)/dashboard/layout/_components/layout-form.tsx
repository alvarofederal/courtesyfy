"use client"

import { useActionState, useState, useTransition, useEffect } from "react"
import { useFormStatus } from "react-dom"
import {
  CheckCircle, Loader2, Upload, X, Star, LayoutGrid,
  Palette, ImageIcon, Sliders, Maximize2, Info, Printer,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { LayoutState } from "../_actions/layout-actions"

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

export type TamanhoCard = "MINI" | "CARTAO" | "PADRAO" | "COUPON" | "VOUCHER" | "MEIO_A4" | "MDF"
export type EstiloCard  = "CLASSICO" | "MODERNO" | "MINIMALISTA" | "GRADIENTE" | "NEON"

interface CardSize {
  label: string
  desc: string
  mmW: number
  mmH: number
  /** px width for the card preview render (design resolution) */
  preW: number
  /** px height for the card preview render (design resolution) */
  preH: number
  perFolha: number
  cols: number
  rows: number
}

const CARD_SIZES: Record<TamanhoCard, CardSize> = {
  MINI:    { label: "Mini",      desc: "63×38 mm · 21/folha",  mmW: 63,  mmH: 38,  preW: 210, preH: 127, perFolha: 21, cols: 3, rows: 7 },
  CARTAO:  { label: "Cartão",    desc: "70×35 mm · 16/folha",  mmW: 70,  mmH: 35,  preW: 280, preH: 140, perFolha: 16, cols: 2, rows: 8 },
  PADRAO:  { label: "Padrão",    desc: "85×55 mm · 10/folha",  mmW: 85,  mmH: 55,  preW: 280, preH: 181, perFolha: 10, cols: 2, rows: 5 },
  COUPON:  { label: "Cupom",     desc: "95×68 mm · 8/folha",   mmW: 95,  mmH: 68,  preW: 300, preH: 215, perFolha:  8, cols: 2, rows: 4 },
  VOUCHER: { label: "Voucher",   desc: "190×68 mm · 4/folha",  mmW: 190, mmH: 68,  preW: 380, preH: 136, perFolha:  4, cols: 1, rows: 4 },
  MEIO_A4: { label: "Meio A4",   desc: "190×138 mm · 2/folha", mmW: 190, mmH: 138, preW: 380, preH: 276, perFolha:  2, cols: 1, rows: 2 },
  MDF:     { label: "MDF",       desc: "90×90 mm · 6/folha",   mmW: 90,  mmH: 90,  preW: 288, preH: 288, perFolha:  6, cols: 2, rows: 3 },
}

const ESTILOS: Record<EstiloCard, { label: string; desc: string }> = {
  CLASSICO:    { label: "Clássico",    desc: "3 colunas: logo · info · QR" },
  MODERNO:     { label: "Moderno",     desc: "Barra superior + conteúdo" },
  MINIMALISTA: { label: "Minimalista", desc: "Limpo e elegante" },
  GRADIENTE:   { label: "Gradiente",   desc: "Fundo com degradê colorido" },
  NEON:        { label: "Neon",        desc: "Dark com borda iluminada" },
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function imgFilter(brilho: number, saturacao: number, contraste: number) {
  return `brightness(${brilho}%) saturate(${saturacao}%) contrast(${contraste}%)`
}

function ini(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "AB"
}

function isSquare(size: CardSize) {
  return Math.abs(size.mmW / size.mmH - 1) < 0.25
}

// ─────────────────────────────────────────────────────────────
// CARD RENDERERS
// ─────────────────────────────────────────────────────────────

interface CardProps {
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
}

// ── Clássico landscape ─────────────────────────────────────
function CardClassicoLandscape({ size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha }: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  return (
    <div style={{
      width: size.preW, height: size.preH,
      border: `1.5px solid ${corPrimaria}55`, borderRadius: r,
      display: "flex", flexDirection: "row", alignItems: "center",
      gap: 0, padding: `6px 10px 6px 14px`,
      background: corFundo, position: "relative", overflow: "hidden",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
        height: "100%", objectFit: "cover", opacity: opacidade / 100,
        pointerEvents: "none", filter: imgFilter(b, s, c) }} />}

      {/* accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%",
        background: `linear-gradient(180deg,${corPrimaria},${corPrimaria}88)`,
        borderRadius: `${r}px 0 0 ${r}px` }} />

      {/* logo col */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minWidth: size.preW * 0.22, paddingLeft: 4, position: "relative", zIndex: 1 }}>
        {img2
          ? <img src={img2} alt="" style={{ width: size.preH * 0.3, height: size.preH * 0.3,
              borderRadius: "50%", objectFit: "cover", border: `2px solid ${corPrimaria}`, marginBottom: 3 }} />
          : <div style={{ width: size.preH * 0.3, height: size.preH * 0.3, borderRadius: "50%",
              background: `linear-gradient(135deg,${corPrimaria}cc,${corPrimaria})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: size.preH * 0.09, fontWeight: "bold",
              marginBottom: 3, border: `2px solid ${corPrimaria}` }}>{letters}</div>
        }
        <span style={{ fontSize: size.preH * 0.065, color: corPrimaria, fontWeight: "bold",
          textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center", lineHeight: 1.2 }}>
          {nomeLoja || "Sua Loja"}
        </span>
      </div>

      {/* info col */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 2, paddingLeft: 8, overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: size.preH * 0.065, fontWeight: "bold", color: corSecundaria,
          textTransform: "uppercase", letterSpacing: 0.5 }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{ fontSize: size.preH * 0.14, fontWeight: "bold", color: corPrimaria, lineHeight: 1 }}>
          20% OFF
        </div>
        <div style={{ fontSize: size.preH * 0.065, color: corSecundaria + "99" }}>Desconto exclusivo</div>
        <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.075, fontWeight: "bold",
          color: corTexto, background: corPrimaria + "15", border: `1px solid ${corPrimaria}55`,
          borderRadius: 3, padding: "1px 5px", marginTop: 2, display: "inline-block" }}>
          XXXX-YYYY-ZZZZ
        </code>
        <div style={{ fontSize: size.preH * 0.055, color: corSecundaria + "66" }}>Válido até 31/12/2025</div>
      </div>

      {/* QR col */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 3, minWidth: size.preH * 0.55, position: "relative", zIndex: 1 }}>
        <div style={{ border: `1.5px solid ${corPrimaria}`, borderRadius: 4, padding: 3, background: "#fff" }}>
          <QRCodeSVG value="https://courtesyfy.com" size={size.preH * 0.38}
            bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
        </div>
        <span style={{ fontSize: size.preH * 0.055, color: corSecundaria + "88",
          textAlign: "center", lineHeight: 1.3 }}>Escaneie e ative</span>
      </div>

      <div style={{ position: "absolute", bottom: 3, right: 8,
        fontSize: size.preH * 0.05, color: corSecundaria + "44", letterSpacing: 0.4 }}>
        courtesyfy.com
      </div>
    </div>
  )
}

// ── Clássico quadrado (MDF 90×90) ─────────────────────────
function CardClassicoSquare({ size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha }: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const pad = size.preW * 0.06
  const logoSize = size.preW * 0.22
  const qrSize = size.preW * 0.28
  return (
    <div style={{
      width: size.preW, height: size.preH,
      borderRadius: r, overflow: "hidden",
      background: corFundo, position: "relative",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column",
      border: `1.5px solid ${corPrimaria}55`,
    }}>
      {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
        height: "100%", objectFit: "cover", opacity: opacidade / 100,
        pointerEvents: "none", filter: imgFilter(b, s, c) }} />}

      {/* top accent bar */}
      <div style={{ height: 5, background: corPrimaria, flexShrink: 0, position: "relative", zIndex: 1 }} />

      {/* top row: logo + store name + campaign */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${pad * 0.6}px ${pad}px ${pad * 0.4}px`, gap: pad * 0.7,
        position: "relative", zIndex: 1 }}>
        {img2
          ? <img src={img2} alt="" style={{ width: logoSize, height: logoSize, borderRadius: "50%",
              objectFit: "cover", border: `2px solid ${corPrimaria}`, flexShrink: 0 }} />
          : <div style={{ width: logoSize, height: logoSize, borderRadius: "50%",
              background: `linear-gradient(135deg,${corPrimaria}cc,${corPrimaria})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSize * 0.35, fontWeight: "bold",
              border: `2px solid ${corPrimaria}`, flexShrink: 0 }}>{letters}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: size.preW * 0.07, fontWeight: "bold", color: corPrimaria,
            textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.1 }}>
            {nomeLoja || "Sua Loja"}
          </div>
          <div style={{ fontSize: size.preW * 0.065, color: corSecundaria,
            textTransform: "uppercase", letterSpacing: 0.3, marginTop: 1 }}>
            {nomeCampanha || "Campanha"}
          </div>
        </div>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: corPrimaria + "30", margin: `0 ${pad}px`,
        position: "relative", zIndex: 1 }} />

      {/* center: discount + code */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${pad * 0.6}px ${pad}px`, gap: pad, position: "relative", zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: size.preW * 0.18, fontWeight: "bold", color: corPrimaria, lineHeight: 1 }}>
            20% OFF
          </div>
          <div style={{ fontSize: size.preW * 0.065, color: corSecundaria + "99", marginTop: 2 }}>
            Desconto exclusivo
          </div>
          <code style={{ fontFamily: "monospace", fontSize: size.preW * 0.07,
            color: corTexto, background: corPrimaria + "15",
            border: `1px solid ${corPrimaria}55`, borderRadius: 3,
            padding: "1px 5px", display: "inline-block", marginTop: 5 }}>
            XXXX-YYYY
          </code>
        </div>

        {/* QR */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3 }}>
          <div style={{ border: `1.5px solid ${corPrimaria}`, borderRadius: 4, padding: 3, background: "#fff" }}>
            <QRCodeSVG value="https://courtesyfy.com" size={qrSize}
              bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
          </div>
          <span style={{ fontSize: size.preW * 0.055, color: corSecundaria + "77" }}>Escanear</span>
        </div>
      </div>

      {/* bottom watermark */}
      <div style={{ position: "absolute", bottom: 4, left: pad,
        fontSize: size.preW * 0.05, color: corSecundaria + "44" }}>
        courtesyfy.com · Válido até 31/12/2025
      </div>
    </div>
  )
}

function CardClassico(props: CardProps) {
  return isSquare(props.size)
    ? <CardClassicoSquare {...props} />
    : <CardClassicoLandscape {...props} />
}

// ── Moderno ───────────────────────────────────────────────────
function CardModerno({ size, corPrimaria, corFundo, corTexto: _ct, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha }: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  const topH = Math.round(size.preH * (isSquare(size) ? 0.42 : 0.38))
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: corFundo, fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", border: `1.5px solid ${corPrimaria}33`,
    }}>
      {/* Top band */}
      <div style={{ height: topH, background: `linear-gradient(135deg,${corPrimaria},${corPrimaria}bb)`,
        position: "relative", overflow: "hidden", display: "flex",
        alignItems: "center", justifyContent: "center" }}>
        {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
          height: "100%", objectFit: "cover", opacity: opacidade / 100,
          filter: imgFilter(b, s, c), mixBlendMode: "overlay" }} />}
        {img2
          ? <img src={img2} alt="" style={{ width: topH * 0.55, height: topH * 0.55,
              borderRadius: "50%", objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.8)", position: "relative", zIndex: 1 }} />
          : <div style={{ width: topH * 0.55, height: topH * 0.55, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: topH * 0.22, fontWeight: "bold", position: "relative", zIndex: 1 }}>
              {letters}
            </div>
        }
        <div style={{ position: "absolute", top: 6, left: 8, fontSize: topH * 0.18,
          fontWeight: "bold", color: "rgba(255,255,255,0.9)", zIndex: 1 }}>
          {nomeLoja || "Sua Loja"}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row",
        alignItems: "center", padding: "6px 10px", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: size.preH * 0.07, fontWeight: "bold", color: corSecundaria,
            textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>
            {nomeCampanha || "Campanha"}
          </div>
          <div style={{ fontSize: size.preH * 0.13, fontWeight: "bold", color: corPrimaria, lineHeight: 1 }}>
            20% OFF
          </div>
          <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.07, color: corPrimaria,
            background: corPrimaria + "14", border: `1px solid ${corPrimaria}44`,
            borderRadius: 4, padding: "1px 5px", display: "inline-block", marginTop: 3 }}>
            XXXX-YYYY-ZZZZ
          </code>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <div style={{ border: `2px solid ${corPrimaria}`, borderRadius: 5, padding: 3, background: "#fff" }}>
            <QRCodeSVG value="https://courtesyfy.com" size={size.preH * 0.3}
              bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
          </div>
          <span style={{ fontSize: size.preH * 0.055, color: corSecundaria + "77" }}>Escanear</span>
        </div>
      </div>
    </div>
  )
}

// ── Minimalista ───────────────────────────────────────────────
function CardMinimalista({ size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha }: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: corFundo, fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", border: `1px solid ${corTexto}22`,
      position: "relative",
    }}>
      {img1 && <img src={img1} alt="" style={{ position: "absolute", inset: 0, width: "100%",
        height: "100%", objectFit: "cover", opacity: opacidade / 100,
        filter: imgFilter(b, s, c), pointerEvents: "none" }} />}
      <div style={{ height: 3, background: corPrimaria, flexShrink: 0, position: "relative", zIndex: 1 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center",
        padding: "8px 12px", gap: 10, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, flexShrink: 0 }}>
          {img2
            ? <img src={img2} alt="" style={{ width: size.preH * 0.28, height: size.preH * 0.28,
                borderRadius: "50%", objectFit: "cover" }} />
            : <div style={{ width: size.preH * 0.28, height: size.preH * 0.28, borderRadius: "50%",
                background: corPrimaria + "22", display: "flex", alignItems: "center",
                justifyContent: "center", color: corPrimaria,
                fontSize: size.preH * 0.09, fontWeight: "bold" }}>{letters}</div>
          }
          <span style={{ fontSize: size.preH * 0.06, color: corSecundaria,
            fontWeight: 600, textAlign: "center", lineHeight: 1.1 }}>
            {nomeLoja || "Loja"}
          </span>
        </div>
        <div style={{ width: 1, height: "70%", background: corTexto + "15", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: size.preH * 0.065, color: corSecundaria + "aa",
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>
            {nomeCampanha || "Campanha"}
          </div>
          <div style={{ fontSize: size.preH * 0.17, fontWeight: "300", color: corPrimaria,
            letterSpacing: -0.5, lineHeight: 1 }}>
            20% OFF
          </div>
          <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.065,
            color: corTexto + "cc", display: "block", marginTop: 4 }}>
            XXXX-YYYY-ZZZZ
          </code>
        </div>
        <div style={{ flexShrink: 0, opacity: 0.85 }}>
          <QRCodeSVG value="https://courtesyfy.com" size={size.preH * 0.35}
            bgColor="transparent" fgColor={corTexto} level="M" marginSize={0} />
        </div>
      </div>
    </div>
  )
}

// ── Gradiente ─────────────────────────────────────────────────
function CardGradiente({ size, corPrimaria, corFundo, corTexto: _ct, corSecundaria: _cs,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha }: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
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
          ? <img src={img2} alt="" style={{ width: size.preH * 0.38, height: size.preH * 0.38,
              borderRadius: "50%", objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.5)" }} />
          : <div style={{ width: size.preH * 0.38, height: size.preH * 0.38, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: size.preH * 0.12, fontWeight: "bold" }}>{letters}</div>
        }
        <span style={{ fontSize: size.preH * 0.07, color: "rgba(255,255,255,0.9)",
          fontWeight: 600, textAlign: "center" }}>
          {nomeLoja || "Loja"}
        </span>
      </div>
      <div style={{ flex: 1, position: "relative", zIndex: 1, paddingLeft: 4 }}>
        <div style={{ fontSize: size.preH * 0.075, color: "rgba(255,255,255,0.75)",
          textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{ fontSize: size.preH * 0.18, fontWeight: "bold",
          color: "#fff", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
          20% OFF
        </div>
        <div style={{ marginTop: 6, background: "rgba(255,255,255,0.2)",
          borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
          <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.07,
            color: "#fff", fontWeight: "bold" }}>XXXX-YYYY-ZZZZ</code>
        </div>
      </div>
      <div style={{ flexShrink: 0, position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.9)", borderRadius: 6, padding: 4 }}>
        <QRCodeSVG value="https://courtesyfy.com" size={size.preH * 0.36}
          bgColor="transparent" fgColor="#111827" level="M" marginSize={0} />
      </div>
    </div>
  )
}

// ── Neon ──────────────────────────────────────────────────────
function CardNeon({ size, corPrimaria, corFundo: _cf, corTexto: _ct, corSecundaria: _cs,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha }: CardProps) {
  const letters = ini(nomeLoja)
  const r = raioCantos
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
          ? <img src={img2} alt="" style={{ width: size.preH * 0.32, height: size.preH * 0.32,
              borderRadius: "50%", objectFit: "cover",
              border: `2px solid ${corPrimaria}`, boxShadow: `0 0 8px ${corPrimaria}66` }} />
          : <div style={{ width: size.preH * 0.32, height: size.preH * 0.32, borderRadius: "50%",
              background: corPrimaria + "22", border: `2px solid ${corPrimaria}`,
              boxShadow: `0 0 8px ${corPrimaria}55`, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: corPrimaria, fontSize: size.preH * 0.1, fontWeight: "bold" }}>{letters}</div>
        }
        <span style={{ fontSize: size.preH * 0.065, color: corPrimaria, fontWeight: 700,
          textAlign: "center", textShadow: `0 0 6px ${corPrimaria}` }}>
          {nomeLoja || "Loja"}
        </span>
      </div>
      <div style={{ flex: 1, position: "relative", zIndex: 1, paddingLeft: 6 }}>
        <div style={{ fontSize: size.preH * 0.065, color: "rgba(255,255,255,0.50)",
          textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{ fontSize: size.preH * 0.17, fontWeight: "bold",
          color: corPrimaria, lineHeight: 1, textShadow: `0 0 12px ${corPrimaria}` }}>
          20% OFF
        </div>
        <code style={{ fontFamily: "monospace", fontSize: size.preH * 0.07,
          color: "rgba(255,255,255,0.7)", background: corPrimaria + "18",
          border: `1px solid ${corPrimaria}55`, borderRadius: 4,
          padding: "1px 5px", display: "inline-block", marginTop: 4 }}>
          XXXX-YYYY-ZZZZ
        </code>
      </div>
      <div style={{ flexShrink: 0, position: "relative", zIndex: 1,
        border: `1.5px solid ${corPrimaria}`, borderRadius: 6, padding: 3,
        background: "#fff", boxShadow: `0 0 10px ${corPrimaria}44` }}>
        <QRCodeSVG value="https://courtesyfy.com" size={size.preH * 0.36}
          bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
      </div>
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────
function CardRenderer(props: CardProps & { estilo: EstiloCard }) {
  switch (props.estilo) {
    case "MODERNO":     return <CardModerno {...props} />
    case "MINIMALISTA": return <CardMinimalista {...props} />
    case "GRADIENTE":   return <CardGradiente {...props} />
    case "NEON":        return <CardNeon {...props} />
    default:            return <CardClassico {...props} />
  }
}

// ─────────────────────────────────────────────────────────────
// A4 FULL-SCREEN PRINT MODAL
// ─────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void
  tamanho: TamanhoCard
  estilo: EstiloCard
  cardProps: CardProps
}

function A4PrintModal({ onClose, tamanho, estilo, cardProps }: ModalProps) {
  const def = CARD_SIZES[tamanho]

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // A4 at 680px wide — big enough to see detail
  const a4W = 680
  const a4H = Math.round(a4W * 297 / 210)
  const mmToPx = a4W / 210
  const marginPx = Math.round(5 * mmToPx)
  const gapPx = Math.round(2 * mmToPx)

  const availW = a4W - marginPx * 2
  const cardW  = Math.round((availW - gapPx * (def.cols - 1)) / def.cols)
  const cardH  = Math.round(cardW * def.mmH / def.mmW)
  const scale  = cardW / def.preW

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="my-6 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1a1a1a", maxWidth: a4W + 64 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Preview de Impressão — {def.label}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {def.mmW}×{def.mmH} mm · {def.perFolha} cards · {def.cols} col{def.cols > 1 ? "unas" : "una"} × {def.rows} linhas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(16,185,129,0.15)", color: "#34d399",
                border: "1px solid rgba(16,185,129,0.30)" }}>
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button type="button" onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.50)" }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheet */}
        <div className="p-8" style={{ background: "#111" }}>
          {/* A4 paper */}
          <div style={{
            width: a4W,
            height: a4H,
            background: "#ffffff",
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
            padding: marginPx,
            display: "grid",
            gridTemplateColumns: `repeat(${def.cols}, ${cardW}px)`,
            gap: gapPx,
            alignContent: "start",
          }}>
            {Array.from({ length: def.perFolha }).map((_, i) => (
              <div key={i} style={{
                width: cardW, height: cardH,
                overflow: "hidden", position: "relative", flexShrink: 0,
              }}>
                <div style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  position: "absolute", top: 0, left: 0,
                }}>
                  <CardRenderer {...cardProps} estilo={estilo} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
            Clique fora para fechar · Escala: {Math.round(scale * 100)}%
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
            Papel A4 · 5mm margem · 2mm espaçamento
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MINI A4 SHEET PREVIEW (sidebar)
// ─────────────────────────────────────────────────────────────

interface SheetPreviewProps extends CardProps {
  estilo: EstiloCard
  tamanho: TamanhoCard
  onOpenModal: () => void
}

function SheetPreview({ onOpenModal, tamanho, estilo, ...cardProps }: SheetPreviewProps) {
  const def  = CARD_SIZES[tamanho]
  const canvasW  = 210
  const canvasH  = Math.round(canvasW * (297 / 210))
  const marginPx = Math.round(canvasW * (5 / 210))
  const gapPx    = Math.round(canvasW * (2 / 210))
  const cardW    = Math.round((canvasW - marginPx * 2 - gapPx * (def.cols - 1)) / def.cols)
  const cardH    = Math.round(cardW * (def.mmH / def.mmW))
  const scale    = cardW / def.preW

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onOpenModal}
        className="relative group cursor-pointer"
        title="Clique para abrir preview completo"
      >
        {/* A4 paper */}
        <div style={{
          width: canvasW, height: canvasH,
          background: "#fff",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          padding: marginPx,
          display: "grid",
          gridTemplateColumns: `repeat(${def.cols}, ${cardW}px)`,
          gap: gapPx,
          alignContent: "start",
          overflow: "hidden",
        }}>
          {Array.from({ length: def.perFolha }).map((_, i) => (
            <div key={i} style={{
              width: cardW, height: cardH,
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "absolute",
                pointerEvents: "none",
              }}>
                <CardRenderer {...cardProps} estilo={estilo} />
              </div>
            </div>
          ))}
        </div>

        {/* hover overlay */}
        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity
          flex flex-col items-center justify-center gap-2"
          style={{ background: "rgba(0,0,0,0.55)" }}>
          <Maximize2 className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">Ver impressão completa</span>
        </div>
      </button>

      <p className="text-xs dash-muted text-center mt-2">
        {def.perFolha} cards · {def.cols}×{def.rows} · clique para ampliar
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SMALL UTILITIES
// ─────────────────────────────────────────────────────────────

function useImageUpload(initial: string | null) {
  const [url, setUrl]             = useState(initial ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState("")

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
      const { imageUrl } = await res.json()
      setUrl(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload")
    } finally {
      setUploading(false)
    }
  }

  return { url, setUrl, uploading, error, handleFile }
}

function ColorPicker({ label, name, value, onChange }: {
  label: string; name: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium dash-muted mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 dark:border-white/10 p-0.5 flex-shrink-0" />
        <input name={name} type="text" value={value} onChange={e => onChange(e.target.value)}
          className="dash-input font-mono w-28 !py-1.5 !px-3 !text-xs" />
        <div className="flex-1 h-9 rounded-xl border border-gray-100 dark:border-white/5"
          style={{ backgroundColor: value }} />
      </div>
    </div>
  )
}

function SliderField({ label, name, value, min, max, step = 1, unit = "%", onChange }: {
  label: string; name: string; value: number; min: number; max: number;
  step?: number; unit?: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium dash-muted">{label}</label>
        <span className="text-xs font-mono dash-title">{value}{unit}</span>
      </div>
      <input type="range" name={name} min={min} max={max} step={step}
        value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500" />
      <div className="flex justify-between text-xs dash-muted mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

function ImageField({ label, hint, fieldName, hook }: {
  label: string; hint: string; fieldName: string; hook: ReturnType<typeof useImageUpload>
}) {
  return (
    <div>
      <p className="text-sm font-medium dash-subtitle mb-0.5">{label}</p>
      <p className="text-xs dash-muted mb-2">{hint}</p>
      <input type="hidden" name={fieldName} value={hook.url} />
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer dash-card border text-xs font-medium
          px-3 py-2 rounded-xl transition-colors hover:border-emerald-400">
          {hook.uploading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Upload className="w-3.5 h-3.5" />}
          <span className="dash-subtitle">{hook.uploading ? "Enviando…" : "Escolher"}</span>
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={hook.handleFile} disabled={hook.uploading} className="hidden" />
        </label>
        {hook.url && (
          <div className="relative">
            <img src={hook.url} alt="preview"
              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-white/10" />
            <button type="button" onClick={() => hook.setUrl("")}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        )}
      </div>
      {hook.error && <p className="text-red-500 text-xs mt-1">{hook.error}</p>}
    </div>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="inline-flex items-center gap-2 dash-btn-primary disabled:opacity-50 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? "Salvando…" : "Salvar layout"}
    </button>
  )
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode
}) {
  return (
    <div className="dash-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-500" />
        <h2 className="text-sm font-semibold dash-title">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export interface LayoutData {
  id?: string
  nome: string
  corPrimaria: string
  corFundo: string
  corTexto: string
  corSecundaria: string
  imagem1Url: string | null
  imagem2Url: string | null
  imagem3Url: string | null
  opacidadeFundo: number
  brilho: number
  saturacao: number
  contraste: number
  tamanhoCard: TamanhoCard
  estiloCard: EstiloCard
  raioCantos: number
  padrao: boolean
}

interface Props {
  action: (prev: LayoutState, fd: FormData) => Promise<LayoutState>
  initial?: LayoutData
  nomeLoja: string
}

export function LayoutForm({ action, initial, nomeLoja }: Props) {
  const [state, formAction] = useActionState<LayoutState, FormData>(action, {})
  const [, startTransition] = useTransition()

  const [tamanho, setTamanho]     = useState<TamanhoCard>(initial?.tamanhoCard ?? "PADRAO")
  const [estilo, setEstilo]       = useState<EstiloCard>(initial?.estiloCard ?? "CLASSICO")
  const [corPrimaria, setCorPri]  = useState(initial?.corPrimaria ?? "#c8a96e")
  const [corFundo, setCorFundo]   = useState(initial?.corFundo ?? "#fffdf7")
  const [corTexto, setCorTexto]   = useState(initial?.corTexto ?? "#3a2510")
  const [corSec, setCorSec]       = useState(initial?.corSecundaria ?? "#5a3e28")
  const [opacidade, setOpacidade] = useState(initial?.opacidadeFundo ?? 20)
  const [brilho, setBrilho]       = useState(initial?.brilho ?? 100)
  const [saturacao, setSaturacao] = useState(initial?.saturacao ?? 100)
  const [contraste, setContraste] = useState(initial?.contraste ?? 100)
  const [raioCantos, setRaio]     = useState(initial?.raioCantos ?? 8)
  const [nomeCampanha, setNomeCampanha] = useState("Campanha Exemplo")
  const [previewTab, setPreviewTab] = useState<"card" | "folha">("card")
  const [showModal, setShowModal]   = useState(false)

  const img1 = useImageUpload(initial?.imagem1Url ?? null)
  const img2 = useImageUpload(initial?.imagem2Url ?? null)
  const img3 = useImageUpload(initial?.imagem3Url ?? null)

  const sizeInfo  = CARD_SIZES[tamanho]
  const cardProps: CardProps = {
    size: sizeInfo, corPrimaria, corFundo, corTexto,
    corSecundaria: corSec, img1: img1.url, img2: img2.url,
    opacidade, brilho, saturacao, contraste, raioCantos,
    nomeLoja, nomeCampanha,
  }

  return (
    <>
      {showModal && (
        <A4PrintModal
          onClose={() => setShowModal(false)}
          tamanho={tamanho}
          estilo={estilo}
          cardProps={cardProps}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_370px] gap-8">
        {/* ─── LEFT: Form ─── */}
        <form action={(fd) => startTransition(() => formAction(fd))} className="space-y-5">
          {initial?.id && <input type="hidden" name="id" value={initial.id} />}
          <input type="hidden" name="tamanhoCard"  value={tamanho} />
          <input type="hidden" name="estiloCard"   value={estilo} />
          <input type="hidden" name="imagem1Url"   value={img1.url} />
          <input type="hidden" name="imagem2Url"   value={img2.url} />
          <input type="hidden" name="imagem3Url"   value={img3.url} />

          {state.success && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200
              dark:border-emerald-500/30 rounded-xl p-4 flex items-center gap-2
              text-emerald-700 dark:text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Layout salvo com sucesso.
            </div>
          )}
          {state.error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200
              dark:border-red-500/30 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}

          {/* 1. Identificação */}
          <Section icon={Info} title="Identificação">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium dash-subtitle mb-1.5">
                  Nome do layout <span className="text-red-500">*</span>
                </label>
                <input name="nome" defaultValue={initial?.nome ?? ""}
                  placeholder="Ex: Layout Natal 2025" className="dash-input" />
                {state.fieldErrors?.nome && (
                  <p className="text-red-500 text-xs mt-1">{state.fieldErrors.nome[0]}</p>
                )}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="padrao" defaultChecked={initial?.padrao ?? false}
                    className="w-4 h-4 rounded accent-emerald-500" />
                  <span className="text-sm dash-subtitle font-medium flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    Layout padrão da loja
                  </span>
                </label>
              </div>
            </div>
          </Section>

          {/* 2. Tamanho */}
          <Section icon={Maximize2} title="Tamanho do Card">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {(Object.entries(CARD_SIZES) as [TamanhoCard, CardSize][]).map(([key, def]) => (
                <button key={key} type="button" onClick={() => setTamanho(key)}
                  className={`text-left p-3 rounded-xl border transition-all text-sm ${
                    tamanho === key
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : "dash-card border hover:border-emerald-300 dark:hover:border-emerald-500/40"
                  }`}>
                  <div className={`font-semibold mb-0.5 ${
                    tamanho === key ? "text-emerald-600 dark:text-emerald-400" : "dash-title"}`}>
                    {def.label}
                  </div>
                  <div className="text-xs dash-muted">{def.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs dash-muted pt-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Cards otimizados para A4 sem desperdício. Veja a prévia da folha no painel ao lado.</span>
            </div>
          </Section>

          {/* 3. Estilo */}
          <Section icon={LayoutGrid} title="Estilo Visual">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(ESTILOS) as [EstiloCard, { label: string; desc: string }][]).map(([key, def]) => (
                <button key={key} type="button" onClick={() => setEstilo(key)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    estilo === key
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : "dash-card border hover:border-emerald-300 dark:hover:border-emerald-500/40"
                  }`}>
                  <div className={`font-semibold text-sm mb-0.5 ${
                    estilo === key ? "text-emerald-600 dark:text-emerald-400" : "dash-title"}`}>
                    {def.label}
                  </div>
                  <div className="text-xs dash-muted">{def.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* 4. Cores */}
          <Section icon={Palette} title="Paleta de Cores">
            <div className="grid sm:grid-cols-2 gap-4">
              <ColorPicker label="Cor de Destaque / Marca"   name="corPrimaria"   value={corPrimaria} onChange={setCorPri} />
              <ColorPicker label="Cor de Fundo do Card"       name="corFundo"      value={corFundo}   onChange={setCorFundo} />
              <ColorPicker label="Cor do Texto Principal"     name="corTexto"      value={corTexto}   onChange={setCorTexto} />
              <ColorPicker label="Cor do Texto Secundário"    name="corSecundaria" value={corSec}     onChange={setCorSec} />
            </div>
            <SliderField label="Arredondamento dos cantos" name="raioCantos"
              value={raioCantos} min={0} max={24} unit="px" onChange={setRaio} />
          </Section>

          {/* 5. Imagens */}
          <Section icon={ImageIcon} title="Imagens">
            <ImageField label="Imagem de fundo"
              hint="Aparece atrás do conteúdo com a opacidade configurada abaixo."
              fieldName="imagem1Url" hook={img1} />
            {img1.url
              ? <SliderField label="Opacidade da imagem de fundo" name="opacidadeFundo"
                  value={opacidade} min={5} max={60} step={5} onChange={setOpacidade} />
              : <input type="hidden" name="opacidadeFundo" value={opacidade} />
            }
            <div className="border-t border-gray-100 dark:border-white/5 pt-4">
              <ImageField label="Logo personalizada"
                hint="Substitui o círculo de iniciais. Use PNG com fundo transparente."
                fieldName="imagem2Url" hook={img2} />
            </div>
            <div className="border-t border-gray-100 dark:border-white/5 pt-4">
              <ImageField label="Imagem extra"
                hint="Elemento decorativo adicional."
                fieldName="imagem3Url" hook={img3} />
            </div>
          </Section>

          {/* 6. Filtros */}
          <Section icon={Sliders} title="Filtros de Imagem">
            <p className="text-xs dash-muted -mt-2">
              Ajustes aplicados sobre a imagem de fundo.
            </p>
            <SliderField label="Brilho"    name="brilho"    value={brilho}    min={0}  max={200} onChange={setBrilho} />
            <SliderField label="Saturação" name="saturacao" value={saturacao} min={0}  max={200} onChange={setSaturacao} />
            <SliderField label="Contraste" name="contraste" value={contraste} min={50} max={200} onChange={setContraste} />
          </Section>

          <div className="flex justify-end">
            <SaveButton />
          </div>
        </form>

        {/* ─── RIGHT: Live Preview ─── */}
        <div className="xl:sticky xl:top-6 space-y-4 self-start">
          <div className="dash-card p-5">

            {/* Tab selector */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 flex-1">
                {(["card", "folha"] as const).map(tab => (
                  <button key={tab} type="button"
                    onClick={() => setPreviewTab(tab)}
                    className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-lg transition-all ${
                      previewTab === tab
                        ? "bg-white dark:bg-white/10 dash-title shadow-sm"
                        : "dash-muted"
                    }`}>
                    {tab === "card" ? "Card" : "Folha A4"}
                  </button>
                ))}
              </div>
              <span className="text-xs dash-muted bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg whitespace-nowrap">
                {sizeInfo.label}
              </span>
            </div>

            {/* Campaign name (preview only) */}
            <div className="mb-4">
              <input type="text" value={nomeCampanha}
                onChange={e => setNomeCampanha(e.target.value)}
                placeholder="Nome da campanha (preview)"
                className="dash-input !text-xs !py-1.5" />
            </div>

            {/* Card preview */}
            {previewTab === "card" && (
              <div className="overflow-x-auto">
                <div className="inline-block">
                  <CardRenderer {...cardProps} estilo={estilo} />
                </div>
                <p className="text-xs dash-muted mt-2 text-center">
                  {sizeInfo.mmW}×{sizeInfo.mmH} mm · {sizeInfo.perFolha}/folha A4
                </p>
              </div>
            )}

            {/* Sheet preview */}
            {previewTab === "folha" && (
              <div className="flex justify-center">
                <SheetPreview
                  {...cardProps}
                  estilo={estilo}
                  tamanho={tamanho}
                  onOpenModal={() => setShowModal(true)}
                />
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="dash-card p-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold dash-title">{sizeInfo.perFolha}</div>
              <div className="text-xs dash-muted">cards / folha</div>
            </div>
            <div>
              <div className="text-lg font-bold dash-title">{sizeInfo.mmW}×{sizeInfo.mmH}</div>
              <div className="text-xs dash-muted">milímetros</div>
            </div>
            <div>
              <div className="text-lg font-bold dash-title">{sizeInfo.cols}×{sizeInfo.rows}</div>
              <div className="text-xs dash-muted">cols × linhas</div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => { setPreviewTab("folha"); setShowModal(true) }}
                className="flex flex-col items-center gap-0.5 w-full"
              >
                <div className="text-lg font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
                  Ver impressão
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
