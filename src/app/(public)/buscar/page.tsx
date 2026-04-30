// src/app/(public)/buscar/page.tsx
import { Suspense } from 'react';
import { Header } from '../_components/header';
import { Footer } from '../_components/footer';
import { Loader2 } from 'lucide-react';
import { SearchResults } from './_components/search-results';

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="pt-20"> {/* Espaço para o header fixo */}
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}