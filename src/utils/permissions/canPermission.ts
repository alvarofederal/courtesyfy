"use server"

import { auth } from "@/lib/auth";
import { PlansDetailInfo } from "./get-plans";
import prisma from "@/lib/prisma";
import { canCreateTypeService } from "./canCreateService";

export type PLAN_PROP = "FREE" | "PROFESSIONAL" | "COURTESY" | "TRIAL" | "EXPIRED" ;
type TypeCheck = "service" | "appointment";

export interface ResultPermissionProp {
    hasPermission: boolean;
    planId: PLAN_PROP;
    expired: boolean;
    plan: PlansDetailInfo | null;
}

interface CanPlanPermissions {
    type: TypeCheck;
}

export async function canPermission({ type }: CanPlanPermissions): Promise<ResultPermissionProp> {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            hasPermission: false,
            planId: "EXPIRED",
            expired: true,
            plan: null
        }
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId: session?.user?.id,
        }
    });

    switch (type) {
        case "service": 
            const permission = await canCreateTypeService(subscription, session);
            return permission;
        case "appointment": 
            const permissionAppointment = await canCreateTypeService(subscription, session);
            return permissionAppointment;
        default:
            return {
                hasPermission: false,
                planId: "EXPIRED",
                expired: true,
                plan: null
            }
    }
    
}