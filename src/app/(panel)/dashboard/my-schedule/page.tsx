import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import MySchedulePage from './my-schedule';
import { canPermission } from '@/utils/permissions/canPermission';
import { LabelSubscription } from '@/components/ui/label-subscription';
import { ExpirationWarning } from '@/components/ui/expiration-warning';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/');
    }

    const permissions = await canPermission({ type: "service" });

    return (
        <>
            <ExpirationWarning userId={session.user.id} />
    
            {permissions.planId === "EXPIRED" && (
                <LabelSubscription permission={permissions} />
            )}
    
            {permissions.planId !== "EXPIRED" && (
                <Suspense fallback={
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                }>
                    <MySchedulePage />
                </Suspense>
            )}
        </>  
    );
}