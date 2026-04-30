// src/app/(public)/_components/search-trigger.tsx
"use client"

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SearchModal } from './search-modal';

export function SearchTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group w-full max-w-xl bg-white border-3 border-gray-400 rounded-full px-6 py-4 flex items-center gap-3 hover:border-emerald-500 hover:shadow-lg transition-all duration-300"
      >
        <Search className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
          Buscar profissional, especialidade ou local...
        </span>
      </button>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}