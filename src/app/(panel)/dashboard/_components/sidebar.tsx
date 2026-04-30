"use client"

import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Banknote, 
  CalendarCheck2, 
  ChevronLeft, 
  ChevronRight, 
  Folder, 
  FolderKanban, 
  List, 
  LucideSquareChevronDown, 
  Settings, 
  Users,
  Eye,
  ClipboardList,
  ImageIcon,
  MessageSquare,
  Text,
  ScrollText,
  LucideCalendarCheck2,
  Car,
  LucideCircleGauge,
  ClipboardClock,
  LucideBookUser,
  LucideFileCode2,
  Gift,
  Bell,
  Sparkles,
  LogOut
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logoImg from '../../../../../public/logo-odonto.png';
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useSession, signOut } from "next-auth/react";
import { handleLogout } from "@/app/_actions/auth";

export  function SidebarDashboard({children}: Readonly<{children?: React.ReactNode}>) {

    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { data: session } = useSession();
    const [pendingReviews, setPendingReviews] = useState(0); // ✅ ADICIONAR
    const [pendingTickets, setPendingTickets] = useState(0);
    const [pendingEligibles, setPendingEligibles] = useState(0); // 🎁 cortesias elegiveis
    const [myCourtesy, setMyCourtesy] = useState<{ active: boolean; daysLeft: number | null }>({ active: false, daysLeft: null });

    const user = session?.user;
    const typeProfile = user?.typeProfile;

    // ✅ Buscar pendingReviews via useEffect
    useEffect(() => {
        if (user?.id) {
            fetch(`/api/reviews/moderation/count?userId=${user.id}`)
                .then(res => res.json())
                .then(data => setPendingReviews(data.pending || 0))
                .catch(err => console.error('Erro ao buscar reviews:', err));

            const fetchTickets = () => {
                fetch(`/api/tickets/count`)
                    .then(res => res.json())
                    .then(data => setPendingTickets(data.pending || 0))
                    .catch(err => console.error('Erro ao buscar chamados:', err));
            };
            const fetchEligibles = () => {
                fetch(`/api/admin/courtesies/eligible-count`)
                    .then(res => res.json())
                    .then(data => setPendingEligibles(data.pending || 0))
                    .catch(() => {});
            };
            const fetchMyCourtesy = () => {
                fetch(`/api/users/me/courtesy-status`)
                    .then(res => res.json())
                    .then(data => setMyCourtesy({ active: !!data.active, daysLeft: data.daysLeft ?? null }))
                    .catch(() => {});
            };
            fetchTickets();
            fetchEligibles();
            fetchMyCourtesy();
            const interval = setInterval(() => { fetchTickets(); fetchEligibles(); fetchMyCourtesy(); }, 60000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    // ✅ Definir links baseado no perfil
    const getMenuLinks = () => {
        const baseLinks = [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: <LucideCircleGauge className='w-6 h-6' />,
                profiles: ["TOTAL", "INFO", "WAITLIST"]
            },
        ];

        const profileSpecificLinks = {
            TOTAL: [
                {
                    href: "/dashboard/my-schedule",
                    label: "Minha agenda",
                    icon: <LucideSquareChevronDown className='w-6 h-6' />,
                },
                {
                    href: "/dashboard/appointments",
                    label: "Meus agendamentos",
                    icon: <LucideCalendarCheck2 className='w-6 h-6' />,
                },
                {
                    href: "/dashboard/reports",
                    label: "Relatórios",
                    icon: <ScrollText className='w-6 h-6' />,
                },
                {
                    href: "/dashboard/reviews",
                    icon: <MessageSquare className='w-6 h-6' />, // ✅ CORRIGIR: adicionar JSX
                    label: "Comentários",
                    badge: pendingReviews > 0 ? pendingReviews : undefined // ✅ Badge com contador
                },
            ],
            INFO: [
                {
                    href: `/profissional/${user?.urlNameProfessional}`,
                    label: "Ver Perfil Público",
                    icon: <Eye className='w-6 h-6' />,
                    external: true,
                },
                {
                    href: "/dashboard/reviews",
                    icon: <MessageSquare className='w-6 h-6' />, // ✅ CORRIGIR
                    label: "Comentários",
                    badge: pendingReviews > 0 ? pendingReviews : undefined // ✅ Badge com contador
                },
            ],
            WAITLIST: [
                {
                    href: "/dashboard/waitlist",
                    label: "Lista de Espera",
                    icon: <ClipboardList className='w-6 h-6' />,
                },
                {
                    href: `/profissional/${user?.urlNameProfessional}`,
                    label: "Ver Perfil Público",
                    icon: <Eye className='w-6 h-6' />,
                    external: true,
                },
                {
                    href: "/dashboard/reviews",
                    icon: <MessageSquare className='w-6 h-6' />, // ✅ CORRIGIR
                    label: "Comentários",
                    badge: pendingReviews > 0 ? pendingReviews : undefined // ✅ Badge com contador
                },
            ],
        };

        const settingsLinks = user?.role === "ADMIN" ? [] : [
            // 🎁 Item visivel APENAS para profissionais com cortesia ativa
            ...(myCourtesy.active ? [{
                href: "/dashboard/minha-cortesia",
                label: "Minha Cortesia",
                icon: <Sparkles className='w-6 h-6' />,
                profiles: ["TOTAL", "INFO", "WAITLIST"],
                badge: myCourtesy.daysLeft != null && myCourtesy.daysLeft > 0
                    ? myCourtesy.daysLeft
                    : undefined,
            }] : []),
            {
                href: "/dashboard/profile",
                label: "Meu Perfil",
                icon: <Settings className='w-6 h-6' />,
                profiles: ["TOTAL", "INFO", "WAITLIST"]
            },
            {
                href: "/dashboard/plans",
                label: "Planos",
                icon: <Banknote className='w-6 h-6' />,
                profiles: ["TOTAL", "INFO", "WAITLIST"]
            },
        ];

        // Combinar links baseado no perfil
        const specificLinks = typeProfile ? profileSpecificLinks[typeProfile as keyof typeof profileSpecificLinks] || [] : [];
        
        return {
            panel: [...baseLinks, ...specificLinks],
            settings: settingsLinks,
        };
    };

    const menuLinks = getMenuLinks();

    return (
        <div className="flex min-h-screen w-full">

            <aside className={clsx("flex flex-col border-r bg-background transition-all duration-300 p-4 h-full", {
                "w-20": isCollapsed,
                "w-64": !isCollapsed,
                "hidden md:flex md:fixed": true
            })}>
            
                <div className="mb-6 mt-4">
                    {!isCollapsed && (
                        <>
                            <Image
                            src={logoImg}
                            alt="Logo BaseMedical"
                            priority
                            quality={100}
                            style={{
                                width: 'auto',
                                height: 'auto',
                            }}
                            />
                            <p className="text-sm text-gray-700 mt-2">Olá, {user?.name}</p>
                            {typeProfile && (
                                <p className="text-xs text-emerald-600 font-medium">
                                    Perfil: {typeProfile === "TOTAL" ? "Completo" : typeProfile === "INFO" ? "Informativo" : "Lista de Espera"}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <Button className='bg-gray-100 hover:bg-gray-50 text-zinc-900 self-end mb-2'
                    onClick={() => setIsCollapsed(!isCollapsed)}>
                    {!isCollapsed ? <ChevronLeft className='w-12 h-12' /> : <ChevronRight className='w-12 h-12' />}
                </Button>

                {/* Mostrar apenas quando a sidebar está recolhida */}
                {isCollapsed && (
                    <nav className="flex flex-col gap-1 overflow-hidden mt-2">
                        {menuLinks.panel.map((link) => (
                            <SidebarLink
                                key={link.href}
                                href={link.href}
                                label={link.label}
                                pathname={pathname}
                                isCollapsed={isCollapsed}
                                icon={link.icon}
                                external={(link as any).external}
                                badge={(link as any).badge} // ✅ ADICIONAR
                            />
                        ))}
                        {menuLinks.settings.map((link) => (
                            <SidebarLink
                                key={link.href}
                                href={link.href}
                                label={link.label}
                                pathname={pathname}
                                isCollapsed={isCollapsed}
                                icon={link.icon}
                            />
                        ))}
                        {user?.role === "ADMIN" && (
                            <>
                                <SidebarLink
                                    href="/dashboard"
                                    label="Dashboard"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<LucideCircleGauge className='w-6 h-6' />}
                                />
                                <SidebarLink
                                    href="/dashboard/users"
                                    label="Profissionais"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<Users className='w-6 h-6' />}
                                />
                                <SidebarLink
                                    href="/dashboard/courtesies"
                                    label="Cortesias"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<Gift className='w-6 h-6' />}
                                    badge={pendingEligibles > 0 ? pendingEligibles : undefined}
                                />
                                <SidebarLink
                                    href="/dashboard/services"
                                    label="Tipos de Atendimento"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<Car className='w-6 h-6' />}
                                />
                                <SidebarLink
                                    href="/dashboard/professions"
                                    label="Profissões"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<Folder className='w-6 h-6' />}
                                />
                                <SidebarLink
                                    href="/dashboard/metrics"
                                    label="Métricas"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<ClipboardClock className='w-6 h-6' />}
                                />
                                <SidebarLink
                                    href="/dashboard/issues"
                                    label="Chamados"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<FolderKanban className='w-6 h-6' />}
                                    badge={pendingTickets > 0 ? pendingTickets : undefined}
                                />
                                <SidebarLink
                                    href="/dashboard/landing-editor"
                                    label="Editor Landing Page"
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    icon={<ImageIcon className='w-6 h-6' />}
                                />                                   
                            </>
                        )}
                    </nav>
                )}

                <Collapsible className="mt-6" open={!isCollapsed}>
                    <CollapsibleContent>
                        <nav className="flex flex-col gap-1 overflow-hidden">
                            {!(user?.role === "ADMIN") && (
                                <>
                                    <span className="text-sm text-gray-400 font-medium mt-1 uppercase">
                                        Painel
                                    </span>
                                    {menuLinks?.panel.map((link) => (
                                        <SidebarLink
                                            key={link.href}
                                            href={link.href}
                                            label={link.label}
                                            pathname={pathname}
                                            isCollapsed={isCollapsed}
                                            icon={link.icon}
                                            external={(link as any).external}
                                            badge={(link as any).badge} // ✅ ADICIONAR
                                        />
                                    ))}
                                </>
                            )}

                            {user?.role !== "ADMIN" && (
                                <>
                                    <span className="text-sm text-gray-400 font-medium mt-4 uppercase">
                                        Configurações
                                    </span>
                                    {menuLinks?.settings.map((link) => (
                                        <SidebarLink
                                            key={link.href}
                                            href={link.href}
                                            label={link.label}
                                            pathname={pathname}
                                            isCollapsed={isCollapsed}
                                            icon={link.icon}
                                        />
                                    ))}
                                </>
                            )}
                           
                            {user?.role === "ADMIN" && (
                                <>
                                    <span className="text-sm text-gray-400 font-medium mt-4 uppercase">
                                        Admin
                                    </span>

                                    <SidebarLink
                                        href="/dashboard"
                                        label="Dashboard"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<LucideCircleGauge className='w-6 h-6' />}
                                    />
                                    <SidebarLink
                                        href="/dashboard/profile"
                                        label="Meu Perfil"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<Settings className='w-6 h-6' />}
                                    />
                                    <SidebarLink
                                        href="/dashboard/users"
                                        label="Profissionais"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<Users className='w-6 h-6' />}
                                    />
                                    <SidebarLink
                                        href="/dashboard/courtesies"
                                        label="Cortesias"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<Gift className='w-6 h-6' />}
                                        badge={pendingEligibles > 0 ? pendingEligibles : undefined}
                                    />
                                    <SidebarLink
                                        href="/dashboard/services"
                                        label="Tipos de Atendimento"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<Car className='w-6 h-6' />}
                                    />
                                    <SidebarLink
                                        href="/dashboard/professions"
                                        label="Profissões"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<LucideBookUser className='w-6 h-6' />}
                                    />
                                    <SidebarLink
                                        href="/dashboard/metrics"
                                        label="Métricas"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<ClipboardClock className='w-6 h-6' />}
                                    />
                                    <SidebarLink
                                        href="/dashboard/issues"
                                        label="Chamados"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<FolderKanban className='w-6 h-6' />}
                                    /> 
                                    <SidebarLink
                                        href="/dashboard/landing-editor"
                                        label="Editor Landing Page"
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        icon={<LucideFileCode2 className='w-6 h-6' />}
                                     />                                    
                                </>
                            )}
                        </nav>
                    </CollapsibleContent>
                </Collapsible>
            </aside>


            <div className={clsx("flex flex-1 flex-col transition-all duration-300 min-w-0 overflow-x-hidden", {
                "md:ml-20": isCollapsed,
                "md:ml-64": !isCollapsed
            })}>
            <header className='flex items-center justify-between border-b px-2 md:px-6 h-14 z-10 sticky top-0 bg-white'>
                <div className="flex items-center gap-4">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setIsCollapsed(false)}>
                                <List className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>

                        <h1 className="text-base md:text-lg font-semibold">
                            BaseMedical
                        </h1>

                        <SheetContent side="right" className="sm:max-w-xs text-black p-6">
                            <SheetTitle className="sr-only">BaseMedical</SheetTitle>
                            <SheetDescription className="sr-only">
                                Menu de navegação
                            </SheetDescription>
                            <div className="flex items-center mb-4">
                                <Image
                                    src={logoImg}
                                    alt="BaseMedical"
                                    priority
                                    quality={100}
                                    className="h-8 w-auto"
                                />
                            </div>
                            <nav className="grid gap-2 text-base pt-2" onClick={() => setSheetOpen(false)}>
                                {user?.role !== "ADMIN" && (
                                    <>
                                        <span className="text-sm text-gray-400 font-medium uppercase">
                                            Painel
                                        </span>
                                        {menuLinks.panel.map((link) => (
                                            <SidebarLink
                                                key={link.href}
                                                href={link.href}
                                                label={link.label}
                                                pathname={pathname}
                                                isCollapsed={false}
                                                icon={link.icon}
                                                external={(link as any).external}
                                                badge={(link as any).badge}
                                            />
                                        ))}
                                        <span className="text-sm text-gray-400 font-medium mt-4 uppercase">
                                            Configurações
                                        </span>
                                        {menuLinks.settings.map((link) => (
                                            <SidebarLink
                                                key={link.href}
                                                href={link.href}
                                                label={link.label}
                                                pathname={pathname}
                                                isCollapsed={false}
                                                icon={link.icon}
                                            />
                                        ))}
                                    </>
                                )}

                                {user?.role === "ADMIN" && (
                                    <>
                                        <span className="text-sm text-gray-400 font-medium uppercase">
                                            Admin
                                        </span>
                                        <SidebarLink
                                            href="/dashboard"
                                            label="Dashboard"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<LucideCircleGauge className='w-6 h-6' />}
                                        />
                                        <SidebarLink
                                            href="/dashboard/profile"
                                            label="Meu Perfil"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<Settings className='w-6 h-6' />}
                                        />
                                        <SidebarLink
                                            href="/dashboard/users"
                                            label="Profissionais"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<Users className='w-6 h-6' />}
                                        />
                                        <SidebarLink
                                            href="/dashboard/courtesies"
                                            label="Cortesias"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<Gift className='w-6 h-6' />}
                                            badge={pendingEligibles > 0 ? pendingEligibles : undefined}
                                        />
                                        <SidebarLink
                                            href="/dashboard/services"
                                            label="Tipos de Atendimento"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<Car className='w-6 h-6' />}
                                        />
                                        <SidebarLink
                                            href="/dashboard/professions"
                                            label="Profissões"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<LucideBookUser className='w-6 h-6' />}
                                        />
                                        <SidebarLink
                                            href="/dashboard/metrics"
                                            label="Métricas"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<ClipboardClock className='w-6 h-6' />}
                                        />
                                        <SidebarLink
                                            href="/dashboard/issues"
                                            label="Chamados"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<FolderKanban className='w-6 h-6' />}
                                            badge={pendingTickets > 0 ? pendingTickets : undefined}
                                        />
                                        <SidebarLink
                                            href="/dashboard/landing-editor"
                                            label="Editor Landing Page"
                                            pathname={pathname}
                                            isCollapsed={false}
                                            icon={<LucideFileCode2 className='w-6 h-6' />}
                                        />
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/issues"
                        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                        aria-label="Chamados"
                        title={pendingTickets > 0 ? `${pendingTickets} chamado(s) pendente(s)` : "Chamados"}
                    >
                        <Bell className="h-4 w-4 text-gray-700" />
                        {pendingTickets > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                                {pendingTickets > 9 ? "9+" : pendingTickets}
                            </span>
                        )}
                    </Link>
                <Button
                    variant="destructive"
                    className="px-2 sm:px-4"
                    onClick={async () => {
                        try {
                            localStorage.clear();
                            sessionStorage.clear();

                            await handleLogout();

                            // Hard reload para garantir
                            window.location.replace("/");
                        } catch (error) {
                            console.error('Erro no logout:', error);
                            window.location.replace("/");
                        }
                    }}>
                    <LogOut className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">Sair da conta</span>
                </Button>
                </div>
            </header>

            <main className="flex-1 py-4 px-2 md:p-6">
                {children}
            </main>
        </div>
    </div>
    )
}

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    pathname: string;
    isCollapsed: boolean;
    external?: boolean;
    badge?: number; // ✅ ADICIONAR
}

function SidebarLink({ href, icon, label, pathname, isCollapsed, external, badge }: SidebarLinkProps) {
    return (
        <Link href={href} target={external ? "_blank" : undefined}>
            <div className={clsx("flex items-center gap-2 px-3 py-2 rounded-md transition-colors relative",
                {
                    "text-white bg-emerald-500": pathname === href,
                    "text-gray-700 hover:bg-gray-100": pathname !== href,
                })}>
                <span className="w-6 h-6">{icon}</span>
                {!isCollapsed && <span>{label}</span>}
                
                {/* ✅ Badge de notificação */}
                {badge && badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {badge > 9 ? '9+' : badge}
                    </span>
                )}
            </div>
        </Link>
    )
}