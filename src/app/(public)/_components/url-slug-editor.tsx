"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateUrlSlug, generateSuggestedSlug } from "../_actions/update-url-slug";
import { toast } from "sonner";
import { Link2, Check, AlertCircle, Copy } from "lucide-react";

interface UrlSlugEditorProps {
  initialSlug: string | null;
  userName: string;
}

export function UrlSlugEditor({ initialSlug, userName }: UrlSlugEditorProps) {
  const [slug, setSlug] = useState(initialSlug || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const profileUrl = `${process.env.NEXT_PUBLIC_URL}/profissional/${slug}`;

  const handleUpdate = async () => {
    if (!slug.trim()) {
      setError("Digite uma URL personalizada");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await updateUrlSlug(slug);

    if (result.success) {
      toast.success("URL personalizada atualizada!");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Erro ao atualizar");
      toast.error(result.error);
    }

    setLoading(false);
  };

  const handleGenerateSuggestion = async () => {
    setLoading(true);
    const suggestion = await generateSuggestedSlug();
    if (suggestion) {
      setSlug(suggestion);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
          <Link2 className="w-4 h-4 text-emerald-600" />
          URL Personalizada do Perfil
        </Label>
        <p className="text-sm text-gray-500 mb-3">
          Personalize sua URL de agendamento. Deve conter apenas letras minúsculas e hífens, baseado no seu nome.
        </p>

        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {process.env.NEXT_PUBLIC_URL}/profissional/
              </span>
              <Input
                value={slug}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z-]/g, '');
                  setSlug(value);
                  setError("");
                }}
                placeholder="seu-nome"
                className="rounded-l-none"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <Check className="w-3 h-3" />
                URL atualizada com sucesso!
              </div>
            )}
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading || !slug.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>

          <Button
            onClick={handleGenerateSuggestion}
            variant="outline"
            disabled={loading}
          >
            Sugerir
          </Button>
        </div>
      </div>

      {slug && !error && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium mb-1">
                Seu link de agendamento:
              </p>
              
            <a href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline text-sm"
            >
                {profileUrl}
              </a>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}