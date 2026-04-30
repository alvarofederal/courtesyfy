import { Suspense } from "react"
import { Header } from "../(public)/_components/header"
import { Footer } from "../(public)/_components/footer"
import { VerifyEmailClient } from "./_components/verify-email-client"

// ✅ IMPORTANTE: async + await searchParams
export default async function VerifyEmailPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ email?: string, code?: string }> 
}) {
    // ✅ AWAIT nos searchParams (Next.js 15+)
    const params = await searchParams
    
    return (
        <>
            <Header />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            }>
                <VerifyEmailClient email={params.email} code={params.code} />
            </Suspense>
            <Footer />
        </>
    )
}