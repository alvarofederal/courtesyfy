import { getTimesProfessional } from "../../_data_access/get-times-professional";
import { AppointmentsList } from "./appointments-list";

export async function Appointments({userId}: {userId: string}) {
    const { times } = await getTimesProfessional({userId: userId})
    
    return (
        <div>
            <AppointmentsList />
        </div>
    )  
}