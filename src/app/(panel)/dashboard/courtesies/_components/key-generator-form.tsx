"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateKeys } from "../_actions/generate-keys"

type Preset = "3m" | "6m" | "1y" | "custom"

function computeDate(preset: Preset, customDate: string): string {
  const d = new Date()
  if (preset === "3m") d.setMonth(d.getMonth() + 3)
  else if (preset === "6m") d.setMonth(d.getMonth() + 6)
  else if (preset === "1y") d.setFullYear(d.getFullYear() + 1)
  else return customDate
  return d.toISOString().slice(0, 10)
}

export function KeyGeneratorForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [preset, setPreset] = useState<Preset>("6m")
  const [customDate, setCustomDate] = useState("")
  const [quantity, setQuantity] = useState(10)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    const validUntil = computeDate(preset, customDate)
    if (!validUntil) {
      setMessage({ type: "err", text: "Escolha uma data de validade" })
      return
    }
    startTransition(async () => {
      const res = await generateKeys({ quantity, validUntil })
      if ("error" in res && res.error) {
        setMessage({ type: "err", text: res.error })
      } else {
        setMessage({ type: "ok", text: `${res.quantity} chaves geradas no lote ${res.batchId?.slice(0, 8)}...` })
        router.refresh()
      }
    })
  }

  const presets: { key: Preset; label: string }[] = [
    { key: "3m", label: "3 meses" },
    { key: "6m", label: "6 meses" },
    { key: "1y", label: "1 ano" },
    { key: "custom", label: "Personalizado" },
  ]

  return (
    <Card className="border-emerald-200 bg-white shadow-sm">
      <CardHeader className="border-b border-emerald-100 bg-emerald-50/40">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Sparkles className="w-5 h-5 text-emerald-600" /> Gerar Chaves
        </CardTitle>
        <CardDescription className="text-gray-600">
          Gera um lote de chaves únicas para cards físicos. Cada chave é anônima e intransferível.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Validade</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {presets.map((p) => (
                <Button
                  key={p.key}
                  type="button"
                  variant={preset === p.key ? "default" : "outline"}
                  size="sm"
                  className={
                    preset === p.key
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-transparent"
                      : "border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                  }
                  onClick={() => setPreset(p.key)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            {preset === "custom" && (
              <Input
                type="date"
                className="mt-2 focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
            )}
          </div>

          <div>
            <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
              Quantidade (máx. 500)
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="focus:ring-2 focus:ring-emerald-500 border-emerald-200"
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "ok" ? "text-emerald-700 font-medium" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Gerar {quantity} {quantity === 1 ? "chave" : "chaves"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
