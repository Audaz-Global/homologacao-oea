"use client";

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    nomeResponsavel: '',
    cargo: '',
    email: '',
    telefone: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    termo: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert('Ocorreu um erro ao enviar os dados.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de rede ao enviar os dados.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-gradient-to-br from-slate-900 to-indigo-950 p-8">
        <div className="bg-slate-800/70 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center max-w-lg shadow-2xl">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-4">Dados Enviados com Sucesso!</h1>
          <p className="text-slate-300">
            A equipe de Qualidade da Audaz Global analisará suas informações e os documentos enviados. 
            Agradecemos a sua parceria e compromisso com o Programa OEA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-50 p-4 sm:p-8 flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-3xl bg-slate-800/70 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-8 mb-8">
            <img src="/logo.png" alt="Audaz Global" className="h-24 drop-shadow-2xl object-contain" />
            <div className="w-px h-16 bg-white/20"></div>
            <img src="/logo-oea.png" alt="Programa OEA" className="h-20 drop-shadow-2xl object-contain" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Homologação de Transportadoras
          </h1>
          <p className="text-slate-400">
            Formulário de revalidação de requisitos da Portaria COANA 188/2026 para manutenção do Trânsito Aduaneiro Simplificado (Programa OEA).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Seção 1: Dados de Identificação */}
          <div>
            <h2 className="text-xl font-semibold text-slate-200 border-b-2 border-blue-600 pb-2 mb-6">1. Dados de Identificação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Nome da Transportadora (Razão Social) *</label>
                <input required name="razaoSocial" value={formData.razaoSocial} onChange={handleInputChange} className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">CNPJ *</label>
                <input required name="cnpj" value={formData.cnpj} onChange={handleInputChange} className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all" placeholder="00.000.000/0000-00" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Nome do Responsável pelo Preenchimento *</label>
                <input required name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Cargo do Responsável *</label>
                <input required name="cargo" value={formData.cargo} onChange={handleInputChange} className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">E-mail de Contato *</label>
                <input type="email" required name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Telefone/WhatsApp *</label>
                <input required name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full p-3 bg-slate-900/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all" />
              </div>
            </div>
          </div>

          {/* Seção 2: Requisitos da Portaria COANA 188/2026 */}
          <div>
            <h2 className="text-xl font-semibold text-slate-200 border-b-2 border-blue-600 pb-2 mb-6 mt-8">2. Requisitos da Portaria COANA 188/2026</h2>

            {/* Q1 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 leading-relaxed">
                1. A sua transportadora possui contrato com empresa de monitoramento/rastreamento de veículos que já esteja integrada à <strong>API-Argos</strong> da Receita Federal? *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q1" value="sim" onChange={handleInputChange} required className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q1" value="nao" onChange={handleInputChange} className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Não</span>
                </label>
              </div>
              {formData.q1 === 'sim' && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-blue-200 mb-2">Por favor, anexe a cópia do contrato ou a declaração da empresa de rastreamento atestando a integração (Obrigatório).</p>
                  <input type="file" required className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer" />
                </div>
              )}
            </div>

            {/* Q2 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 leading-relaxed">
                2. A sua transportadora realizou a configuração sistêmica para demonstrar que a RFB (Receita Federal do Brasil) está habilitada como <strong>destinatária</strong> dos dados de rastreamento no sistema? *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q2" value="sim" onChange={handleInputChange} required className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q2" value="nao" onChange={handleInputChange} className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Não</span>
                </label>
              </div>
              {formData.q2 === 'sim' && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-blue-200 mb-2">Por favor, anexe um print de tela do sistema ou declaração comprovando a habilitação (Obrigatório).</p>
                  <input type="file" required className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer" />
                </div>
              )}
            </div>

            {/* Q3 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 leading-relaxed">
                3. O sistema de monitoramento de veículos e cargas utilizado pela sua empresa contempla o <strong>monitoramento das portas</strong> das unidades de carga (baús)? *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q3" value="sim" onChange={handleInputChange} required className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q3" value="nao" onChange={handleInputChange} className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Não</span>
                </label>
              </div>
            </div>

            {/* Q4 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 leading-relaxed">
                4. A frota de veículos utilizada nas operações de trânsito simplificado possui carrocerias exclusivamente fechadas, do <strong>tipo Baú</strong>? *(O uso de Sider está vedado como regra)*
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q4" value="sim" onChange={handleInputChange} required className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q4" value="nao" onChange={handleInputChange} className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Não</span>
                </label>
              </div>
            </div>

            {/* Q5 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 leading-relaxed">
                5. A sua transportadora possui capacidade e procedimento definido para gerar e fornecer à Audaz as coordenadas geográficas de cada rota em formato de <strong>arquivo KML</strong>? *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q5" value="sim" onChange={handleInputChange} required className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q5" value="nao" onChange={handleInputChange} className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Não</span>
                </label>
              </div>
            </div>

            {/* Q6 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 leading-relaxed">
                6. A transportadora possui procedimento formal para comunicação imediata à unidade aduaneira de destino <strong>antes</strong> da chegada do veículo, em caso de: abertura de portas no percurso, dano no lacre ou interrupção de envio do sinal de rastreamento? *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q6" value="sim" onChange={handleInputChange} required className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="q6" value="nao" onChange={handleInputChange} className="w-5 h-5 accent-blue-600 bg-slate-700 border-slate-500 cursor-pointer" />
                  <span className="text-slate-200 group-hover:text-white">Não</span>
                </label>
              </div>
            </div>

          </div>

          {/* Termo e Submit */}
          <div className="mt-10 p-6 bg-slate-900/50 rounded-xl border border-white/5 flex gap-4 items-start">
            <input type="checkbox" id="termo" name="termo" checked={formData.termo} onChange={handleInputChange} required className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer shrink-0" />
            <label htmlFor="termo" className="text-sm text-slate-300 cursor-pointer leading-relaxed">
              Declaro sob as penas da lei que as informações prestadas neste formulário e os documentos anexados são verdadeiros. Tenho ciência dos requisitos da Portaria COANA 188/2026 e assumo a responsabilidade pelas devidas atualizações sistêmicas e físicas em nossa frota, essenciais para a manutenção da parceria com a Audaz Global.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando Dados...' : 'Enviar Homologação'}
          </button>

        </form>
      </div>

      {/* Footer com informações da empresa */}
      <footer className="mt-12 text-center text-slate-400 text-sm w-full max-w-3xl">
        <p className="font-semibold text-slate-300">© {new Date().getFullYear()} Audaz Global Logistica Ltda.</p>
        <p className="mt-2">Av. Cassiano Ricardo, 152/156/157, 15º andar - Ed. The One Office Tower</p>
        <p>Jardim Aquarius, São José dos Campos - SP | CEP: 12246-870</p>
        <p className="mt-2">📞 +55 12 3307-1704 | ✉️ oea@audazglobal.com</p>
      </footer>
    </div>
  );
}
