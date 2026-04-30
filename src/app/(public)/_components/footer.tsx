// src/app/(public)/_components/footer.tsx
"use client"

import { VersionDisplay } from "@/components/version-display";

export function Footer() {
  return (
    <section className="relative">
      <footer className="py-6 text-center text-gray-500 text-sm md:text-base" id="footer">
        <p>
          Todos direitos reservados © {new Date().getFullYear()} - <span className="hover:text-black duration-300">@technologyweb</span>
        </p>
      </footer>

      {/* ✅ VERSÃO NO CANTINHO DIREITO */}
      <div className="absolute bottom-2 right-4">
        <VersionDisplay />
      </div>
    </section>
  )
}