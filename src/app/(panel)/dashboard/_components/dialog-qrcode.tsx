// src/app/dashboard/appointments/_components/dialog-qrcode.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Mail, MessageCircle, Download, Copy, Check, QrCode } from "lucide-react"
import { toast } from "sonner"

interface DialogQRCodeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professionalUrl: string
  professionalName?: string
}

export function DialogQRCode({ 
  open, 
  onOpenChange, 
  professionalUrl,
  professionalName 
}: DialogQRCodeProps) {
  const [copied, setCopied] = useState(false)
  
  const fullUrl = `${window.location.origin}/profissional/${professionalUrl}`
  const message = `Olá! Agende sua consulta comigo através deste link: ${fullUrl}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success("Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmail = () => {
    const subject = "Agende sua consulta"
    const body = message
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, "_blank")
  }

  const handleDownload = () => {
    const svg = document.getElementById("qrcode-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qrcode-agendamento-${professionalUrl}.png`
      downloadLink.href = pngFile
      downloadLink.click()
      
      toast.success("QR Code baixado!")
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="min-w-0">QR Code de Agendamento</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base pt-2">
            Compartilhe este QR Code para facilitar o agendamento dos seus pacientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
            <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg w-full max-w-[280px] sm:max-w-none sm:w-auto">
              <QRCodeSVG
                id="qrcode-svg"
                value={fullUrl}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#059669"
                className="w-full h-auto sm:w-64 sm:h-64"
              />
            </div>

            {professionalName && (
              <p className="mt-3 sm:mt-4 text-sm font-semibold text-emerald-700 text-center break-words max-w-full">
                {professionalName}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-600 text-center break-all max-w-full">
              {fullUrl}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={handleWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white h-11 sm:h-12 text-sm"
              >
                <MessageCircle className="w-4 h-4 sm:mr-2" />
                <span className="ml-1 sm:ml-0">WhatsApp</span>
              </Button>

              <Button
                onClick={handleEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white h-11 sm:h-12 text-sm"
              >
                <Mail className="w-4 h-4 sm:mr-2" />
                <span className="ml-1 sm:ml-0">Email</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-emerald-300 hover:bg-emerald-50 h-11 sm:h-12 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 sm:mr-2 text-green-600" />
                    <span className="ml-1 sm:ml-0">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:mr-2" />
                    <span className="ml-1 sm:ml-0">Copiar Link</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-11 sm:h-12 text-sm"
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="ml-1 sm:ml-0">Baixar</span>
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>💡 Dica:</strong> Imprima este QR Code e deixe em sua sala de atendimento
              para facilitar o agendamento dos seus pacientes!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}