"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      console.log("⏳ Carregando sessão...");
      return;
    }

    if (!session?.user) {
      console.log("❌ Sem sessão, voltando para home");
      router.push("/");
      return;
    }

    console.log("🔍 Verificando perfil:", {
      userId: session.user.id,
      email: session.user.email,
      typeProfile: session.user.typeProfile,
      hasTypeProfile: !!session.user.typeProfile
    });

    // Se não tem typeProfile, vai para onboarding
    if (!session.user.typeProfile) {
      console.log("⚠️ SEM PERFIL! Indo para onboarding...");
      router.push("/onboarding");
      return;
    }

    // Se tem typeProfile, vai para dashboard
    console.log("✅ TEM PERFIL! Indo para dashboard...");
    router.push("/dashboard");

  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
        <p className="text-lg text-gray-600">Verificando seu perfil...</p>
      </div>
    </div>
  );
}