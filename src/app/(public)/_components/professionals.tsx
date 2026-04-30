"use client"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Image from "next/image"
import fotoImg from '../../../../public/foto1.png'
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Prisma } from "@/generated/prisma"
import { PremiumCardBadge } from "./premmium-badge"
import { BasicCardBadge } from "./basic-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type UserWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true,
    addresses: true,  // ✅ Adicionar
  }
}>

interface ProfessionalsProps {
  professionals: UserWithSubscription[]
}

export function Professionals({ professionals }: ProfessionalsProps) {
  return (
    <section className="bg-gray-50 py-12 sm:py-16" id="profissionais">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {professionals.map((professional) => (
            <Card 
              key={professional.id}
              className="shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col p-0 py-0 px-0">
              <CardContent className="flex flex-col flex-1 p-0 py-0 px-0"> 
                <div className="relative aspect-[4/4] w-full rounded-t-lg overflow-hidden"> 
                  <Image
                    src={professional.image ?? fotoImg}
                    alt={`Foto de ${professional.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain"
                    priority={true} />
                  {/* Badges */}
                  <div className="absolute bottom-2 right-2 z-10 space-y-1">
                    {professional?.subscription?.status === "active" && professional?.subscription?.plan === "PROFESSIONAL" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PremiumCardBadge />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-gray-900 text-white">
                            <p>Plano Professional - Recursos premium</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {professional?.subscription?.status === "active" && professional?.subscription?.plan === "FREE" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BasicCardBadge />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-gray-900 text-white">
                            <p>Plano Basic - Essencial para começar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* Conteúdo: flex-grow só aqui pra empurrar botão */}
                <div className="p-6 space-y-3 flex flex-col flex-1"> {/* flex-1 cresce e empurra botão pro fundo */}
                  <div className="space-y-2 flex-grow-0"> {/* Sem grow aqui pra não expandir demais */}
                    <h3 className="font-bold text-lg text-gray-900">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {professional.addresses && professional.addresses.length > 0
                        ? professional.addresses[0].address + (professional.addresses.length > 1 ? ' ...' : '')
                        : "Endereço não informado."}
                    </p>
                  </div>

                  {/* Botão: sempre visível no fundo, full-width */}
                  <Link
                    href={`/profissional/${professional.urlNameProfessional ?? professional.id}`}
                    target="_blank"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center justify-center py-3 rounded-lg text-sm font-semibold transition-all duration-200 mt-auto" // mt-auto cola no fundo
                    aria-label={`Agendar horário com ${professional.name}`}>
                    Agendar horário
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {professionals.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">Nenhum profissional encontrado. Verifique os dados no banco.</p>
          </div>
        )}
      </div>
    </section>
  )
}