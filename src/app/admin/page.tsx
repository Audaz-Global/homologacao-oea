import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function RespostaBadge({ resposta }: { resposta: string }) {
  const respostaNormalizada = resposta.trim().toLowerCase();
  const respostaPositiva = respostaNormalizada === 'sim';
  const respostaExibida = respostaPositiva
    ? 'Sim'
    : respostaNormalizada === 'nao' || respostaNormalizada === 'não'
      ? 'Não'
      : resposta;

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${
        respostaPositiva
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-red-500/30 bg-red-500/10 text-red-400'
      }`}
    >
      {respostaExibida}
    </span>
  );
}

export default async function AdminDashboard() {
  const transportadoras = await prisma.transportadora.findMany({
    select: {
      id: true,
      razaoSocial: true,
      cnpj: true,
      email: true,
      telefone: true,
      pontuacao: true,
      statusHomologacao: true,
      createdAt: true,
      q1_apiArgos: true,
      q2_rfbDestino: true,
      q3_monitorPortas: true,
      q4_baus: true,
      q5_kml: true,
      q6_violacao: true,
      evidenciaQ1: true, // we fetch this just to check if it's not null to render the download button
      evidenciaQ2: true, // we fetch this just to check if it's not null to render the download button
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Dashboard de Homologação OEA
            </h1>
            <p className="text-slate-400 mt-2">Visão geral e pontuação das transportadoras parceiras</p>
          </div>
          <img src="/logo.png" alt="Audaz Global Logo" className="h-12 object-contain" />
        </header>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800 text-slate-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4">Data</th>
                  <th scope="col" className="px-6 py-4">Transportadora</th>
                  <th scope="col" className="px-6 py-4">CNPJ</th>
                  <th scope="col" className="px-6 py-4 text-center">Nota (0-60)</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Respostas</th>
                  <th scope="col" className="px-6 py-4 text-center">Evidências</th>
                  <th scope="col" className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transportadoras.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {t.razaoSocial}
                      <div className="text-xs text-slate-500 font-normal mt-1">{t.email} • {t.telefone}</div>
                    </td>
                    <td className="px-6 py-4">{t.cnpj}</td>
                    
                    {/* Nota com cores dinâmicas */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-lg
                        ${t.pontuacao >= 50 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 
                          t.pontuacao >= 30 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 
                          'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                      >
                        {t.pontuacao}
                      </span>
                    </td>

                    {/* Status Visual */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border
                        ${t.statusHomologacao === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          t.statusHomologacao === 'Reprovado' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                      >
                        {t.statusHomologacao}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <details className="group min-w-72">
                        <summary className="mx-auto w-fit cursor-pointer list-none rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20">
                          <span className="group-open:hidden">Ver respostas</span>
                          <span className="hidden group-open:inline">Ocultar respostas</span>
                        </summary>

                        <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-slate-900/80 p-3 shadow-xl">
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                            <span className="text-xs leading-5 text-slate-300">1. Integração com a API-Argos da RFB</span>
                            <RespostaBadge resposta={t.q1_apiArgos} />
                          </div>
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                            <span className="text-xs leading-5 text-slate-300">2. RFB habilitada como destinatária dos dados</span>
                            <RespostaBadge resposta={t.q2_rfbDestino} />
                          </div>
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                            <span className="text-xs leading-5 text-slate-300">3. Monitoramento de abertura de portas</span>
                            <RespostaBadge resposta={t.q3_monitorPortas} />
                          </div>
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                            <span className="text-xs leading-5 text-slate-300">4. Carrocerias fechadas do tipo baú</span>
                            <RespostaBadge resposta={t.q4_baus} />
                          </div>
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                            <span className="text-xs leading-5 text-slate-300">5. Capacidade de fornecer rotas em KML</span>
                            <RespostaBadge resposta={t.q5_kml} />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs leading-5 text-slate-300">6. Comunicação de violações à aduana</span>
                            <RespostaBadge resposta={t.q6_violacao} />
                          </div>
                        </div>
                      </details>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {t.evidenciaQ1 ? (
                          <a href={`/api/evidence/${t.id}/q1`} target="_blank" className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-200 transition-colors flex items-center gap-1" title="Contrato de Rastreador">
                            📥 Evid. 1
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-800 rounded text-xs text-slate-600 opacity-50 cursor-not-allowed">Sem Evid. 1</span>
                        )}
                        {t.evidenciaQ2 ? (
                          <a href={`/api/evidence/${t.id}/q2`} target="_blank" className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-200 transition-colors flex items-center gap-1" title="Print do Sistema RFB">
                            📥 Evid. 2
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-800 rounded text-xs text-slate-600 opacity-50 cursor-not-allowed">Sem Evid. 2</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <details className="group min-w-52">
                        <summary className="mx-auto w-fit cursor-pointer list-none rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20">
                          Excluir
                        </summary>

                        <div className="mt-3 rounded-xl border border-red-500/20 bg-slate-900/90 p-3 text-left shadow-xl">
                          <p className="text-xs font-semibold text-white">
                            Excluir {t.razaoSocial}?
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            Esta ação remove permanentemente o cadastro, as respostas e as evidências.
                          </p>
                          <form method="post" action={`/admin/transportadoras/${t.id}/delete`} className="mt-3">
                            <button
                              type="submit"
                              className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-500"
                            >
                              Confirmar exclusão
                            </button>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}

                {transportadoras.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      Nenhuma transportadora respondeu ao questionário ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-emerald-400 font-bold text-lg mb-2">🟢 Nota 50 a 60</h3>
            <p className="text-slate-400 text-sm">Transportadora atende perfeitamente ou quase perfeitamente aos critérios de segurança da RFB.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-amber-400 font-bold text-lg mb-2">🟡 Nota 30 a 40</h3>
            <p className="text-slate-400 text-sm">Alerta. Falta conformidade em alguns pontos críticos. Requer plano de ação da transportadora.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-red-400 font-bold text-lg mb-2">🔴 Nota 0 a 20</h3>
            <p className="text-slate-400 text-sm">Crítico. Transportadora não possui rastreamento e recursos adequados para operar no Trânsito Simplificado.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
