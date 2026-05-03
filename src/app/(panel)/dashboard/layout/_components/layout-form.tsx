"use client"

import { useActionState, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle, Loader2, Upload, X, Star } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { LayoutState } from "../_actions/layout-actions"

// ── tiny image uploader hook ──────────────────────────────────────────────────
function useImageUpload(initial: string | null) {
  const [url, setUrl]         = useState(initial ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError]     = useState("")

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

// ── card preview (cartão 3,5×7) ───────────────────────────────────────────────
function CardPreview({
  cor,
  img1,
  img2,
  opacidade,
  nomeLoja,
  nomeCampanha,
}: {
  cor: string
  img1: string
  img2: string
  opacidade: number
  nomeLoja: string
  nomeCampanha: string
}) {
  const initials = nomeLoja
    .split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "AB"

  return (
    <div
      style={{
        width: 280,
        height: 140,
        border: `1.5px dashed ${cor}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        background: "linear-gradient(135deg,#fffdf7 60%,#fdf3e3 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* background image */}
      {img1 && (
        <img
          src={img1}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: opacidade / 100,
            pointerEvents: "none",
          }}
        />
      )}

      {/* left accent */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%",
        background: `linear-gradient(180deg,${cor},${cor}99)`, borderRadius: "8px 0 0 8px" }} />

      {/* store col */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minWidth: 54, paddingLeft: 6, position: "relative", zIndex: 1 }}>
        {img2 ? (
          <img src={img2} alt="" style={{ width: 40, height: 40, borderRadius: "50%",
            objectFit: "cover", border: `2px solid ${cor}`, marginBottom: 3 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: "50%",
            background: `linear-gradient(135deg,${cor}cc,${cor})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 10, fontWeight: "bold", marginBottom: 3,
            border: `2px solid ${cor}` }}>
            {initials}
          </div>
        )}
        <span style={{ fontSize: 6, color: cor, fontWeight: "bold", textTransform: "uppercase",
          letterSpacing: 0.4, textAlign: "center", lineHeight: 1.2 }}>
          {nomeLoja || "Sua Loja"}
        </span>
      </div>

      {/* info col */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 2, paddingLeft: 4, overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 7, fontWeight: "bold", color: "#5a3e28",
          textTransform: "uppercase", letterSpacing: 0.6 }}>
          {nomeCampanha || "Nome da Campanha"}
        </div>
        <div style={{ fontSize: 12, fontWeight: "bold", color: cor, lineHeight: 1 }}>
          20% OFF
        </div>
        <div style={{ fontSize: 7, color: "#777" }}>Desconto na próxima compra</div>
        <code style={{ fontFamily: "monospace", fontSize: 8, fontWeight: "bold",
          color: "#3a2510", background: "#fdf3e3", border: `1px solid ${cor}`,
          borderRadius: 3, padding: "1px 4px", marginTop: 2, display: "inline-block" }}>
          XXXX-YYYY-ZZZZ-WWWW
        </code>
        <div style={{ fontSize: 6, color: "#aaa" }}>Válido até: 31/12/2025</div>
      </div>

      {/* QR col */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 3, minWidth: 62, position: "relative", zIndex: 1 }}>
        <div style={{ border: `1.5px solid ${cor}`, borderRadius: 4, padding: 3, background: "#fff" }}>
          <QRCodeSVG value="https://courtesyfy.com" size={50} bgColor="#fff"
            fgColor="#111827" level="M" marginSize={0} />
        </div>
        <span style={{ fontSize: 6, color: "#aaa", textAlign: "center", lineHeight: 1.3 }}>
          Escaneie<br />e ative
        </span>
      </div>

      {/* watermark */}
      <div style={{ position: "absolute", bottom: 3, right: 7,
        fontSize: 5, color: "#ddd", letterSpacing: 0.4 }}>
        courtesyfy.com
      </div>
    </div>
  )
}

// ── image field ───────────────────────────────────────────────────────────────
function ImageField({
  label,
  hint,
  fieldName,
  hook,
}: {
  label: string
  hint: string
  fieldName: string
  hook: ReturnType<typeof useImageUpload>
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <input type="hidden" name={fieldName} value={hook.url} />

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-2 rounded-xl transition-colors">
          {hook.uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {hook.uploading ? "Enviando…" : "Escolher imagem"}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={hook.handleFile}
            disabled={hook.uploading}
            className="hidden"
          />
        </label>

        {hook.url && (
          <div className="relative">
            <img
              src={hook.url}
              alt="preview"
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={() => hook.setUrl("")}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        )}
      </div>
      {hook.error && <p className="text-red-500 text-xs mt-1">{hook.error}</p>}
    </div>
  )
}

// ── save button ───────────────────────────────────────────────────────────────
function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {pending ? "Salvando…" : "Salvar layout"}
    </button>
  )
}

