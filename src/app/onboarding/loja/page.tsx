import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LojaForm } from "./_components/loja-form"

export default async function OnboardingLojaPage() {
  const session = await auth()
  if (!session?.user)      redirect("/login")
  if (session.user.lojaId) redirect("/dashboard")
  return <LojaForm />
}
