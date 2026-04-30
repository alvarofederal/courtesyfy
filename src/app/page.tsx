// src/app/page.tsx
import { Footer } from "./(public)/_components/footer";
import { Header } from "./(public)/_components/header";
import { Hero } from "./(public)/_components/hero";
import { Professionals } from "./(public)/_components/professionals";
import { getProfessionals } from "./(public)/_data_access/get-professionals";
import { getLandingContent } from "./(public)/_data_access/get-landing-content"; // ✅ Adicionar
import { SpeedInsights } from "@vercel/speed-insights/next"

export const revalidate = 120;

export default async function Home() {
  const [professionals, landingContent] = await Promise.all([
    getProfessionals(),
    getLandingContent(), // ✅ Buscar conteúdo
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div>
        <Hero 
          heroTitle={landingContent.heroTitle}
          heroSubtitle={landingContent.heroSubtitle}
          heroImage={landingContent.heroImage}
        />
        <Professionals professionals={professionals || []} />
        <Footer />
        <SpeedInsights />
      </div>
    </div>
  )
}