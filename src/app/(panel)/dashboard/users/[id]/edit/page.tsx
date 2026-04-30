"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, X, Loader2, User as UserIcon, Mail, Phone, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: boolean;
  subscription: {
    plan: string;
  } | null;
  image?: string;
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchUser();
    }
  }, [resolvedParams]);

  const fetchUser = async () => {
    if (!resolvedParams) return;

    try {
      const response = await fetch(`/api/users/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        notFound();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Erro ao carregar dados do usuário");
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !resolvedParams) return;

    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const status = formData.get("status") === "on";

    try {
      const response = await fetch(`/api/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, status }),
      });

      if (response.ok) {
        toast.success("Usuário atualizado com sucesso!");
        setTimeout(() => {
          router.push("/dashboard/users");
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao atualizar usuário: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserIcon className="w-8 h-8 text-emerald-600" />
              Editar Usuário
            </h1>
            <p className="text-gray-600 mt-1">
              Edite as informações do usuário {user.name}
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-emerald-300 hover:bg-emerald-50"
          >
            <Link href="/dashboard/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserIcon className="w-5 h-5 text-emerald-600" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    required
                    placeholder="Digite o nome completo"
                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={saving}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    placeholder="Digite o email"
                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={saving}
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={user.phone}
                    placeholder="Digite o telefone"
                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={saving}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Status da Conta
                  </Label>
                  <div className="flex items-center space-x-3 h-11">
                    <Switch
                      id="status"
                      name="status"
                      defaultChecked={user.status}
                      disabled={saving}
                    />
                    <Label htmlFor="status" className="text-sm font-medium">
                      {user.status ? "Conta Ativa" : "Conta Inativa"}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Desative para bloquear o acesso do usuário ao sistema
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-0 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "flex-1 h-12 text-base font-semibold",
                    "bg-gradient-to-r from-emerald-500 to-teal-600",
                    "hover:from-emerald-600 hover:to-teal-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={saving}
                  className="h-12 border-gray-300 hover:bg-gray-50"
                >
                  <Link href="/dashboard/users">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-5 h-5 text-emerald-600" />
              Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  ID do Usuário
                </Label>
                <p className="font-mono bg-gray-100 px-3 py-2 rounded border border-gray-200 text-sm">
                  {user.id}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Plano Atual
                </Label>
                <p className="bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 rounded border border-emerald-200 text-sm font-medium">
                  {user.subscription?.plan || "Nenhum plano ativo"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}