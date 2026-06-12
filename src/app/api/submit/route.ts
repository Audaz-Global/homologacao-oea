import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const razaoSocial = formData.get('razaoSocial') as string;
    const cnpj = formData.get('cnpj') as string;
    const nomeResponsavel = formData.get('nomeResponsavel') as string;
    const cargo = formData.get('cargo') as string;
    const email = formData.get('email') as string;
    const telefone = formData.get('telefone') as string;
    
    const q1 = formData.get('q1') as string;
    const q2 = formData.get('q2') as string;
    const q3 = formData.get('q3') as string;
    const q4 = formData.get('q4') as string;
    const q5 = formData.get('q5') as string;
    const q6 = formData.get('q6') as string;
    const termoAceito = formData.get('termo') === 'true';

    let pontuacao = 0;
    if (q1 === 'sim') pontuacao += 10;
    if (q2 === 'sim') pontuacao += 10;
    if (q3 === 'sim') pontuacao += 10;
    if (q4 === 'sim') pontuacao += 10;
    if (q5 === 'sim') pontuacao += 10;
    if (q6 === 'sim') pontuacao += 10;

    const evidencia1File = formData.get('evidencia1') as File | null;
    let evidenciaQ1 = null;
    if (evidencia1File && evidencia1File.size > 0) {
      const buffer = Buffer.from(await evidencia1File.arrayBuffer());
      evidenciaQ1 = `data:${evidencia1File.type};base64,${buffer.toString('base64')}`;
    }

    const evidencia2File = formData.get('evidencia2') as File | null;
    let evidenciaQ2 = null;
    if (evidencia2File && evidencia2File.size > 0) {
      const buffer = Buffer.from(await evidencia2File.arrayBuffer());
      evidenciaQ2 = `data:${evidencia2File.type};base64,${buffer.toString('base64')}`;
    }

    const novaTransportadora = await prisma.transportadora.create({
      data: {
        razaoSocial,
        cnpj,
        nomeResponsavel,
        cargo,
        email,
        telefone,
        q1_apiArgos: q1,
        evidenciaQ1,
        q2_rfbDestino: q2,
        evidenciaQ2,
        q3_monitorPortas: q3,
        q4_baus: q4,
        q5_kml: q5,
        q6_violacao: q6,
        termoAceito,
        pontuacao,
        statusHomologacao: 'Pendente'
      },
    });

    return NextResponse.json({ success: true, transportadora: novaTransportadora });
  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
    return NextResponse.json({ success: false, error: 'Falha ao salvar dados' }, { status: 500 });
  }
}
