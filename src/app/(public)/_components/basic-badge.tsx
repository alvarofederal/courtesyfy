import { Star } from "lucide-react";

export function BasicCardBadge() {
    return (
        <div className="absolute top-2 right-2 bg-green-500 w-12 h-12 z-[2] rounded-full flex items-center justify-center">
            <Star className="text-white w-10 h-10 " />
        </div>
    )
}