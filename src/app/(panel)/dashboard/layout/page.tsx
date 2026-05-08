import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { Plus, Star, Pencil, Layers } from "lucide-react"
import { ExcluirLayoutBtn } from "./_components/excluir-layout-btn"

export default async function LayoutListPage() {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const layouts = await db.layout.findMany({
    where: { lojaId: session.user.lojaId },
    orderBy: [{ padrao: "desc" }, { criadoEm: "desc" }],
    include: { _count: { select: { campanhas: true } } },
  })

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dash-title">Layouts</h1>
          <p className="dash-subtitle text-sm mt-0.5">
            Crie temas visuais e aplique nas campanhas para personalizar os cards impressos.
          </p>
        </div>
        <Link
          href="/dashboard/layout/novo"
          className="inline-flex items-center gap-2 dash-btn-primary text-sm px-4 py-2.5 rounded-xl flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo layout
        </Link>
      </div>

      {layouts.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className="dash-subtitle text-sm">Nenhum layout criado ainda.</p>
          <Link
            href="/dashboard/layout/novo"
            className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar o primeiro layout
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="dash-card p-5 flex flex-col gap-4"
            >
              {/* Color swatch + name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: layout.corPrimaria, border: "1px solid rgba(255,255,255,0.10)" }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold dash-title truncate">{layout.nome}</p>
                    {layout.padrao && (
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 fill-amber-400" />
                    )}
                  </div>
                  <p className="text-xs dash-muted font-mono">{layout.corPrimaria}</p>
                </div>
              </div>

              {/* Image thumbs */}
              {(layout.imagem1Url || layout.imagem2Url || layout.imagem3Url) && (
                <div className="flex gap-2">
                  {[layout.imagem1Url, layout.imagem2Url, layout.imagem3Url].map((img, i) =>
                    img ? (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    ) : null,
                  )}
                </div>
              )}

              {/* Meta */}
              <p className="text-xs dash-muted">
                {layout._count.campanhas} campanha{layout._count.campanhas !== 1 ? "s" : ""}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <Link
                  href={`/dashboard/layout/${layout.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.65)" }}
                  onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = "transparent")}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Link>
                <ExcluirLayoutBtn
                  layoutId={layout.id}
                  disabled={layout._count.campanhas > 0}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
