import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

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

    // --- GERAR PDF COM OS DADOS DO FORMULÁRIO (ESTILO TELA PRINCIPAL) ---
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const safe = (text: string) => {
      return (text || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x00-\x7F]/g, "");
    };

    const formatDate = (d: Date) => {
      try {
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return '';
      }
    };

    const drawInputBox = (page: any, label: string, val: string, x: number, y: number, width: number, height: number) => {
      page.drawText(label, {
        x, y: y + height + 4,
        size: 8,
        font: fontBold,
        color: rgb(148/255, 163/255, 184/255)
      });
      page.drawRectangle({
        x, y, width, height,
        color: rgb(15/255, 23/255, 42/255),
        borderColor: rgb(51/255, 65/255, 85/255),
        borderWidth: 1
      });
      page.drawText(val, {
        x: x + 8, y: y + 10,
        size: 9,
        font,
        color: rgb(255/255, 255/255, 255/255)
      });
    };

    const drawTextWrapped = (page: any, text: string, x: number, y: number, width: number, size: number, color: any) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > width && n > 0) {
          page.drawText(line, { x, y: currentY, size, font, color });
          line = words[n] + ' ';
          currentY -= (size + 4);
        } else {
          line = testLine;
        }
      }
      page.drawText(line, { x, y: currentY, size, font, color });
      return currentY;
    };

    const drawTextWrappedCentered = (page: any, text: string, x: number, y: number, width: number, size: number, color: any) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > width && n > 0) {
          const lineW = font.widthOfTextAtSize(line, size);
          page.drawText(line, { x: x + (width - lineW) / 2, y: currentY, size, font, color });
          line = words[n] + ' ';
          currentY -= (size + 4);
        } else {
          line = testLine;
        }
      }
      const lineW = font.widthOfTextAtSize(line, size);
      page.drawText(line, { x: x + (width - lineW) / 2, y: currentY, size, font, color });
    };

    const drawRadioOptions = (page: any, isSim: boolean, x: number, y: number) => {
      page.drawCircle({
        x: x + 6, y: y + 4,
        radius: 5,
        color: isSim ? rgb(34/255, 197/255, 94/255) : rgb(15/255, 23/255, 42/255),
        borderColor: rgb(71/255, 85/255, 105/255),
        borderWidth: 1
      });
      page.drawText("Sim", { x: x + 15, y, size: 8, font, color: rgb(255/255, 255/255, 255/255) });
      
      page.drawCircle({
        x: x + 60, y: y + 4,
        radius: 5,
        color: !isSim ? rgb(239/255, 68/255, 68/255) : rgb(15/255, 23/255, 42/255),
        borderColor: rgb(71/255, 85/255, 105/255),
        borderWidth: 1
      });
      page.drawText("Nao", { x: x + 69, y, size: 8, font, color: rgb(255/255, 255/255, 255/255) });
    };

    // Pagina 1
    const page1 = pdfDoc.addPage([595, 842]);
    page1.drawRectangle({
      x: 0, y: 0,
      width: 595, height: 842,
      color: rgb(15/255, 23/255, 42/255)
    });
    
    // Logos
    const targetLogo = path.join(process.cwd(), 'public', 'logo.png');
    const targetOeaLogo = path.join(process.cwd(), 'public', 'logo-oea.png');
    
    if (fs.existsSync(targetLogo)) {
      try {
        const logoBytes = fs.readFileSync(targetLogo);
        const logoImg = await pdfDoc.embedPng(logoBytes);
        page1.drawImage(logoImg, { x: 180, y: 760, width: 80, height: 40 });
      } catch (e) {}
    }
    page1.drawLine({
      start: { x: 285, y: 760 },
      end: { x: 285, y: 800 },
      color: rgb(51/255, 65/255, 85/255),
      thickness: 1
    });
    if (fs.existsSync(targetOeaLogo)) {
      try {
        const logoOeaBytes = fs.readFileSync(targetOeaLogo);
        const logoOeaImg = await pdfDoc.embedPng(logoOeaBytes);
        page1.drawImage(logoOeaImg, { x: 305, y: 762, width: 80, height: 36 });
      } catch (e) {}
    }
    
    // Titulo
    const titleTextStr = "Homologacao de Transportadoras";
    const titleW = fontBold.widthOfTextAtSize(titleTextStr, 18);
    page1.drawText(titleTextStr, {
      x: (595 - titleW) / 2,
      y: 720,
      size: 18,
      font: fontBold,
      color: rgb(255/255, 255/255, 255/255)
    });
    
    // Subtitulo
    const subTextStr = "Formulario de revalidacao de requisitos da Portaria COANA 188/2026 para manutencao do Transito Aduaneiro Simplificado (Programa OEA).";
    drawTextWrappedCentered(page1, subTextStr, 50, 695, 495, 8, rgb(148/255, 163/255, 184/255));
    
    // Painel 1: Dados de Identificacao
    page1.drawRectangle({
      x: 40, y: 355,
      width: 515, height: 310,
      color: rgb(30/255, 41/255, 59/255),
      borderColor: rgb(51/255, 65/255, 85/255),
      borderWidth: 1
    });
    
    page1.drawText("1. Dados de Identificacao", {
      x: 55, y: 640,
      size: 12,
      font: fontBold,
      color: rgb(255/255, 255/255, 255/255)
    });
    
    page1.drawLine({
      start: { x: 55, y: 632 },
      end: { x: 540, y: 632 },
      color: rgb(59/255, 130/255, 246/255),
      thickness: 1.5
    });
    
    drawInputBox(page1, "Nome da Transportadora (Razao Social) *", safe(razaoSocial), 55, 560, 235, 32);
    drawInputBox(page1, "CNPJ *", safe(cnpj), 305, 560, 235, 32);
    
    drawInputBox(page1, "Nome do Responsavel pelo Preenchimento *", safe(nomeResponsavel), 55, 490, 235, 32);
    drawInputBox(page1, "Cargo do Responsavel *", safe(cargo), 305, 490, 235, 32);
    
    drawInputBox(page1, "E-mail de Contato *", safe(email), 55, 420, 235, 32);
    drawInputBox(page1, "Telefone/WhatsApp *", safe(telefone), 305, 420, 235, 32);
    
    // Painel 2: Requisitos COANA (Q1 e Q2)
    page1.drawRectangle({
      x: 40, y: 50,
      width: 515, height: 280,
      color: rgb(30/255, 41/255, 59/255),
      borderColor: rgb(51/255, 65/255, 85/255),
      borderWidth: 1
    });
    
    page1.drawText("2. Requisitos da Portaria COANA 188/2026", {
      x: 55, y: 305,
      size: 12,
      font: fontBold,
      color: rgb(255/255, 255/255, 255/255)
    });
    
    page1.drawLine({
      start: { x: 55, y: 297 },
      end: { x: 540, y: 297 },
      color: rgb(59/255, 130/255, 246/255),
      thickness: 1.5
    });
    
    let yQ1 = 280;
    yQ1 = drawTextWrapped(page1, "1. A sua transportadora possui contrato com empresa de monitoramento/rastreamento de veiculos que ja esteja integrada a API-Argos da Receita Federal? *", 55, yQ1 - 15, 480, 9, rgb(255/255, 255/255, 255/255));
    drawRadioOptions(page1, q1 === 'sim', 55, yQ1 - 18);
    
    let yQ2 = yQ1 - 38;
    yQ2 = drawTextWrapped(page1, "2. A sua transportadora realizou a configuracao sistemica para demonstrar que a RFB esta habilitada como destinataria dos dados de rastreamento no sistema? *", 55, yQ2 - 15, 480, 9, rgb(255/255, 255/255, 255/255));
    drawRadioOptions(page1, q2 === 'sim', 55, yQ2 - 18);
    
    // Pagina 2
    const page2 = pdfDoc.addPage([595, 842]);
    page2.drawRectangle({
      x: 0, y: 0,
      width: 595, height: 842,
      color: rgb(15/255, 23/255, 42/255)
    });
    
    // Painel 3: Q3, Q4, Q5, Q6
    page2.drawRectangle({
      x: 40, y: 350,
      width: 515, height: 440,
      color: rgb(30/255, 41/255, 59/255),
      borderColor: rgb(51/255, 65/255, 85/255),
      borderWidth: 1
    });
    
    let yQ3 = 770;
    yQ3 = drawTextWrapped(page2, "3. O sistema de monitoramento de veiculos e cargas utilizado pela sua empresa contempla o monitoramento das portas das unidades de carga (baus)? *", 55, yQ3 - 15, 480, 9, rgb(255/255, 255/255, 255/255));
    drawRadioOptions(page2, q3 === 'sim', 55, yQ3 - 18);
    
    let yQ4 = yQ3 - 38;
    yQ4 = drawTextWrapped(page2, "4. A frota de veiculos utilizada nas operacoes de transito simplificado possui carrocerias exclusivamente fechadas do tipo Bau? *(O uso de Sider esta vedado como regra)*", 55, yQ4 - 15, 480, 9, rgb(255/255, 255/255, 255/255));
    drawRadioOptions(page2, q4 === 'sim', 55, yQ4 - 18);
    
    let yQ5 = yQ4 - 38;
    yQ5 = drawTextWrapped(page2, "5. A sua transportadora possui capacidade e procedimento definido para gerar e fornecer a Audaz as coordenadas geograficas de cada rota em formato de arquivo KML? *", 55, yQ5 - 15, 480, 9, rgb(255/255, 255/255, 255/255));
    drawRadioOptions(page2, q5 === 'sim', 55, yQ5 - 18);
    
    let yQ6 = yQ5 - 38;
    yQ6 = drawTextWrapped(page2, "6. A transportadora possui procedimento formal para comunicacao imediata a unidade aduaneira de destino antes da chegada do veiculo, em caso de: abertura de portas no percurso, dano no lacre ou interrupcao de envio do sinal de rastreamento? *", 55, yQ6 - 15, 480, 9, rgb(255/255, 255/255, 255/255));
    drawRadioOptions(page2, q6 === 'sim', 55, yQ6 - 18);
    
    // Painel 4: Termo
    page2.drawRectangle({
      x: 40, y: 180,
      width: 515, height: 150,
      color: rgb(30/255, 41/255, 59/255),
      borderColor: rgb(51/255, 65/255, 85/255),
      borderWidth: 1
    });
    
    page2.drawRectangle({
      x: 55, y: 290,
      width: 14, height: 14,
      color: termoAceito ? rgb(59/255, 130/255, 246/255) : rgb(15/255, 23/255, 42/255),
      borderColor: rgb(71/255, 85/255, 105/255),
      borderWidth: 1
    });
    if (termoAceito) {
      page2.drawText("X", { x: 59, y: 293, size: 9, font: fontBold, color: rgb(255/255, 255/255, 255/255) });
    }
    
    const termoTextStr = "Declaro sob as penas da lei que as informacoes prestadas neste formulario e os documentos anexados sao verdadeiros. Tenho ciencia dos requisitos da Portaria COANA 188/2026 e assumo a responsabilidade pelas devidas atualizacoes.";
    drawTextWrapped(page2, termoTextStr, 78, 303, 455, 8.5, rgb(255/255, 255/255, 255/255));
    
    // Panel 5: Score Badge
    const badgeColor = pontuacao >= 50 ? rgb(22/255, 101/255, 52/255) : pontuacao >= 30 ? rgb(146/255, 64/255, 14/255) : rgb(153/255, 27/255, 27/255);
    const badgeBg = pontuacao >= 50 ? rgb(220/255, 252/255, 231/255) : pontuacao >= 30 ? rgb(254/255, 243/255, 199/255) : rgb(254/255, 226/255, 226/255);
    
    page2.drawRectangle({
      x: 40, y: 70,
      width: 515, height: 90,
      color: badgeBg,
      borderColor: badgeColor,
      borderWidth: 1
    });
    
    page2.drawText(`Status de Homologacao: Pendente`, {
      x: 55, y: 130,
      size: 12,
      font: fontBold,
      color: badgeColor
    });
    
    page2.drawText(`Pontuacao Total: ${pontuacao} / 60 pontos`, {
      x: 55, y: 105,
      size: 11,
      font: fontBold,
      color: badgeColor
    });
    
    page2.drawText(`Data de Preenchimento: ${formatDate(new Date())}`, {
      x: 55, y: 85,
      size: 9,
      font,
      color: badgeColor
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    attachments.push({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: `Ficha_Cadastro_${razaoSocial.replace(/[^a-zA-Z0-9-_]/g, '_')}_${cnpj.replace(/[^0-9]/g, '')}.pdf`,
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
