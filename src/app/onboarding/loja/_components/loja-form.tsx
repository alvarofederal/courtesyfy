"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { criarLoja } from "../_actions/criar-loja"

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO",
]

const initialState = { error: undefined as string | undefined }

export function LojaForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await criarLoja(formData)
      return result ?? initialState
    },
    initialState
  )

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="nome">Nome da loja *</Label>
        <Input
          id="nome"
          name="nome"
          required
          placeholder="Ex: Cafeteria Central"
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email comercial *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="contato@sualoja.com.br"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cnpjCpf">CNPJ / CPF</Label>
          <Input
            id="cnpjCpf"
            name="cnpjCpf"
            placeholder="00.000.000/0001-00"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            name="cidade"
            placeholder="São Paulo"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="estado">UF</Label>
          <select
            id="estado"
            name="estado"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">—</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Criando loja...
          </>
        ) : (
          "Criar loja e entrar"
        )}
      </Button>
    </form>
  )
}
