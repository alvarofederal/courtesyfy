"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Link2 } from "lucide-react";
import { updateProfileSlug } from "../_actions/update-profile-slug";

interface ProfileUrlFieldProps {
  userId: string;
  initialSlug: string | null;
  userName: string;
}

export function ProfileUrlField({ userId, initialSlug, userName }: ProfileUrlFieldProps) {
  const [slug, setSlug] = useState(initialSlug || "");
  const [loading, setLoading] = useState(false);

  const profileUrl = `${process.env.NEXT_PUBLIC_URL}/profissional/${slug}`;

  const handleSave = async () => {
    if (!slug.trim()) {
      toast.error("Digite uma URL");
      return;
    }

    setLoading(true);

    const result = await updateProfileSlug(slug);

    if (result.success) {
      toast.success("URL atualizada!");
      if (result.slug) {
        setSlug(result.slug);
      }
    } else {
      toast.error(result.error || "Erro ao atualizar");
    }

    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-emerald-600" />
        URL do Perfil de Agendamento
      </Label>
      
      <div className="flex gap-2">
        <div className="flex-1 flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
            /profissional/
          </span>
          <Input
            value={slug}
            onChange={(e) => {
              const value = e.target.value
                .toLowerCase()
                .replace(/[^a-z-]/g, ''); // Apenas letras e hífens
              setSlug(value);
            }}
            placeholder="seu-nome"
            className="rounded-l-none h-11"
            disabled={loading}
          />
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={loading || !slug.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 h-11"
        >
          {loading ? "..." : "Salvar"}
        </Button>

        <Button
          type="button"
          onClick={copyLink}
          variant="outline"
          disabled={!slug}
          className="h-11 w-11 p-0"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      {slug && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-xs text-emerald-700 font-medium mb-1">
            Seu link de agendamento:
          </p>
          
        <a href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:underline break-all"
          >
            {profileUrl}
          </a>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Apenas letras minúsculas e hífens • Mínimo 3 caracteres
      </p>
    </div>
  );
}