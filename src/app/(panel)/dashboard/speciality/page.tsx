import { SpecialtyList } from "./_components/speciality-list"

export default function SpecialityPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Especialidades Médicas</h1>

      <SpecialtyList />
    </div>
  )
}
