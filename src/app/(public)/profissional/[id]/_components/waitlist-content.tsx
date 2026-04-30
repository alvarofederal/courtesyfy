// src/app/(public)/profissional/[id]/_components/waitlist-content.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Header } from "@/app/(public)/_components/header";
import { Footer } from "@/app/(public)/_components/footer";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";

interface WaitlistContentProps {
    professional: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        specialty: string | null;
        presentation: string | null;
    };
}

export function WaitlistContent({ professional }: WaitlistContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // ✅ Verificar se veio da busca
    useEffect(() => {
        const fromSearch = searchParams.get('from') === 'search';
        setShowBackButton(fromSearch);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Preencha todos os campos");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/waitlist/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    professionalId: professional.id,
                    ...formData,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao entrar na lista de espera");
            }

            setSubmitted(true);
            toast.success("Você foi adicionado à lista de espera!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao entrar na lista de espera");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                
                <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 pt-24">
                    <Card className="w-full max-w-md border-emerald-200 shadow-lg">
                        <CardContent className="pt-12 pb-12 text-center">
                            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Você está na lista! ✅
                            </h2>
                            <p className="text-gray-600">
                                {professional.name} entrará em contato em breve.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4 pt-24">
                <div className="max-w-6xl mx-auto pt-1">
                    {/* ✅ Botão Voltar - DENTRO do container max-w */}
                    {showBackButton && (
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium group mb-6"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Voltar para resultados
                        </button>
                    )}

                    <div className="space-y-6">
                    {/* Header */}
                    <Card className="border-emerald-200 shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                {professional.image && (
                                    <Image
                                        src={professional.image}
                                        alt={professional.name || "Profissional"}
                                        width={100}
                                        height={100}
                                        className="rounded-full border-4 border-emerald-500"
                                    />
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {professional.name}
                                    </h1>
                                    {professional.specialty && (
                                        <p className="text-lg text-emerald-600 mt-1">
                                            {professional.specialty}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Apresentação */}
                    {professional.presentation && (
                        <Card className="border-emerald-200 shadow-lg">
                            <CardContent className="pt-6">
                                <p className="text-gray-700 text-center leading-relaxed">
                                    {professional.presentation}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Formulário de Lista de Espera */}
                    <Card className="border-emerald-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <ClipboardList className="h-6 w-6 text-emerald-600" />
                                Entre na Lista de Espera
                            </CardTitle>
                            <CardDescription className="text-base">
                                Deixe seus dados e entraremos em contato quando houver disponibilidade
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nome Completo *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Seu nome"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Telefone *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="(00) 00000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        "Entrar na Lista de Espera"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    {/* ✅ FORMULÁRIO DE AVALIAÇÃO */}
                    <div className="max-w-6xl mx-auto pt-6">
                        <ReviewForm 
                            professionalId={professional.id}
                            professionalName={professional.name || "Profissional"}
                        />
                    </div>

                    {/* ✅ LISTA DE AVALIAÇÕES APROVADAS */}
                    <div className="max-w-6xl mx-auto pt-6">
                        <ReviewList 
                            professionalId={professional.id}
                            professionalName={professional.name || "Profissional"}
                        />
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
    );
}