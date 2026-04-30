import { SpecialistForm } from "../_components/specialist-form"

export default function CreateSpecialistPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Criar Especialista</h1>

      <div className="max-w-2xl">
        <SpecialistForm />
      </div>
    </div>
  )
}
