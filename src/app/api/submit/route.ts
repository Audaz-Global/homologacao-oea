import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: evidencia1File.name || 'evidencia_api_argos.pdf',
        contentType: evidencia1File.type || 'application/pdf',
        contentBytes: buffer.toString('base64')
      });
    }

    const evidencia2File = formData.get('evidencia2') as File | null;
    let evidenciaQ2 = null;
    if (evidencia2File && evidencia2File.size > 0) {
      const buffer = Buffer.from(await evidencia2File.arrayBuffer());
      evidenciaQ2 = `data:${evidencia2File.type};base64,${buffer.toString('base64')}`;
      attachments.push({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: evidencia2File.name || 'evidencia_rfb_destinatario.pdf',
        contentType: evidencia2File.type || 'application/pdf',
        contentBytes: buffer.toString('base64')
      });
    }

    // --- GERAR PDF COM OS DADOS DO FORMULÁRIO ---
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    let yPos = height - 50;

    const drawLine = (text: string, isBold = false, size = 12) => {
      // Remover acentos para garantir que pdf-lib standard fonts suporte o texto no formato WinAnsi
      const safeText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      page.drawText(safeText, {
        x: 50,
        y: yPos,
        size: size,
        font: isBold ? fontBold : font,
        color: rgb(0, 0, 0),
      });
      yPos -= (size + 10);
    };

    drawLine('Resumo da Homologacao OEA - Transportadora', true, 18);
    yPos -= 10;
    drawLine(`Razao Social: ${razaoSocial}`);
    drawLine(`CNPJ: ${cnpj}`);
    drawLine(`Responsavel: ${nomeResponsavel} (${cargo})`);
    drawLine(`E-mail: ${email}`);
    drawLine(`Telefone: ${telefone}`);
    
    yPos -= 20;
    drawLine('Questionario (COANA 188):', true, 14);
    yPos -= 10;
    drawLine(`1. API-Argos: ${q1.toUpperCase()}`);
    drawLine(`2. RFB destinataria: ${q2.toUpperCase()}`);
    drawLine(`3. Monitoramento portas: ${q3.toUpperCase()}`);
    drawLine(`4. Baus: ${q4.toUpperCase()}`);
    drawLine(`5. KML: ${q5.toUpperCase()}`);
    drawLine(`6. Violacao aduana: ${q6.toUpperCase()}`);
    
    yPos -= 20;
    drawLine(`Pontuacao: ${pontuacao} pontos`, true, 14);

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    attachments.push({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: `Resumo_Homologacao_${cnpj.replace(/[^0-9]/g, '')}.pdf`,
      contentType: "application/pdf",
      contentBytes: pdfBase64
    });
    // --- FIM DA GERAÇÃO DO PDF ---


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

    // Atualiza o arquivo markdown resumo_transportadoras.md na raiz do workspace
    exec('node ../update-resumo.js', (err) => {
      if (err) {
        console.error('Erro ao atualizar o arquivo de resumo das transportadoras:', err);
      } else {
        console.log('Arquivo resumo_transportadoras.md atualizado com sucesso.');
      }
    });

    // Enviar notificação por e-mail via MS Graph API
    try {
      const tenantId = process.env.MS_GRAPH_TENANT_ID;
      const clientId = process.env.MS_GRAPH_CLIENT_ID;
      const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
      const senderEmail = process.env.MS_GRAPH_SENDER;

      if (tenantId && clientId && clientSecret && senderEmail) {
        // 1. Obter Token de Acesso
        const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: clientId,
            scope: 'https://graph.microsoft.com/.default',
            client_secret: clientSecret,
            grant_type: 'client_credentials'
          })
        });

        if (!tokenResponse.ok) {
          throw new Error(`Falha ao obter token do MS Graph: ${await tokenResponse.text()}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Enviar E-mail
        const htmlContent = `
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
        `;

        const toEmails = [
          'daniel@audazglobal.com',
          'sales@audazglobal.com',
        ];

        const sendMailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: {
              subject: `Nova Homologação OEA Recebida: ${razaoSocial}`,
              body: {
                contentType: 'HTML',
                content: htmlContent
              },
              toRecipients: toEmails.map(email => ({ emailAddress: { address: email } })),
              attachments: attachments
            }
          })
        });

        if (!sendMailResponse.ok) {
          throw new Error(`Falha ao enviar e-mail: ${await sendMailResponse.text()}`);
        }

        console.log('E-mail de notificação enviado com sucesso (MS Graph API).');
      } else {
        console.warn('Variáveis de ambiente do MS Graph não configuradas. E-mail não enviado.');
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
