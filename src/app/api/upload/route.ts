import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// ✅ Usar os mesmos nomes das suas variáveis
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_KEY as string,
  api_secret: process.env.CLOUDINARY_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        error: "Não autorizado"
      }, {
        status: 401
      });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
    }

    // ✅ Converter para buffer (igual ao seu código)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // ✅ Upload usando upload_stream (igual ao seu código)
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: 'landing-page',
        public_id: `hero-${Date.now()}`,
        resource_type: 'image',
      }, function(error, result) {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }).end(buffer);
    });

    console.log('✅ Imagem enviada para Cloudinary:', result.secure_url);

    return NextResponse.json({ 
      success: true, 
      imageUrl: result.secure_url 
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}