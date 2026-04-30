import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingEditor } from "./_components/landing-editor";
import prisma from "@/lib/prisma";

export default async function LandingEditorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // ✅ Corrigido: landingPage
  const content = await prisma.landingPage.findFirst();

  return <LandingEditor initialContent={content} />;
}