import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
                  <th scope="col" className="px-6 py-4 text-center">Evidências</th>
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
                  </tr>
                ))}

                {transportadoras.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
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
