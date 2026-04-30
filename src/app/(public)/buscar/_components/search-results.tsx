// src/app/(public)/buscar/_components/search-results.tsx
"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';

interface Professional {
  id: string;
  name: string;
  urlNameProfessional: string;
  image: string | null;
  specialty: string | null;
  presentation: string | null;
  profession: {
    name: string;
  } | null;
  addresses: {
    address: string;
  }[];
}

interface SearchData {
  professionals: Professional[];
  total: number;
  query: string;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
    
    if (query) {
      fetchResults(query);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchResults = async (query: string) => {
    setLoading(true);
    setNotFound(false);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      setData(result);
      
      if (result.total === 0) {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header de busca */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para início
          </Link>

          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por profissional, especialidade ou localização..."
                className="pl-12 pr-4 h-14 text-base md:text-lg border-2 border-emerald-200 focus:border-emerald-500 rounded-full shadow-sm bg-white"
              />
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-600 font-medium">Buscando profissionais...</p>
          </div>
        )}

        {/* Resultados */}
        {!loading && data && data.total > 0 && (
          <>
            <div className="mb-6 pb-3 border-b-2 border-emerald-200">
              <p className="text-gray-700 font-medium text-sm md:text-base">
                Encontramos <span className="text-emerald-600 font-bold">{data.total}</span> profissional{data.total !== 1 ? 'is' : ''} para "{data.query}"
              </p>
            </div>

            <div className="space-y-6">
              {data.professionals.map((professional) => {
                const profileUrl = `https://basemedical.vercel.app/profissional/${professional.urlNameProfessional}`;
                
                return (
                  <div 
                    key={professional.id} 
                    className="flex flex-col md:flex-row md:gap-4 pb-6 border-b border-gray-200 last:border-b-0"
                  >
                    {/* ✅ MOBILE: Imagem no TOPO */}
                    <Link 
                      href={`/profissional/${professional.urlNameProfessional}?from=search`} target='_blank'
                      className="md:hidden mb-4"
                    >
                      <div className="w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 shadow-md">
                        {professional.image ? (
                          <Image
                            src={professional.image}
                            alt={professional.name}
                            width={400}
                            height={192}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-emerald-600">
                              {professional.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Conteúdo */}
                    <div className="flex-1 flex flex-col justify-center">
                      {/* URL clicável */}
                      <Link 
                        href={`/profissional/${professional.urlNameProfessional}?from=search`} target='_blank'
                        className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 mb-1 truncate block"
                      >
                        {profileUrl}
                      </Link>

                      {/* Nome (link) */}
                      <Link href={`/profissional/${professional.urlNameProfessional}?from=search`} target='_blank'>
                        <h3 className="text-xl md:text-2xl font-bold text-blue-700 hover:underline line-clamp-1 mb-2">
                          {professional.name}
                        </h3>
                      </Link>

                      {/* Especialidade e Profissão */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {professional.profession && (
                          <span className="text-xs md:text-sm text-gray-700 font-medium">
                            {professional.profession.name}
                          </span>
                        )}
                        {professional.profession && professional.specialty && (
                          <span className="text-gray-400">·</span>
                        )}
                        {professional.specialty && (
                          <span className="text-xs md:text-sm text-emerald-600 font-semibold">
                            {professional.specialty}
                          </span>
                        )}
                      </div>

                      {/* Descrição (2 linhas) */}
                      {professional.presentation && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {professional.presentation}
                        </p>
                      )}

                      {/* Endereço */}
                      {professional.addresses.length > 0 && (
                        <div className="flex items-start gap-1.5 text-xs md:text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{professional.addresses[0].address}</span>
                        </div>
                      )}
                    </div>

                    {/* ✅ DESKTOP: Imagem à DIREITA */}
                    <Link 
                      href={`/profissional/${professional.urlNameProfessional}?from=search`} target='_blank'
                      className="hidden md:block flex-shrink-0"
                    >
                      <div className="w-[180px] h-[180px] rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 shadow-md hover:shadow-xl transition-shadow">
                        {professional.image ? (
                          <Image
                            src={professional.image}
                            alt={professional.name}
                            width={180}
                            height={180}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-emerald-600">
                              {professional.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Sem resultados */}
        {!loading && notFound && (
          <div className="py-12">
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 md:p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-red-700 mb-2">
                    Nenhum resultado encontrado
                  </h2>
                  <p className="text-sm md:text-base text-red-600 mb-4">
                    Não encontramos profissionais para <span className="font-semibold">"{data?.query}"</span>
                  </p>
                  <div className="text-sm text-gray-700 space-y-2 bg-white p-4 rounded-lg border border-red-200">
                    <p className="font-semibold text-gray-900">Sugestões:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Verifique a ortografia das palavras</li>
                      <li>Tente palavras-chave diferentes ou mais genéricas</li>
                      <li>Busque por especialidade (ex: "Dentista", "Ortodontia")</li>
                      <li>Busque por localização (ex: "São Paulo", "Centro")</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}