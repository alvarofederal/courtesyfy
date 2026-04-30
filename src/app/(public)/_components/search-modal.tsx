// src/app/(public)/_components/search-modal.tsx
"use client"

import { useState, useEffect } from 'react';
import { Search, X, MapPin, Stethoscope, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    // Redirecionar para página de resultados
    router.push(`/buscar?q=${encodeURIComponent(searchTerm)}`);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-32 px-4"
      onClick={onClose}
    >
      {/* Overlay escurecido */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal de busca */}
      <div 
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Input de busca */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por profissional, especialidade ou localização..."
                className="flex-1 text-lg outline-none placeholder:text-gray-400"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Sugestões de busca */}
            <div className="p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">Exemplos de busca:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSearchTerm('Dentista')}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Stethoscope className="w-3 h-3" />
                  Dentista
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTerm('Ortodontia')}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Stethoscope className="w-3 h-3" />
                  Ortodontia
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTerm('São Paulo')}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  São Paulo
                </button>
              </div>
            </div>

            {/* Botão de buscar */}
            <div className="p-4 bg-white">
              <Button
                type="submit"
                disabled={!searchTerm.trim() || isSearching}
                className={cn(
                  "w-full h-12 text-base font-semibold",
                  "bg-gradient-to-r from-emerald-500 to-teal-600",
                  "hover:from-emerald-600 hover:to-teal-700",
                  "disabled:opacity-50"
                )}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Buscar Profissionais
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}