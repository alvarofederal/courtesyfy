import { Suspense } from "react"
import { VerifyEmailClient } from "./_components/verify-email-client"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; code?: string }>
}) {
  const params = await searchParams

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <VerifyEmailClient email={params.email} code={params.code} />
    </Suspense>
  )
}
