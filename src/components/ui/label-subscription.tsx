import { ResultPermissionProp } from "@/utils/permissions/canPermission";
import Link from "next/link";


interface ServicesListProps {
  permission: ResultPermissionProp
}

export function LabelSubscription({ permission }: ServicesListProps) {
    return (
        <div className="bg-red-400 text-white text-sm md:text-base px-3 py-2 my-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-1">
            <div>
                {permission.expired ? (
                    <div>
                        <h3 className="font-semibold">
                            Sua plano expirou!
                        </h3>
                        <p className="text-sm text-gray-50">
                            Acesse o seu plano para verificar os detalhes
                        </p>
                    </div>
                    
                ) : (
                    <div>
                        <h3 className="font-semibold">
                            Você excedeu o limite de serviços em seu plano!
                        </h3>
                        {permission.plan?.maxTypeServices === 3 ? (
                            <p className="text-sm text-gray-50">
                                Esse plano está limitado apenas a 3 serviços, e você não poderá criar novos.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-50">
                                Esse plano está limitado apenas a 50 serviços, e você não poderá criar novos.
                            </p>
                        )}
                    </div>
                )}

            </div>
            <Link 
                href="/dashboard/plans" 
                className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-md w-fit">
                    Acesse seu plano
            </Link>
        </div>
    )
}