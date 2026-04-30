"use client";

import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Search, Filter, Users, Loader2, ChevronLeft, ChevronRight, MoreVertical, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminBanner } from "../../_components/admin-banner";

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

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, search, statusFilter, planFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        status: statusFilter,
        plan: planFilter,
      });

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        fetchUsers();
        toast.success("Usuário excluído com sucesso!");
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao excluir usuário: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao excluir usuário");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePlanFilter = (value: string) => {
    setPlanFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-4 md:space-y-6">
        <AdminBanner />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
              Profissionais
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Visualize e gerencie todos os profissionais cadastrados no sistema
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="w-5 h-5 text-emerald-600" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 h-11 border-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>      {/* ✅ String "true" */}
                  <SelectItem value="false">Inativo</SelectItem>    {/* ✅ String "false" */}
                </SelectContent>
              </Select>

              {/* Plan Filter */}
              <Select value={planFilter} onValueChange={handlePlanFilter}>
                <SelectTrigger className="w-full sm:w-40 h-11 border-gray-300">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Planos</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PROFESSIONAL">Profissional</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select value={pagination.limit.toString()} onValueChange={(value) => handleLimitChange(parseInt(value))}>
                <SelectTrigger className="w-full sm:w-32 h-11 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="25">25 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                  <SelectItem value="100">100 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Table Card */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                Profissionais
              </CardTitle>
              <div className="text-xs md:text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                {pagination.total} usuário(s) encontrado(s)
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-lg font-medium text-gray-400">
                  Nenhum usuário encontrado
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-emerald-50/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-100 shrink-0">
                          <Image
                            src={user.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwRDhBQkMiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuMjM4NiAyMCAyMCAyMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+"}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 truncate mt-0.5">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </p>
                              {user.phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  {user.phone}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/users/${user.id}/view`}>
                                    <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                    Visualizar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/users/${user.id}/edit`}>
                                    <Edit className="w-4 h-4 mr-2 text-emerald-600" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge
                              variant={user.status ? "default" : "secondary"}
                              className={cn(
                                "text-xs",
                                user.status
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                  : "bg-gray-400"
                              )}
                            >
                              {user.status ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge variant="outline" className="border-emerald-300 text-xs">
                              {user.subscription?.plan || "Nenhum"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block overflow-x-auto px-4 lg:px-6">
                  <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-200">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Imagem</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                        <TableHead className="font-semibold text-gray-700">Email</TableHead>
                        <TableHead className="font-semibold text-gray-700">Telefone</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Plano</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className={cn(
                            "hover:bg-emerald-50 transition-colors",
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          )}
                        >
                          <TableCell>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100">
                              <Image
                                src={user.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwRDhBQkMiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuMjM4NiAyMCAyMCAyMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+"}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell className="text-gray-600">{user.phone}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={user.status ? "default" : "secondary"}
                              className={cn(
                                user.status
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                  : "bg-gray-400"
                              )}
                            >
                              {user.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-emerald-300">
                              {user.subscription?.plan || "Nenhum"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                              >
                                <Link href={`/dashboard/users/${user.id}/view`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400"
                              >
                                <Link href={`/dashboard/users/${user.id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pagination.page > 1 && handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        <div className="text-sm font-medium text-gray-700 px-3">
                          Página {pagination.page} de {pagination.totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pagination.page < pagination.totalPages && handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                          className="border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          Próxima
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}