import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string, question: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const question = resolvedParams.question; // 'q1' or 'q2'

  if (isNaN(id)) return new NextResponse("ID inválido", { status: 400 });

  const transportadora = await prisma.transportadora.findUnique({
    where: { id },
    select: { evidenciaQ1: true, evidenciaQ2: true }
  });

  if (!transportadora) return new NextResponse("Não encontrado", { status: 404 });

  const evidencia = question === 'q1' ? transportadora.evidenciaQ1 : transportadora.evidenciaQ2;

  if (!evidencia) return new NextResponse("Arquivo não encontrado", { status: 404 });

  // evidencia is a base64 string like: data:application/pdf;base64,JVBERi...
  const matches = evidencia.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return new NextResponse("Formato de arquivo inválido", { status: 500 });
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const extension = mimeType.split('/')[1] || 'bin';
  const filename = `evidencia_${question}_${id}.${extension}`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
