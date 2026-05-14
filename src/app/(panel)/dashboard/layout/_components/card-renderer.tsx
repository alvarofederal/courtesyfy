"use client"

import { QRCodeSVG } from "qrcode.react"

// ─────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────

export type TamanhoCard  = "MINI" | "CARTAO" | "PADRAO" | "COUPON" | "VOUCHER" | "MEIO_A4" | "MDF"
export type EstiloCard   = "CLASSICO" | "MODERNO" | "MINIMALISTA" | "GRADIENTE" | "NEON"
/** null = chave não posicionada | {x, y} = posição em % da área do card */
export type PosicaoChave = { x: number; y: number } | null

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

// preW/preH = dimensão interna de renderização (alta resolução)
// A escala de exibição é calculada: scale = containerPx / preW
export const CARD_SIZES: Record<TamanhoCard, CardSize> = {
  MINI:    { label: "Mini",    desc: "63×38 mm · 21/folha",  mmW:  63, mmH:  38, preW:  504, preH:  304, perFolha: 21, cols: 3, rows: 7 },
  CARTAO:  { label: "Cartão",  desc: "70×35 mm · 14/folha",  mmW:  70, mmH:  35, preW:  560, preH:  280, perFolha: 14, cols: 2, rows: 7 },
  PADRAO:  { label: "Padrão",  desc: "85×55 mm · 10/folha",  mmW:  85, mmH:  55, preW:  680, preH:  440, perFolha: 10, cols: 2, rows: 5 },
  COUPON:  { label: "Cupom",   desc: "95×68 mm · 8/folha",   mmW:  95, mmH:  68, preW:  760, preH:  544, perFolha:  8, cols: 2, rows: 4 },
  VOUCHER: { label: "Voucher", desc: "190×68 mm · 4/folha",  mmW: 190, mmH:  68, preW: 1140, preH:  408, perFolha:  4, cols: 1, rows: 4 },
  MEIO_A4: { label: "Meio A4", desc: "190×138 mm · 2/folha", mmW: 190, mmH: 138, preW: 1140, preH:  828, perFolha:  2, cols: 1, rows: 2 },
  MDF:     { label: "MDF",     desc: "90×90 mm · 6/folha",   mmW:  90, mmH:  90, preW:  720, preH:  720, perFolha:  6, cols: 2, rows: 3 },
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

export function ini(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "AB"
}

export function isSquare(size: CardSize) {
  return Math.abs(size.mmW / size.mmH - 1) < 0.15
}

// ─────────────────────────────────────────────────────────────
// KEY BADGE — overlay de chave posicionável (estático, sem drag)
// O drag é gerenciado fora deste componente (print-grid / layout-form)
// ─────────────────────────────────────────────────────────────

export function KeyBadge({
  posicao, size, corPrimaria, corTexto,
}: {
  posicao: { x: number; y: number }
  size: CardSize
  corPrimaria: string
  corTexto: string
}) {
  const fs = size.preH * 0.065
  return (
    <div style={{
      position: "absolute",
      left: `${posicao.x}%`,
      top: `${posicao.y}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 20,
      background: "rgba(255,255,255,0.94)",
      borderRadius: Math.round(fs * 0.5),
      padding: `${Math.round(fs * 0.28)}px ${Math.round(fs * 0.65)}px`,
      border: `1.5px solid ${corPrimaria}`,
      backdropFilter: "blur(4px)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
      pointerEvents: "none",
    }}>
      <code style={{
        fontFamily: "monospace",
        fontSize: fs,
        fontWeight: "bold",
        color: corTexto,
        whiteSpace: "nowrap",
        letterSpacing: 1.2,
        display: "block",
        lineHeight: 1,
      }}>
        XXXX-YYYY-ZZZZ-WWWW
      </code>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// RENDERERS
// ─────────────────────────────────────────────────────────────

function CardClassicoLandscape({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha, posicaoChave,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r       = raioCantos
  const logoSz  = size.preH * 0.28
  const qrSz    = size.preH * 0.38
  return (
    <div style={{
      width: size.preW, height: size.preH,
      border: `1.5px solid ${corPrimaria}44`, borderRadius: r,
      display: "flex", flexDirection: "row", alignItems: "stretch",
      background: corFundo, position: "relative", overflow: "hidden",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: opacidade / 100, pointerEvents: "none",
        filter: imgFilter(b, s, c),
      }} />}

      {/* Faixa esquerda colorida */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 5, height: "100%",
        background: `linear-gradient(180deg,${corPrimaria},${corPrimaria}77)`,
        borderRadius: `${r}px 0 0 ${r}px`,
      }} />

      {/* Coluna da loja */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", width: size.preW * 0.22, paddingLeft: 12,
        flexShrink: 0, position: "relative", zIndex: 1,
      }}>
        {img2
          ? <img src={img2} alt="" style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              objectFit: "cover", border: `2.5px solid ${corPrimaria}`, marginBottom: 5,
            }} />
          : <div style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              background: `linear-gradient(135deg,${corPrimaria}cc,${corPrimaria})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.32, fontWeight: "bold",
              marginBottom: 5, border: `2.5px solid ${corPrimaria}55`,
            }}>{letters}</div>
        }
        <span style={{
          fontSize: size.preH * 0.064, color: corPrimaria, fontWeight: "bold",
          textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center",
          lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden",
          maxWidth: "100%", textOverflow: "ellipsis",
        }}>
          {nomeLoja || "Sua Loja"}
        </span>
      </div>

      {/* Divisória */}
      <div style={{
        width: 1, alignSelf: "stretch", margin: `${size.preH * 0.12}px 0`,
        background: corPrimaria + "22", flexShrink: 0, position: "relative", zIndex: 1,
      }} />

      {/* Conteúdo central */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 5, paddingLeft: 12, paddingRight: 6,
        overflow: "hidden", position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontSize: size.preH * 0.062, fontWeight: "600", color: corSecundaria,
          textTransform: "uppercase", letterSpacing: 0.6,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{
          fontSize: size.preH * 0.17, fontWeight: "bold",
          color: corPrimaria, lineHeight: 1,
        }}>
          20% OFF
        </div>
        <div style={{
          fontSize: size.preH * 0.062, color: corSecundaria + "99",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          Desconto exclusivo
        </div>
        <div style={{
          fontSize: size.preH * 0.052, color: corSecundaria + "55",
          whiteSpace: "nowrap",
        }}>
          Válido até 31/12/2025
        </div>
      </div>

      {/* QR Code */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 4,
        paddingRight: 10, flexShrink: 0,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          border: `1.5px solid ${corPrimaria}`, borderRadius: 5,
          padding: 4, background: "#fff",
        }}>
          <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
            bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
        </div>
        <span style={{
          fontSize: size.preH * 0.052, color: corSecundaria + "77",
          textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap",
        }}>Escaneie e ative</span>
      </div>

      {/* Watermark */}
      <div style={{
        position: "absolute", bottom: 3, left: 14,
        fontSize: size.preH * 0.044, color: corSecundaria + "33",
        letterSpacing: 0.4, whiteSpace: "nowrap", zIndex: 1,
      }}>
        courtesyfy.com
      </div>

      {posicaoChave && (
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto={corTexto} />
      )}
    </div>
  )
}

function CardClassicoSquare({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha, posicaoChave,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r       = raioCantos
  const pad     = size.preW * 0.055
  const logoSz  = size.preW * 0.18
  const qrSz    = size.preW * 0.30
  return (
    <div style={{
      width: size.preW, height: size.preH,
      borderRadius: r, overflow: "hidden",
      background: corFundo, position: "relative",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column",
      border: `1.5px solid ${corPrimaria}44`,
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: opacidade / 100,
        pointerEvents: "none", filter: imgFilter(b, s, c),
      }} />}

      {/* Topo colorido */}
      <div style={{ height: 5, background: corPrimaria, flexShrink: 0, position: "relative", zIndex: 1 }} />

      {/* Header: logo + nomes */}
      <div style={{
        display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${pad * 0.55}px ${pad}px ${pad * 0.35}px`,
        gap: pad * 0.65, position: "relative", zIndex: 1,
      }}>
        {img2
          ? <img src={img2} alt="" style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              objectFit: "cover", border: `2px solid ${corPrimaria}`, flexShrink: 0,
            }} />
          : <div style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              background: `linear-gradient(135deg,${corPrimaria}cc,${corPrimaria})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.35, fontWeight: "bold",
              border: `2px solid ${corPrimaria}55`, flexShrink: 0,
            }}>{letters}</div>
        }
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div style={{
            fontSize: size.preW * 0.068, fontWeight: "bold", color: corPrimaria,
            textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {nomeLoja || "Sua Loja"}
          </div>
          <div style={{
            fontSize: size.preW * 0.058, color: corSecundaria,
            textTransform: "uppercase", letterSpacing: 0.3, marginTop: 2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {nomeCampanha || "Campanha"}
          </div>
        </div>
      </div>

      {/* Separador */}
      <div style={{
        height: 1, background: corPrimaria + "28",
        margin: `0 ${pad}px`, position: "relative", zIndex: 1,
      }} />

      {/* Corpo */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${pad * 0.55}px ${pad}px`,
        gap: pad, position: "relative", zIndex: 1, overflow: "hidden",
      }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{
            fontSize: size.preW * 0.20, fontWeight: "bold",
            color: corPrimaria, lineHeight: 1,
          }}>
            20% OFF
          </div>
          <div style={{
            fontSize: size.preW * 0.060, color: corSecundaria + "99",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Desconto exclusivo
          </div>
          <div style={{
            fontSize: size.preW * 0.050, color: corSecundaria + "55", whiteSpace: "nowrap",
          }}>
            Válido até 31/12/2025
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            border: `1.5px solid ${corPrimaria}`, borderRadius: 5,
            padding: 3, background: "#fff",
          }}>
            <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
              bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
          </div>
          <span style={{
            fontSize: size.preW * 0.048, color: corSecundaria + "66", whiteSpace: "nowrap",
          }}>Escanear</span>
        </div>
      </div>

      {/* Watermark */}
      <div style={{
        position: "absolute", bottom: 4, left: pad,
        fontSize: size.preW * 0.044, color: corSecundaria + "33", whiteSpace: "nowrap", zIndex: 1,
      }}>
        courtesyfy.com
      </div>

      {posicaoChave && (
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto={corTexto} />
      )}
    </div>
  )
}

function CardClassico(props: CardProps) {
  return isSquare(props.size) ? <CardClassicoSquare {...props} /> : <CardClassicoLandscape {...props} />
}

function CardModerno({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha, posicaoChave,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r       = raioCantos
  const topH    = Math.round(size.preH * 0.42)
  const qrSz    = size.preH * 0.29
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: corFundo, fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", border: `1.5px solid ${corPrimaria}22`,
      position: "relative",
    }}>
      {/* Banner superior */}
      <div style={{
        height: topH,
        background: `linear-gradient(135deg,${corPrimaria} 0%,${corPrimaria}99 100%)`,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 ${size.preW * 0.06}px`,
        flexShrink: 0,
      }}>
        {img1 && <img src={img1} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: opacidade / 100,
          filter: imgFilter(b, s, c), mixBlendMode: "overlay",
        }} />}
        {img2
          ? <img src={img2} alt="" style={{
              width: topH * 0.50, height: topH * 0.50, borderRadius: "50%",
              objectFit: "cover", border: "3px solid rgba(255,255,255,0.8)",
              position: "relative", zIndex: 1,
            }} />
          : <div style={{
              width: topH * 0.50, height: topH * 0.50, borderRadius: "50%",
              background: "rgba(255,255,255,0.22)", border: "3px solid rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: topH * 0.22, fontWeight: "bold",
              position: "relative", zIndex: 1,
            }}>{letters}</div>
        }
        <div style={{
          position: "relative", zIndex: 1, textAlign: "right",
          maxWidth: "55%", overflow: "hidden",
        }}>
          <div style={{
            fontSize: topH * 0.18, fontWeight: "bold",
            color: "rgba(255,255,255,0.95)", lineHeight: 1.1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {nomeLoja || "Sua Loja"}
          </div>
          <div style={{
            fontSize: topH * 0.13, color: "rgba(255,255,255,0.70)",
            textTransform: "uppercase", letterSpacing: 0.5,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {nomeCampanha || "Campanha"}
          </div>
        </div>
      </div>

      {/* Corpo inferior */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "row",
        alignItems: "center", padding: `${size.preH * 0.05}px ${size.preW * 0.06}px`,
        gap: size.preW * 0.06,
      }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{
            fontSize: size.preH * 0.17, fontWeight: "bold",
            color: corPrimaria, lineHeight: 1,
          }}>
            20% OFF
          </div>
          <div style={{
            fontSize: size.preH * 0.064, color: corSecundaria,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Desconto exclusivo
          </div>
          <div style={{
            fontSize: size.preH * 0.052, color: corSecundaria + "55", whiteSpace: "nowrap",
          }}>
            Válido até 31/12/2025
          </div>
        </div>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, flexShrink: 0,
        }}>
          <div style={{
            border: `2px solid ${corPrimaria}`, borderRadius: 5, padding: 3, background: "#fff",
          }}>
            <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
              bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
          </div>
          <span style={{
            fontSize: size.preH * 0.050, color: corSecundaria + "66", whiteSpace: "nowrap",
          }}>Escanear</span>
        </div>
      </div>

      {/* Watermark */}
      <div style={{
        position: "absolute", bottom: 4, right: size.preW * 0.04,
        fontSize: size.preH * 0.042, color: corSecundaria + "33", whiteSpace: "nowrap", zIndex: 1,
      }}>
        courtesyfy.com
      </div>

      {posicaoChave && (
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto={corTexto} />
      )}
    </div>
  )
}

function CardMinimalista({
  size, corPrimaria, corFundo, corTexto, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha, posicaoChave,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r       = raioCantos
  const logoSz  = size.preH * 0.24
  const qrSz    = size.preH * 0.33
  const pad     = size.preW * 0.055
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: corFundo, fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column",
      border: `1px solid ${corTexto}1A`, position: "relative",
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: opacidade / 100,
        filter: imgFilter(b, s, c), pointerEvents: "none",
      }} />}

      {/* Linha de acento superior */}
      <div style={{
        height: 3, background: corPrimaria,
        flexShrink: 0, position: "relative", zIndex: 1,
      }} />

      {/* Conteúdo */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "row", alignItems: "center",
        padding: `${size.preH * 0.08}px ${pad}px`,
        gap: pad * 0.9, position: "relative", zIndex: 1,
      }}>
        {/* Logo + nome */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 4, flexShrink: 0, maxWidth: size.preW * 0.22,
        }}>
          {img2
            ? <img src={img2} alt="" style={{
                width: logoSz, height: logoSz, borderRadius: "50%", objectFit: "cover",
              }} />
            : <div style={{
                width: logoSz, height: logoSz, borderRadius: "50%",
                background: corPrimaria + "1E",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: corPrimaria, fontSize: logoSz * 0.33, fontWeight: "bold",
              }}>{letters}</div>
          }
          <span style={{
            fontSize: size.preH * 0.055, color: corSecundaria,
            fontWeight: 600, textAlign: "center", lineHeight: 1.15,
            whiteSpace: "nowrap", overflow: "hidden",
            textOverflow: "ellipsis", maxWidth: "100%",
          }}>
            {nomeLoja || "Loja"}
          </span>
        </div>

        {/* Divisória */}
        <div style={{
          width: 1, alignSelf: "stretch", margin: `${size.preH * 0.06}px 0`,
          background: corTexto + "14", flexShrink: 0,
        }} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{
            fontSize: size.preH * 0.059, color: corSecundaria + "aa",
            textTransform: "uppercase", letterSpacing: 0.7,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {nomeCampanha || "Campanha"}
          </div>
          <div style={{
            fontSize: size.preH * 0.18, fontWeight: "300",
            color: corPrimaria, letterSpacing: -0.5, lineHeight: 1,
          }}>
            20% OFF
          </div>
          <div style={{
            fontSize: size.preH * 0.056, color: corSecundaria + "88",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Desconto exclusivo
          </div>
        </div>

        {/* QR */}
        <div style={{ flexShrink: 0, opacity: 0.88 }}>
          <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
            bgColor="transparent" fgColor={corTexto} level="M" marginSize={0} />
        </div>
      </div>

      {/* Watermark */}
      <div style={{
        position: "absolute", bottom: 4, right: pad,
        fontSize: size.preH * 0.042, color: corSecundaria + "33",
        whiteSpace: "nowrap", zIndex: 1,
      }}>
        courtesyfy.com
      </div>

      {posicaoChave && (
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto={corTexto} />
      )}
    </div>
  )
}

function CardGradiente({
  size, corPrimaria, corFundo, corTexto: _ct, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha, posicaoChave,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r       = raioCantos
  const logoSz  = size.preH * 0.34
  const qrSz    = size.preH * 0.34
  const pad     = size.preW * 0.05
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: `linear-gradient(135deg,${corPrimaria} 0%,${corFundo} 100%)`,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "row", alignItems: "center",
      padding: `${size.preH * 0.1}px ${pad}px`, gap: pad, position: "relative",
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: opacidade / 100,
        filter: imgFilter(b, s, c), mixBlendMode: "overlay", pointerEvents: "none",
      }} />}

      {/* Logo + nome da loja */}
      <div style={{
        flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 5, position: "relative", zIndex: 1,
        maxWidth: size.preW * 0.25,
      }}>
        {img2
          ? <img src={img2} alt="" style={{
              width: logoSz, height: logoSz, borderRadius: "50%", objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.55)",
            }} />
          : <div style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              background: "rgba(255,255,255,0.22)", border: "3px solid rgba(255,255,255,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: logoSz * 0.32, fontWeight: "bold",
            }}>{letters}</div>
        }
        <span style={{
          fontSize: size.preH * 0.065, color: "rgba(255,255,255,0.92)",
          fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
        }}>
          {nomeLoja || "Loja"}
        </span>
      </div>

      {/* Info central */}
      <div style={{
        flex: 1, position: "relative", zIndex: 1,
        paddingLeft: 4, minWidth: 0, display: "flex", flexDirection: "column", gap: 5,
      }}>
        <div style={{
          fontSize: size.preH * 0.067, color: "rgba(255,255,255,0.72)",
          textTransform: "uppercase", letterSpacing: 0.5,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{
          fontSize: size.preH * 0.19, fontWeight: "bold",
          color: "#fff", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.22)",
        }}>
          20% OFF
        </div>
        <div style={{
          fontSize: size.preH * 0.060, color: "rgba(255,255,255,0.65)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          Desconto exclusivo
        </div>
        <div style={{
          fontSize: size.preH * 0.050, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap",
        }}>
          Válido até 31/12/2025
        </div>
      </div>

      {/* QR */}
      <div style={{
        flexShrink: 0, position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.92)", borderRadius: 7, padding: 5,
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
          bgColor="transparent" fgColor="#111827" level="M" marginSize={0} />
      </div>

      {posicaoChave && (
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto="#1a1a1a" />
      )}
    </div>
  )
}

function CardNeon({
  size, corPrimaria, corFundo: _cf, corTexto: _ct, corSecundaria,
  img1, img2, opacidade, brilho: b, saturacao: s, contraste: c,
  raioCantos, nomeLoja, nomeCampanha, posicaoChave,
}: CardProps) {
  const letters = ini(nomeLoja)
  const r       = raioCantos
  const logoSz  = size.preH * 0.30
  const qrSz    = size.preH * 0.32
  const pad     = size.preW * 0.045
  return (
    <div style={{
      width: size.preW, height: size.preH, borderRadius: r, overflow: "hidden",
      background: "#090909", fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "row", alignItems: "center",
      padding: `${size.preH * 0.1}px ${pad}px`, gap: pad, position: "relative",
      border: `1.5px solid ${corPrimaria}`,
      boxShadow: `0 0 14px ${corPrimaria}44, inset 0 0 40px rgba(0,0,0,0.4)`,
    }}>
      {img1 && <img src={img1} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: (opacidade / 100) * 0.45,
        filter: imgFilter(b, s, c), pointerEvents: "none",
      }} />}

      {/* Linha neon no topo */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,transparent,${corPrimaria},transparent)`,
      }} />

      {/* Logo + nome */}
      <div style={{
        flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 4, position: "relative", zIndex: 1,
        maxWidth: size.preW * 0.25,
      }}>
        {img2
          ? <img src={img2} alt="" style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              objectFit: "cover", border: `2px solid ${corPrimaria}`,
              boxShadow: `0 0 8px ${corPrimaria}66`,
            }} />
          : <div style={{
              width: logoSz, height: logoSz, borderRadius: "50%",
              background: corPrimaria + "1A", border: `2px solid ${corPrimaria}`,
              boxShadow: `0 0 10px ${corPrimaria}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: corPrimaria, fontSize: logoSz * 0.33, fontWeight: "bold",
            }}>{letters}</div>
        }
        <span style={{
          fontSize: size.preH * 0.060, color: corPrimaria, fontWeight: 700,
          textAlign: "center", textShadow: `0 0 7px ${corPrimaria}`,
          whiteSpace: "nowrap", overflow: "hidden",
          textOverflow: "ellipsis", maxWidth: "100%",
        }}>
          {nomeLoja || "Loja"}
        </span>
      </div>

      {/* Info */}
      <div style={{
        flex: 1, position: "relative", zIndex: 1, paddingLeft: 6,
        minWidth: 0, display: "flex", flexDirection: "column", gap: 5,
      }}>
        <div style={{
          fontSize: size.preH * 0.061, color: "rgba(255,255,255,0.48)",
          textTransform: "uppercase", letterSpacing: 0.7,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {nomeCampanha || "Campanha"}
        </div>
        <div style={{
          fontSize: size.preH * 0.18, fontWeight: "bold", color: corPrimaria,
          lineHeight: 1, textShadow: `0 0 14px ${corPrimaria}`,
        }}>
          20% OFF
        </div>
        <div style={{
          fontSize: size.preH * 0.060, color: "rgba(255,255,255,0.55)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          Desconto exclusivo
        </div>
        <div style={{
          fontSize: size.preH * 0.048, color: "rgba(255,255,255,0.28)", whiteSpace: "nowrap",
        }}>
          Válido até 31/12/2025
        </div>
      </div>

      {/* QR */}
      <div style={{
        flexShrink: 0, position: "relative", zIndex: 1,
        border: `1.5px solid ${corPrimaria}`, borderRadius: 6, padding: 3,
        background: "#fff", boxShadow: `0 0 10px ${corPrimaria}44`,
      }}>
        <QRCodeSVG value="https://courtesyfy.com" size={qrSz}
          bgColor="#fff" fgColor="#111827" level="M" marginSize={0} />
      </div>

      {posicaoChave && (
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto="#111111" />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MODO LIMPO (arte própria)
// ─────────────────────────────────────────────────────────────

function CardLimpo({
  size, corPrimaria, corFundo, corTexto, img1, opacidade,
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
        <KeyBadge posicao={posicaoChave} size={size} corPrimaria={corPrimaria} corTexto={corTexto} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ROUTER — exportado
// ─────────────────────────────────────────────────────────────

export function CardRenderer(props: CardProps & { estilo: EstiloCard }) {
  if (props.modoLimpo) return <CardLimpo {...props} />
  switch (props.estilo) {
    case "MODERNO":      return <CardModerno {...props} />
    case "MINIMALISTA":  return <CardMinimalista {...props} />
    case "GRADIENTE":    return <CardGradiente {...props} />
    case "NEON":         return <CardNeon {...props} />
    default:             return <CardClassico {...props} />
  }
}
