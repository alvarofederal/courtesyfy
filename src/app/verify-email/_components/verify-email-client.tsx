// src/app/verify-email/_components/verify-email-client.tsx
"use client"

import { VerifyEmailForm } from "./verify-email-form"

interface VerifyEmailClientProps {
  email?: string
  code?: string
}

export function VerifyEmailClient({ email, code }: VerifyEmailClientProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificar Email
            </h1>
            <p className="text-gray-600">
              Digite o código de 6 dígitos enviado para seu email
            </p>
          </div>
          
          <VerifyEmailForm initialEmail={email} />
        </div>
      </div>
    </main>
  )
}