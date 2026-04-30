"use client"

import { useState, useTransition } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateAdminProfile } from "../_actions/update-admin-profile"

interface AdminNameFormProps {
  defaultName: string
  email: string
}

export function AdminNameForm({ defaultName, email }: AdminNameFormProps) {
  const [name, setName] = useState(defaultName)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateAdminProfile({ name })
      if (res.error) toast.error(res.error)
      else toast.success("Perfil atualizado")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-name">Nome</Label>
        <Input
          id="admin-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-email">E-mail</Label>
        <Input
          id="admin-email"
          value={email}
          disabled
          className="h-11 bg-gray-50 text-gray-600"
        />
        <p className="text-xs text-gray-500">O e-mail não pode ser alterado.</p>
      </div>

      <Button
        type="submit"
        disabled={isPending || name.trim() === ""}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar alterações
          </>
        )}
      </Button>
    </form>
  )
}
