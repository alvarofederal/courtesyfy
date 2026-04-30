"use client"

import { useState, useRef, useCallback, ClipboardEvent, DragEvent, ChangeEvent } from "react"
import { Image as ImageIcon, X, Upload, Loader2, ClipboardPaste } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export interface UploadedImage {
  url: string
  publicId: string | null
}

interface TicketImageDropzoneProps {
  userId: string
  maxImages?: number
  value: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Upload de imagens para chamados.
 * - Drag & drop
 * - Click para abrir file picker
 * - Paste (Ctrl+V) de screenshots
 * - Até N imagens (default 2)
 * Usa a mesma rota /api/image/upload que o avatar do perfil.
 */
export function TicketImageDropzone({
  userId,
  maxImages = 2,
  value,
  onChange,
}: TicketImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedImage | null> => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Formato inválido. Use PNG, JPG ou WEBP.")
        return null
      }
      if (file.size > MAX_SIZE) {
        toast.error("Imagem maior que 5MB.")
        return null
      }

      const formData = new FormData()
      // Nome único para evitar colisão no Cloudinary (tickets podem ter múltiplas imagens)
      const ext = file.name.split(".").pop() ?? "png"
      const uniqueName = `ticket-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      formData.append("file", new File([file], uniqueName, { type: file.type }))
      formData.append("userId", userId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/image/upload`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        toast.error("Falha no upload da imagem.")
        return null
      }
      const data = await response.json()
      return { url: data.secure_url, publicId: data.public_id ?? null }
    },
    [userId]
  )

  const addFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxImages - value.length
      if (remaining <= 0) {
        toast.error(`Máximo de ${maxImages} imagens.`)
        return
      }
      const toUpload = files.slice(0, remaining)
      if (files.length > remaining) {
        toast.info(`Enviando apenas ${remaining} imagem(s). Limite: ${maxImages}.`)
      }

      setUploading(true)
      try {
        const uploaded: UploadedImage[] = []
        for (const f of toUpload) {
          const result = await uploadFile(f)
          if (result) uploaded.push(result)
        }
        if (uploaded.length > 0) {
          onChange([...value, ...uploaded])
          toast.success(`${uploaded.length} imagem(ns) enviada(s).`)
        }
      } finally {
        setUploading(false)
      }
    },
    [maxImages, value, onChange, uploadFile]
  )

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length > 0) addFiles(files)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files))
      e.target.value = "" // permite reenviar o mesmo arquivo
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(e.clipboardData.items)
    const files = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null)
    if (files.length > 0) {
      e.preventDefault()
      addFiles(files)
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  const canAddMore = value.length < maxImages

  return (
    <div className="space-y-3">
      <div
        onClick={() => canAddMore && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        className={`
          relative rounded-xl border-2 border-dashed p-6 text-center transition-colors outline-none
          ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-gray-300 bg-gray-50"}
          ${canAddMore ? "cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 focus:border-emerald-400" : "cursor-not-allowed opacity-60"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={!canAddMore || uploading}
        />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-emerald-600" />
          )}
          <p className="text-sm font-medium text-gray-800">
            {uploading
              ? "Enviando imagem..."
              : canAddMore
              ? "Arraste, clique ou cole um print aqui"
              : `Limite de ${maxImages} imagens atingido`}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <ClipboardPaste className="w-3 h-3" />
            Dica: tire um print (PrintScreen) e pressione Ctrl+V aqui
          </p>
          <p className="text-xs text-gray-400">PNG, JPG ou WEBP até 5MB • máx. {maxImages} imagens</p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {value.map((img, idx) => (
            <div key={`${img.url}-${idx}`} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
              <Image
                src={img.url}
                alt={`Anexo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 300px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md opacity-90 hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> {idx + 1}/{maxImages}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
