import getSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { ServicesContent } from "./_components/service-content";
import { Suspense } from "react";

export default async function Services() {

    const session = await getSession()

    if (!session) {
        redirect('/')
    }

    return (
        <Suspense fallback={<div>Carregando serviços...</div>}>
            <ServicesContent userId={session.user.id} />
        </Suspense>
    )
}
