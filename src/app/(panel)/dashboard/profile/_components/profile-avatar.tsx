"use client"

import Image from "next/image"
import { ChangeEvent, useState } from "react"
import semFoto from '../../../../../../public/foto1.png';
import { Loader, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAvatar } from "../_actions/update-avatar";
import { useSession } from "next-auth/react";

interface AvatarProfileProps {
  userId: string; 
  avatarUrl: string | null;
}

export function AvatarProfile({ userId, avatarUrl }: AvatarProfileProps) {
    const [previewImage, setPreviewImage] = useState(avatarUrl);
    const [loading, setLoading] = useState(false);
    const { update } = useSession();

    async function handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setLoading(true)
            const image = e.target.files[0];
            if (image.type !== "image/jpeg" && image.type !== "image/png" && image.type !== "image/jpg") {
                toast.error("Formato de imagem inválido. Utilize jpg ou png.")
                return;
            }

            //const newFilename = `${userId}-avatar-${Date.now()}`;
            const newFilename = `${userId}`;
            const newFile = new File([image], newFilename, { type: image.type });

            const urlImage = await uploadImage(newFile);

            if (!urlImage || urlImage === "") {
                toast.error("Falha ao alterar a imagem. Tente novamente.");
                return;
            }

            setPreviewImage(urlImage);

            await updateProfileAvatar({avatarUrl: urlImage});
            await update({ image: urlImage });

            setLoading(false);
        }
    }

    async function uploadImage(image: File): Promise<string | null> {

        try {
            toast("Enviando imagem...");
        
            const formData = new FormData();

            formData.append("file", image);
            formData.append("userId", userId);

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/image/upload`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                return null;
            }
            toast.success("Imagem alterada com sucesso!");
            return data.secure_url as string;  
        } catch (error) {
            console.log("Erro ao enviar imagem:", error);
            toast.error("Erro ao enviar imagem. Tente novamente.");
            return null;
        }
    }

    return (
        <div className="relative w-40 h-40 md:w-48 md:h-48">
            <div className="relative flex items-center justify-center w-full h-full">
                <span className='absolute cursor-pointer z-[2] bg-slate-50/80 p-2 rounded-full shadow-xl hover:opacity-0 transition-opacity'>
                    {loading ? <Loader2 size={16} color="#131313" className="animate-spin"/> : <Upload size={16} color="#131313" />}
                </span>
                <input 
                    type="file" 
                    className="opacity-0 cursor-pointer relative z-50 w-48 h-48 hover:opacity-0" 
                    onChange={handleChange}/>
            </div>

            {previewImage ? (
                <Image 
                    src={previewImage}
                    alt="Foto de perfil dos Profissionais"
                    fill
                    className="w-full h-48 object-cover rounded-full border-gray-200"
                    quality={100}
                    priority
                    sizes='(max-width: 480px) 100vw, (max-width: 1024px) 75vw, 60vw' />
                ) : (
                <Image 
                    src={semFoto}
                    alt="Foto de perfil dos Profissionais"
                    fill
                    className="w-full h-48 object-cover rounded-full border-gray-200"
                    quality={100}
                    priority
                    sizes='(max-width: 480px) 100vw, (max-width: 1024px) 75vw, 60vw' />
                )

            }
            

        </div>
    )
}