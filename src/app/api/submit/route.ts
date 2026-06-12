import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const novaTransportadora = await prisma.transportadora.create({
      data: {
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        nomeResponsavel: data.nomeResponsavel,
        cargo: data.cargo,
        email: data.email,
        telefone: data.telefone,
        q1_apiArgos: data.q1,
        q2_rfbDestino: data.q2,
        q3_monitorPortas: data.q3,
        q4_baus: data.q4,
        q5_kml: data.q5,
        q6_violacao: data.q6,
        termoAceito: data.termo,
      },
    });

    return NextResponse.json({ success: true, transportadora: novaTransportadora });
  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
    return NextResponse.json({ success: false, error: 'Falha ao salvar dados' }, { status: 500 });
  }
}
