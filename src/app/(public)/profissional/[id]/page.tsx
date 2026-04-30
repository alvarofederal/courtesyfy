import { redirect } from "next/navigation";
import { getInfoSchedule } from "./_data_access/get-info-schedule";
import { ScheduleContent } from "./_components/schedule-content";
import { InfoContent } from "./_components/info-content";
import { WaitlistContent } from "./_components/waitlist-content";

export default async function SchedulePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const idOrSlug = (await params).id;
    const user = await getInfoSchedule({ idOrSlug });

    if (!user) {
        redirect("/")
    }

    switch (user.typeProfile) {
        case "TOTAL":
            return <ScheduleContent professional={user} />;
        
        case "INFO":
            return <InfoContent professional={{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                phone: user.phone,
                specialty: user.specialty,
                registration: user.registration,
                presentation: user.presentation,
                // 🔥 CORRIGIDO: Passa objetos completos, não só strings
                addresses: user.addresses?.map(a => ({
                    address: a.address,
                    phone: a.phone || null,
                    contact: a.contact || null
                })) || [],
                typeProfile: user.typeProfile,
                subscription: user.subscription ? { plan: user.subscription.plan } : { plan: "FREE" },
            }} />;
        
        case "WAITLIST":
            return <WaitlistContent professional={{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                specialty: user.specialty,
                presentation: user.presentation,
            }} />;
        
        default:
            // Se não tem typeProfile (usuários antigos), mostrar agendamento
            return <ScheduleContent professional={user} />;
    }
}