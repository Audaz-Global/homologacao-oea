import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

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

    const attachments = [];

    const evidencia1File = formData.get('evidencia1') as File | null;
    let evidenciaQ1 = null;
    if (evidencia1File && evidencia1File.size > 0) {
      const buffer = Buffer.from(await evidencia1File.arrayBuffer());
      evidenciaQ1 = `data:${evidencia1File.type};base64,${buffer.toString('base64')}`;
      attachments.push({
        filename: evidencia1File.name || 'evidencia_api_argos.pdf',
        content: buffer,
      });
    }

    const evidencia2File = formData.get('evidencia2') as File | null;
    let evidenciaQ2 = null;
    if (evidencia2File && evidencia2File.size > 0) {
      const buffer = Buffer.from(await evidencia2File.arrayBuffer());
      evidenciaQ2 = `data:${evidencia2File.type};base64,${buffer.toString('base64')}`;
      attachments.push({
        filename: evidencia2File.name || 'evidencia_rfb_destinatario.pdf',
        content: buffer,
      });
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

    // Enviar notificação por e-mail
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: `"Homologação OEA" <${process.env.SMTP_USER}>`,
          to: [
            'daniel@audazglobal.com',
            'cs3@audazglobal.com',
            'cs13@audazglobal.com',
            'cs16@audazglobal.com',
            'gabriella.ext@audazglobal.com',
            'sales@audazglobal.com',
          ].join(', '),
          subject: `Nova Homologação OEA Recebida: ${razaoSocial}`,
          attachments,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #0f172a;">Nova transportadora respondeu ao questionário</h2>
              <p>Uma nova transportadora preencheu o formulário de Homologação OEA.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Razão Social:</strong> ${razaoSocial}</p>
                <p style="margin: 5px 0;"><strong>CNPJ:</strong> ${cnpj}</p>
                <p style="margin: 5px 0;"><strong>Responsável:</strong> ${nomeResponsavel} (${cargo})</p>
                <p style="margin: 5px 0;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Telefone:</strong> ${telefone}</p>
              </div>

              <h3 style="color: #0f172a;">Respostas do Questionário</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #e2e8f0;">Requisito</th>
                    <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; width: 80px;">Resposta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">1. Integração com API-Argos da RFB</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${q1 === 'sim' ? '#166534' : '#991b1b'};">${q1.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">2. RFB como destinatária dos dados de rastreamento</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${q2 === 'sim' ? '#166534' : '#991b1b'};">${q2.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">3. Monitoramento de portas das unidades de carga</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${q3 === 'sim' ? '#166534' : '#991b1b'};">${q3.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">4. Frota com carrocerias fechadas do tipo Baú</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${q4 === 'sim' ? '#166534' : '#991b1b'};">${q4.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">5. Capacidade de gerar/fornecer arquivos de rota KML</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${q5 === 'sim' ? '#166534' : '#991b1b'};">${q5.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">6. Procedimento formal de comunicação de violações à aduana</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${q6 === 'sim' ? '#166534' : '#991b1b'};">${q6.toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>

              <h3 style="color: #0f172a;">Pontuação Automática</h3>
              <div style="display: inline-block; padding: 10px 20px; background-color: ${pontuacao >= 50 ? '#dcfce7' : pontuacao >= 30 ? '#fef3c7' : '#fee2e2'}; color: ${pontuacao >= 50 ? '#166534' : pontuacao >= 30 ? '#92400e' : '#991b1b'}; border-radius: 99px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
                ${pontuacao} pontos
              </div>

              <p style="margin-top: 10px;">
                Os arquivos de evidências enviados foram anexados diretamente a este e-mail para preservação e backup.
              </p>
              <p>
                Acesse o painel administrativo online para gerenciar o status da homologação.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail de notificação enviado com sucesso para:', mailOptions.to);
      } else {
        console.warn('Variáveis de ambiente SMTP não configuradas. E-mail não enviado.');
      }
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de notificação:', emailError);
      // Não falhamos a requisição se o e-mail der erro
    }

    return NextResponse.json({ success: true, transportadora: novaTransportadora });
  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
    return NextResponse.json({ success: false, error: 'Falha ao salvar dados' }, { status: 500 });
  }
}
