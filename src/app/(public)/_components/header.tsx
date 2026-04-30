// src/app/(public)/_components/header.tsx
"use client"

import { useState, useEffect } from 'react'
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../../../components/ui/button";
import { LogIn, Menu } from "lucide-react";
import { useSession } from 'next-auth/react'
import { handleRegister } from '../_actions/login'
import logoImg from '../../../../public/logo-odonto.png'
import Image from "next/image";

export function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin() {
    await handleRegister("google")
  }

  const NavLinks = () => (
    <>
      {/* ✅ NOVOS LINKS */}
      <Link
        href="/"
        className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
      >
        Sou paciente
      </Link>

      {mounted && (
        <>
          {status === 'loading' ? (
            <></>
          ) : session ? (
            <Link
              href="/dashboard"
              className='bg-gradient-to-r flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors'>
              Acessar Perfil
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg">
                Sou Profissional
              </Button>
            </Link>
          )}
        </>
      )}
    </>
  )

  return (
    <header className="fixed top-0 right-0 left-0 z-[999] py-4 px-6 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold text-zinc-900">
          <Image 
            src={logoImg}
            alt="Logo BaseMedical"
            priority
            quality={100}
            style={{
              width: '140px',
              height: '40px',
            }}
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <NavLinks />
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              className="text-black hover:bg-transparent"
              variant="ghost"
              size="icon"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[240px] sm:w-[300px] z-[9999]">
            <SheetTitle>Menu</SheetTitle>
            <SheetHeader></SheetHeader>
            <SheetDescription>
              Bem-vindo ao BaseMedical
            </SheetDescription>
            <nav className='flex flex-col space-y-4 mt-6'>
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}