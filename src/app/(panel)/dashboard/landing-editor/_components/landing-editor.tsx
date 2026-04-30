"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Upload, Eye, Image as ImageIcon, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminBanner } from "../../_components/admin-banner";

interface LandingEditorProps {
  initialContent: {
    id: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string | null;
  } | null;
}

export function LandingEditor({ initialContent }: LandingEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: initialContent?.heroTitle || "",
    heroSubtitle: initialContent?.heroSubtitle || "",
    heroImage: initialContent?.heroImage || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const data = await response.json();
      
      setFormData(prev => ({ ...prev, heroImage: data.imageUrl }));
      toast.success("Imagem enviada com sucesso!");

    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.heroTitle || !formData.heroSubtitle) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/landing-page/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      toast.success("Conteúdo salvo! Clique em 'Forçar Atualização' para ver as mudanças.");
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar conteúdo");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVA FUNÇÃO
  const handleForceRevalidate = async () => {
    setRevalidating(true);

    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar");
      }

      toast.success("✅ Cache atualizado! Abra a página inicial em nova aba para ver as mudanças.");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao forçar atualização");
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        <AdminBanner />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-emerald-600" />
              Editor da Landing Page
            </h1>
            <p className="text-gray-600 mt-1">
              Personalize o conteúdo da página inicial
            </p>
          </div>
          <div className="flex gap-2">
            {/* ✅ BOTÃO NOVO */}
            <Button
              onClick={handleForceRevalidate}
              disabled={revalidating}
              variant="outline"
              className="gap-2"
            >
              {revalidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Forçar Atualização
                </>
              )}
            </Button>
            <Button
              onClick={() => window.open("/", "_blank")}
              variant="outline"
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Visualizar Site
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ... resto do código igual ... */}
          
          {/* Formulário */}
          <div className="space-y-6">
            {/* Título */}
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle>Seção Hero - Título</CardTitle>
                <CardDescription>
                  Título principal que aparece no topo da página
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Título Principal *</Label>
                  <Textarea
                    id="heroTitle"
                    placeholder="Encontre os melhores profissionais..."
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.heroTitle.length} caracteres
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Subtítulo */}
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle>Seção Hero - Subtítulo</CardTitle>
                <CardDescription>
                  Descrição que aparece abaixo do título
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtítulo *</Label>
                  <Textarea
                    id="heroSubtitle"
                    placeholder="Nós somos uma plataforma..."
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.heroSubtitle.length} caracteres
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Imagem */}
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle>Seção Hero - Imagem</CardTitle>
                <CardDescription>
                  Imagem principal (será enviada para Cloudinary)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heroImage">Upload de Imagem</Label>
                    <Input
                      id="heroImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos: JPG, PNG, WEBP | Máx: 5MB
                    </p>
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando para Cloudinary...
                    </div>
                  )}

                  {formData.heroImage && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border-2 border-emerald-200">
                      <Image
                        src={formData.heroImage}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Visualização em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 p-4 bg-white rounded-lg border">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {formData.heroTitle || "Título aparecerá aqui..."}
                    </h2>
                  </div>

                  <div>
                    <p className="text-gray-600 leading-relaxed">
                      {formData.heroSubtitle || "Subtítulo aparecerá aqui..."}
                    </p>
                  </div>

                  {formData.heroImage && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                      <Image
                        src={formData.heroImage}
                        alt="Preview Hero"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}