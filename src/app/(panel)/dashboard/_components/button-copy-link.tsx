// src/app/dashboard/_components/button-copy-link.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface ButtonCopyLinkProps {
  userId: string
  label?: string // ✅ ADICIONAR prop opcional
}

export function ButtonCopyLink({ userId, label }: ButtonCopyLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/profissional/${userId}`
    
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copiado!")
    
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      className="border-emerald-300 hover:bg-emerald-50"
      onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          {label || "Copiado!"}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {label || "Copiar link"} {/* ✅ Usar label ou texto padrão */}
        </>
      )}
    </Button>
  )
}