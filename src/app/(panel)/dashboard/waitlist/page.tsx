import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WaitlistManager } from "../_components/waitlist-manager";
import prisma from "@/lib/prisma";

export default async function WaitlistPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  // ✅ Permitir acesso se for perfil WAITLIST
  if (session.user.typeProfile !== "WAITLIST") {
    redirect("/dashboard");
  }

  const waitlist = await prisma.waitlist.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <WaitlistManager initialWaitlist={waitlist} />;
}