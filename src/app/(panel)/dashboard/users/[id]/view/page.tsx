"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Phone, User as UserIcon, Calendar, CreditCard, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  createdAt?: string;
}

export default function ViewUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const router = useRouter();

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
              Visualizar Usuário
            </h1>
            <p className="text-gray-600 mt-1">
              Detalhes completos do usuário
            </p>
          </div>
          <div className="flex gap-3">
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
            <Button
              asChild
              className={cn(
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700"
              )}
            >
              <Link href={`/dashboard/users/${user.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-emerald-200 shadow-md">
                <Image
                  src={user.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiMwRDhBQkMiLz4KPHBhdGggZD0iTTQ4IDQ4QzUzLjUyMjggNDggNTggNDMuNTIyOCA1OCAzOEM1OCAzMi40NzcyIDUzLjUyMjggMjggNDggMjhDNDIuNDc3MiAyOCAzOCAzMi40NzcyIDM4IDM4QzM4IDQzLjUyMjggNDIuNDc3MiA0OCA0OCA0OFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+Cg=="}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <UserIcon className="w-4 h-4" />
                <span>ID: {user.id.slice(-8)}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-center">
                <Badge
                  variant={user.status ? "default" : "secondary"}
                  className={cn(
                    "text-sm px-4 py-1",
                    user.status
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                      : "bg-gray-400"
                  )}
                >
                  {user.status ? "✓ Ativo" : "✗ Inativo"}
                </Badge>
              </div>
              {user.createdAt && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2 border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-5 h-5 text-emerald-600" />
                Informações Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      Nome Completo
                    </label>
                    <p className="text-lg font-medium bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      {user.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Email
                    </label>
                    <p className="text-lg bg-gray-50 px-3 py-2 rounded border border-gray-200 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      Telefone
                    </label>
                    <p className="text-lg bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      {user.phone || "Não informado"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Status da Conta
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      <Badge
                        variant={user.status ? "default" : "secondary"}
                        className={cn(
                          "text-sm px-3 py-1",
                          user.status
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                            : "bg-gray-400"
                        )}
                      >
                        {user.status ? "✓ Ativo" : "✗ Inativo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Plano de Assinatura
                    </label>
                    <p className="text-lg font-medium bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 rounded border border-emerald-200">
                      {user.subscription?.plan || "Nenhum plano ativo"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      ID do Usuário
                    </label>
                    <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded border border-gray-200 break-all">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-5 h-5 text-emerald-600" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4">
              <Button
                variant="outline"
                asChild
                className="border-emerald-300 hover:bg-emerald-50"
              >
                <Link href={`/dashboard/users/${user.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Informações
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-blue-300 hover:bg-blue-50"
              >
                <Link href={`mailto:${user.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}