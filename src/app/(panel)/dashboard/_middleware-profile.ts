import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireProfile(allowedProfiles: string[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (!session.user.typeProfile) {
    redirect("/onboarding");
  }

  if (!allowedProfiles.includes(session.user.typeProfile)) {
    redirect("/dashboard");
  }

  return session;
}