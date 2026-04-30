"use server"

import { Plan } from "@/generated/prisma"
import { PlansProps } from "@/utils/plans/index"

export interface PlansDetailInfo {
    maxTypeServices: number;
}

const PLANS_LIMITS: PlansProps = {
    FREE: {
        maxTypeServices: 1,
    },
    PROFESSIONAL: {
        maxTypeServices: 10,
    },
    COURTESY: {
        maxTypeServices: 10,
    },
}

export async function getPlan(planId: Plan) {
    return PLANS_LIMITS[planId];
}


