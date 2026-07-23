import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');

  if (!origin || origin !== requestUrl.origin) {
    return new NextResponse('Origem da solicitação inválida.', { status: 403 });
  }

  const { id: idParam } = await params;

  if (!/^\d+$/.test(idParam)) {
    return new NextResponse('ID inválido.', { status: 400 });
  }

  const id = Number(idParam);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return new NextResponse('ID inválido.', { status: 400 });
  }

  const resultado = await prisma.transportadora.deleteMany({
    where: { id },
  });

  if (resultado.count === 0) {
    return new NextResponse('Transportadora não encontrada.', { status: 404 });
  }

  return NextResponse.redirect(new URL('/admin', requestUrl), 303);
}
