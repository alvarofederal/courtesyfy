"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2, Calendar, Users, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const profiles = [
    {
      value: "TOTAL",
      icon: Calendar,
      title: "Perfil Completo",
      description: "Gerencie sua agenda, agendamentos, pacientes e relatórios",
      features: [
        "Sistema de agendamento online",
        "Gestão completa de pacientes",
        "Relatórios e análises",
        "Múltiplos locais de atendimento",
      ],
      color: "emerald",
    },
    {
      value: "INFO",
      icon: Users,
      title: "Perfil Informativo",
      description: "Apenas exiba suas informações profissionais e locais de atendimento",
      features: [
        "Página de perfil pública",
        "Informações de contato",
        "Locais de atendimento",
        "Cartão virtual profissional",
      ],
      color: "blue",
    },
    {
      value: "WAITLIST",
      icon: ClipboardList,
      title: "Lista de Espera",
      description: "Colete contatos de pacientes interessados em atendimento futuro",
      features: [
        "Formulário de lista de espera",
        "Captura de leads (nome, email, telefone)",
        "Gestão de interessados",
        "Ideal para agenda lotada ou férias",
      ],
      color: "purple",
    },
  ];

  const handleSave = async () => {
    if (!selectedProfile) {
      toast.error("Selecione um tipo de perfil");
      return;
    }

    setLoading(true);

    try {
      console.log("💾 Salvando perfil:", selectedProfile);

      const response = await fetch("/api/onboarding/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeProfile: selectedProfile }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar perfil");
      }

      toast.success("✅ Perfil configurado com sucesso!");
      
      console.log("🔄 Atualizando sessão...");
      await update();
      
      console.log("➡️ Redirecionando para dashboard");
      router.push("/dashboard");

    } catch (error) {
      console.error("❌ Erro:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-gray-900">
            Bem-vindo ao BaseMedical! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o perfil que melhor se encaixa ao seu momento profissional atual
          </p>
        </div>

        {/* Profile Cards */}
        <RadioGroup value={selectedProfile} onValueChange={setSelectedProfile}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedProfile === profile.value;

              return (
                <Card
                  key={profile.value}
                  className={`cursor-pointer transition-all hover:shadow-xl ${
                    isSelected
                      ? "border-emerald-500 border-2 shadow-2xl ring-4 ring-emerald-100"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                  onClick={() => setSelectedProfile(profile.value)}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-4 rounded-xl ${
                        isSelected ? "bg-emerald-100" : "bg-gray-100"
                      }`}>
                        <Icon className={`h-8 w-8 ${
                          isSelected ? "text-emerald-600" : "text-gray-600"
                        }`} />
                      </div>
                      <RadioGroupItem 
                        value={profile.value} 
                        id={profile.value}
                        className={isSelected ? "border-emerald-500" : ""}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{profile.title}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {profile.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {profile.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            isSelected ? "text-emerald-500" : "text-gray-400"
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>

        {/* Action Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSave}
            disabled={!selectedProfile || loading}
            size="lg"
            className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Salvando seu perfil...
              </>
            ) : (
              "Continuar para o Dashboard →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}