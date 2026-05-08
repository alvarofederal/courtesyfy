"use client"

import { useActionState, useState } from "react"
import { Loader2 } from "lucide-react"
import { criarLoja } from "../_actions/criar-loja"

/* ─── preset colors ───────────────────────────────────────────── */
const PRESETS = [
  { hex: "#10b981", label: "Verde"    },
  { hex: "#3b82f6", label: "Azul"     },
  { hex: "#f59e0b", label: "Âmbar"   },
  { hex: "#ef4444", label: "Vermelho" },
  { hex: "#8b5cf6", label: "Violeta"  },
  { hex: "#ec4899", label: "Rosa"     },
  { hex: "#f97316", label: "Laranja"  },
  { hex: "#06b6d4", label: "Ciano"    },
]

/* ─── mini preview da tela do cliente ────────────────────────── */
function ClientPreview({
  nome, logoUrl, cor,
}: {
  nome: string
  logoUrl: string
  cor: string
}) {
  const exibicao = nome.trim() || "Sua Loja"
  const inicial  = exibicao[0]?.toUpperCase() ?? "L"

  return (
    <div
      className="rounded-2xl overflow-hidden select-none"
      style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Barra top */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${cor}, transparent)` }}
      />

      {/* Header da loja */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.6)" }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            style={{ border: `1px solid ${cor}40` }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ background: `${cor}22`, border: `1px solid ${cor}40` }}
          >
            {inicial}
          </div>
        )}
        <div>
          <p className="text-white text-xs font-bold leading-tight">{exibicao}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>Cortesia exclusiva</p>
        </div>
      </div>

      {/* Card do benefício */}
      <div className="px-3 pt-3 pb-3 space-y-2">
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="rounded-lg px-3 pt-3 pb-2 text-center mb-2"
            style={{ background: `linear-gradient(160deg, ${cor}14, ${cor}05)` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: cor }}>
              Desconto especial
            </p>
            <p className="text-2xl font-black text-white mb-0.5">20% OFF</p>
            <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
              Campanha de Verão
            </p>
          </div>
          <div className="flex items-center justify-between px-1">
            <code className="font-mono text-xs font-bold" style={{ color: cor }}>ABCD-EFGH-IJKL-MNOP</code>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>30 dias</span>
          </div>
        </div>

        {/* Botão ativar */}
        <button
          type="button"
          className="w-full py-2 rounded-xl text-xs font-bold"
          style={{ background: `linear-gradient(135deg, ${cor}, ${cor}cc)`, color: "#000" }}
        >
          Ativar minha chave
        </button>
      </div>

      <p className="text-center text-[10px] pb-2" style={{ color: "rgba(255,255,255,0.18)" }}>
        Powered by <span style={{ color: "rgba(255,255,255,0.30)" }}>Courtesyfy</span>
      </p>
    </div>
  )
}

/* ─── campos dark ────────────────────────────────────────────── */
const inp = (focused: boolean): React.CSSProperties => ({
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${focused ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.10)"}`,
  borderRadius: "10px",
  padding: "10px 12px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
})

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  marginBottom: "5px",
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
}

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"]

/* ─── form ───────────────────────────────────────────────────── */
type State = { error?: string }

export function LojaForm() {
  const [state, action, pending] = useActionState(
    async (_prev: State, fd: FormData) => (await criarLoja(fd)) ?? {},
    {} as State,
  )

  const [nome,       setNome]       = useState("")
  const [logoUrl,    setLogoUrl]    = useState("")
  const [cor,        setCor]        = useState("#10b981")
  const [focused,    setFocused]    = useState<string | null>(null)
  const [customOpen, setCustomOpen] = useState(false)

  const f = (id: string) => ({
    onFocus: () => setFocused(id),
    onBlur:  () => setFocused(null),
    style:   inp(focused === id),
  })

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">

      {/* ── Form ── */}
      <div className="flex-1 min-w-0">
        {state.error && (
          <div
            className="rounded-xl p-3 mb-4 text-sm text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5" }}
          >
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          {/* hidden corPrimaria */}
          <input type="hidden" name="corPrimaria" value={cor} />

          {/* Nome da loja */}
          <div>
            <label style={lbl}>Nome interno da loja *</label>
            <input
              name="nome"
              required
              placeholder="Ex: Cafeteria Central"
              value={nome}
              onChange={e => setNome(e.target.value)}
              {...f("nome")}
            />
          </div>

          {/* Nome de exibição */}
          <div>
            <label style={lbl}>
              Nome de exibição{" "}
              <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none" }}>
                — aparece na tela do cliente
              </span>
            </label>
            <input
              name="nomeExibicao"
              placeholder="Ex: Café Central (deixe vazio para usar o nome acima)"
              {...f("nomeExibicao")}
            />
          </div>

          {/* Email */}
          <div>
            <label style={lbl}>Email comercial *</label>
            <input name="email" type="email" required placeholder="contato@sualoja.com.br" {...f("email")} />
          </div>

          {/* Telefone + CNPJ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lbl}>Telefone</label>
              <input name="telefone" placeholder="(11) 99999-9999" {...f("telefone")} />
            </div>
            <div>
              <label style={lbl}>CNPJ / CPF</label>
              <input name="cnpjCpf" placeholder="00.000.000/0001-00" {...f("cnpj")} />
            </div>
          </div>

          {/* Cidade + UF */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label style={lbl}>Cidade</label>
              <input name="cidade" placeholder="São Paulo" {...f("cidade")} />
            </div>
            <div>
              <label style={lbl}>UF</label>
              <select
                name="estado"
                onFocus={() => setFocused("uf")}
                onBlur={() => setFocused(null)}
                style={{ ...inp(focused === "uf"), padding: "9px 10px" }}
              >
                <option value="">—</option>
                {UFS.map(uf => <option key={uf} value={uf} style={{ background: "#111", color: "#fff" }}>{uf}</option>)}
              </select>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label style={lbl}>
              Logo da loja{" "}
              <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none" }}>
                — URL da imagem (ex: https://...)
              </span>
            </label>
            <input
              name="logoUrl"
              type="url"
              placeholder="https://minhaloja.com/logo.png"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              {...f("logo")}
            />
          </div>

          {/* Cor de marca */}
          <div>
            <label style={lbl}>Cor de marca</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESETS.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  title={p.label}
                  onClick={() => setCor(p.hex)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{
                    background: p.hex,
                    outline: cor === p.hex ? `2px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
              {/* Custom picker toggle */}
              <button
                type="button"
                onClick={() => setCustomOpen(v => !v)}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.20)",
                  color: "rgba(255,255,255,0.50)",
                  background: "rgba(255,255,255,0.05)",
                }}
                title="Cor personalizada"
              >
                +
              </button>
            </div>
            {customOpen && (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cor}
                  onChange={e => setCor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  style={{ padding: 0 }}
                />
                <span className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>{cor}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 mt-2"
            style={{
              background: `linear-gradient(135deg, ${cor}, ${cor}bb)`,
              boxShadow: `0 0 24px ${cor}40`,
            }}
          >
            {pending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando loja...</>
              : "Criar loja e entrar →"}
          </button>
        </form>
      </div>

      {/* ── Preview ── */}
      <div className="lg:w-64 xl:w-72 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
          Como o cliente vai ver
        </p>
        <ClientPreview nome={nome} logoUrl={logoUrl} cor={cor} />
      </div>

    </div>
  )
}