// ── main component ────────────────────────────────────────────────────────────
interface LayoutData {
  id?: string
  nome: string
  corPrimaria: string
  imagem1Url: string | null
  imagem2Url: string | null
  imagem3Url: string | null
  opacidadeFundo: number
  padrao: boolean
}

interface Props {
  action: (prev: LayoutState, fd: FormData) => Promise<LayoutState>
  initial?: LayoutData
  nomeLoja: string
}

export function LayoutForm({ action, initial, nomeLoja }: Props) {
  const [state, formAction] = useActionState<LayoutState, FormData>(action, {})
  const [cor, setCor]       = useState(initial?.corPrimaria ?? "#c8a96e")
  const [opacidade, setOpacidade] = useState(initial?.opacidadeFundo ?? 20)
  const [nomeCampanha, setNomeCampanha] = useState("Campanha Exemplo")
  const [, startTransition] = useTransition()

  const img1 = useImageUpload(initial?.imagem1Url ?? null)
  const img2 = useImageUpload(initial?.imagem2Url ?? null)
  const img3 = useImageUpload(initial?.imagem3Url ?? null)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
      {/* ── Form ── */}
      <form action={(fd) => startTransition(() => formAction(fd))} className="space-y-6">
        {initial?.id && <input type="hidden" name="id" value={initial.id} />}
        <input type="hidden" name="imagem1Url" value={img1.url} />
        <input type="hidden" name="imagem2Url" value={img2.url} />
        <input type="hidden" name="imagem3Url" value={img3.url} />

        {state.success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Layout salvo com sucesso.
          </div>
        )}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {state.error}
          </div>
        )}

        {/* Nome */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Identificação</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome do layout <span className="text-red-500">*</span>
              </label>
              <input
                name="nome"
                defaultValue={initial?.nome ?? ""}
                placeholder="Ex: Layout Natal 2025"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {state.fieldErrors?.nome && (
                <p className="text-red-500 text-xs mt-1">{state.fieldErrors.nome[0]}</p>
              )}
            </div>

            {/* Padrão */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="padrao"
                  defaultChecked={initial?.padrao ?? false}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Layout padrão da loja
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Cor */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Cor da marca</h2>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 flex-shrink-0"
            />
            <input
              name="corPrimaria"
              type="text"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              placeholder="#c8a96e"
              className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex-1 h-10 rounded-xl border border-gray-100" style={{ backgroundColor: cor }} />
          </div>
        </div>

        {/* Imagens */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">Imagens</h2>

          <ImageField
            label="Imagem de fundo"
            hint="Aparece atrás do conteúdo do card com a opacidade configurada abaixo."
            fieldName="imagem1Url"
            hook={img1}
          />

          {img1.url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Opacidade do fundo — <span className="font-mono">{opacidade}%</span>
              </label>
              <input
                type="range"
                name="opacidadeFundo"
                min={5}
                max={60}
                step={5}
                value={opacidade}
                onChange={(e) => setOpacidade(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>5% (quase invisível)</span>
                <span>60% (bem visível)</span>
              </div>
            </div>
          )}

          {!img1.url && (
            <input type="hidden" name="opacidadeFundo" value={opacidade} />
          )}

          <div className="border-t border-gray-100 pt-4">
            <ImageField
              label="Logo personalizada"
              hint="Substitui o círculo de iniciais no card. Use PNG com fundo transparente."
              fieldName="imagem2Url"
              hook={img2}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <ImageField
              label="Imagem extra"
              hint="Elemento decorativo adicional (uso futuro / MDF)."
              fieldName="imagem3Url"
              hook={img3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <SaveButton />
        </div>
      </form>

      {/* ── Live preview ── */}
      <div className="xl:sticky xl:top-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Preview ao vivo</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Cartão 3,5×7</span>
          </div>

          {/* mini nome campanha input para o preview */}
          <div className="mb-4">
            <input
              type="text"
              value={nomeCampanha}
              onChange={(e) => setNomeCampanha(e.target.value)}
              placeholder="Nome da campanha (para preview)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">Texto de exemplo para visualizar o card</p>
          </div>

          <div className="overflow-x-auto">
            <CardPreview
              cor={cor}
              img1={img1.url}
              img2={img2.url}
              opacidade={opacidade}
              nomeLoja={nomeLoja}
              nomeCampanha={nomeCampanha}
            />
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Este é o aspecto real do card impresso
          </p>
        </div>
      </div>
    </div>
  )
}
