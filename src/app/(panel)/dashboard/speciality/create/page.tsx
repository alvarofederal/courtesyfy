import { SpecialtyForm } from "../_components/speciality-form"

export default function CreateSpecialtyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Criar Especialidade</h1>

      <div className="max-w-2xl">
        <SpecialtyForm />
      </div>
    </div>
  )
}
