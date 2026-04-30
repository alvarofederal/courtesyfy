// src/app/(public)/_components/hero.tsx
import Image from "next/image";
import doctorImg from '../../../../public/doctor-hero.png'
import { Sparkles, Calendar, Shield, Clock } from "lucide-react";
import { SearchTrigger } from "./search-trigger";

interface HeroProps {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
}

export function Hero({ heroTitle, heroSubtitle, heroImage }: HeroProps) {
  const customImage = heroImage && heroImage.trim() !== "" ? heroImage : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-[102vh]" id="home">
      {/* Imagem de fundo - ✅ OPACIDADE REDUZIDA */}
      <div className="absolute inset-0 z-0">
        {customImage ? (
          <div 
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: `url(${customImage})`,
              backgroundSize: '80%',
              backgroundPosition: 'left 30%',
              opacity: 0.11, // ✅ REDUZIDO de 0.18 para 0.11 (~40% menos)
              filter: 'blur(0.5px)',
            }}
          />
        ) : (
          <div 
            className="absolute inset-0"
            style={{
              opacity: 0.11, // ✅ REDUZIDO de 0.18 para 0.11 (~40% menos)
              filter: 'blur(0.5px)',
            }}
          >
            <Image
              src={doctorImg}
              alt="Background"
              fill
              className="object-cover"
              style={{ 
                objectPosition: 'left 30%',
                transform: 'scale(1.4)'
              }}
              quality={100}
              priority
            />
          </div>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 min-h-[102vh] flex items-center">
        <main className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
          {/* Texto */}
          <article className="flex-1 max-w-2xl space-y-8 text-center lg:text-left">
            {/*<div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Plataforma #1 para profissionais de saúde
            </div>*/}

            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              {heroTitle}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              {heroSubtitle}
            </p>

            {/* CAMPO DE BUSCA */}
            <SearchTrigger />

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Agendamento fácil</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Disponível 24 horas</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">100% Seguro</span>
              </div>
            </div>
          </article>

          {/* Imagem principal - ✅ FUNDO BRANCO ADICIONADO */}
          <div className="relative w-full lg:w-auto">
            <div className="relative w-full max-w-[476px] mx-auto h-[560px]">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-20" />
              
              {/* ✅ FUNDO BRANCO AQUI */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full bg-white">
                {customImage ? (
                  <img
                    src={customImage}
                    alt="Profissional de saúde"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <Image
                    src={doctorImg}
                    alt="Profissional de saúde"
                    fill
                    sizes="476px"
                    className="object-cover"
                    quality={100}
                    priority
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}