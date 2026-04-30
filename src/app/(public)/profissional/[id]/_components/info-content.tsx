// src/app/(public)/profissional/[id]/_components/info-content.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Briefcase, Award, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Header } from "@/app/(public)/_components/header";
import { Footer } from "@/app/(public)/_components/footer";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";

// 🔥 Interface atualizada com phone e contact
interface InfoContentProps {
    professional: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        phone: string | null;
        specialty: string | null;
        registration: string | null;
        presentation: string | null;
        addresses: Array<{           // 🔥 MUDOU de string[] para objeto[]
            address: string;
            phone: string | null;     // 🔥 NOVO
            contact: string | null;   // 🔥 NOVO
        }>;
        typeProfile: string | null;
        subscription?: {
            plan: string;
        } | null;
    };
}

export function InfoContent({ professional }: InfoContentProps) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [showBackButton, setShowBackButton] = useState(false);

    // Determinar limite baseado no PLANO
    const plan = professional.subscription?.plan || 'FREE';
    
    let maxAddresses = 1;
    if (plan === 'PROFESSIONAL') {
        maxAddresses = 10;
    }
    
    const totalAddresses = professional.addresses.length;
    const addressesToShow = professional.addresses.slice(0, maxAddresses);
    const hasMoreAddresses = totalAddresses > maxAddresses;

    useEffect(() => {
        const fromSearch = searchParams.get('from') === 'search';
        setShowBackButton(fromSearch);
    }, [searchParams]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4 pt-24">
                <div className="max-w-6xl mx-auto pt-1">
                    {/* Botão Voltar */}
                    {showBackButton && (
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium group mb-6"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Voltar para resultados
                        </button>
                    )}

                    <div className="space-y-8">
                        {/* Header com foto e nome */}
                        <Card className="border-emerald-200 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {professional.image && (
                                        <Image
                                            src={professional.image}
                                            alt={professional.name || "Profissional"}
                                            width={150}
                                            height={150}
                                            className="rounded-full border-4 border-emerald-500"
                                        />
                                    )}
                                    <div className="flex-1 text-center md:text-left">
                                        <h1 className="text-4xl font-bold text-gray-900">
                                            {professional.name}
                                        </h1>
                                        {professional.specialty && (
                                            <p className="text-xl text-emerald-600 mt-2 flex items-center justify-center md:justify-start gap-2">
                                                <Briefcase className="h-5 w-5" />
                                                {professional.specialty}
                                            </p>
                                        )}
                                        {professional.registration && (
                                            <p className="text-sm text-gray-600 mt-1 flex items-center justify-center md:justify-start gap-2">
                                                <Award className="h-4 w-4" />
                                                {professional.registration}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Apresentação */}
                        {professional.presentation && (
                            <Card className="border-emerald-200 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                                    <CardTitle className="text-2xl">Sobre o Profissional</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {professional.presentation}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* ✅ Informações de Contato - ATUALIZADO COM PHONE E CONTACT */}
                        {addressesToShow && addressesToShow.length > 0 && (
                            <Card className="border-emerald-200 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <MapPin className="h-6 w-6 text-emerald-600" />
                                        Informações de Contato
                                        
                                        <span className="ml-auto text-sm font-normal px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                            {addressesToShow.length} / {maxAddresses} {plan === 'PROFESSIONAL' ? 'locais' : 'local'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-6">
                                        {addressesToShow.map((addressData, index) => (
                                            <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                                                {/* Endereço */}
                                                <div className="mb-3">
                                                    <p className="text-sm font-semibold text-gray-600 mb-1">
                                                        📍 Endereço {addressesToShow.length > 1 ? `${index + 1}` : ''}:
                                                    </p>
                                                    <p className="text-gray-900">{addressData.address}</p>
                                                </div>

                                                {/* 🔥 NOVO: Telefone de Contato */}
                                                <div className="mb-3">
                                                    <p className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        Telefone:
                                                    </p>
                                                    {addressData.phone ? (
                                                        <p className="text-gray-900">{addressData.phone}</p>
                                                    ) : (
                                                        <p className="text-gray-500 italic text-sm">Não informado</p>
                                                    )}
                                                </div>

                                                {/* 🔥 NOVO: Pessoa de Contato (opcional) */}
                                                {addressData.contact && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-600 mb-1">
                                                            👤 Responsável:
                                                        </p>
                                                        <p className="text-gray-900">{addressData.contact}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Aviso baseado no plano */}
                                        {hasMoreAddresses && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm text-gray-800">
                                                    <span className="font-semibold">💎 Este profissional tem {totalAddresses} locais de atendimento cadastrados.</span>
                                                    <br />
                                                    {plan === 'FREE' && (
                                                        <span className="text-yellow-700">
                                                            Plano Free exibe apenas {maxAddresses} endereço. 
                                                            {totalAddresses - maxAddresses} endereço(s) adicional(is) disponível(is) com upgrade.
                                                        </span>
                                                    )}
                                                    {plan === 'PROFESSIONAL' && totalAddresses > 10 && (
                                                        <span className="text-orange-700">
                                                            Exibindo os primeiros {maxAddresses} endereços (limite do plano Professional).
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Formulário de Avaliação */}
                        <div className="max-w-6xl mx-auto pt-6">
                            <ReviewForm 
                                professionalId={professional.id}
                                professionalName={professional.name || "Profissional"}
                            />
                        </div>

                        {/* Lista de Avaliações */}
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