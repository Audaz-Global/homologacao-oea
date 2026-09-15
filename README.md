# Portal Homologação OEA

> **Módulo:** Compliance e Certificação Aduaneira.
> **Objetivo:** Portal web para parceiros e fornecedores preencherem o questionário de qualificação do programa OEA (Operador Econômico Autorizado), realizando o upload seguro de evidências comprobatórias e automatizando a geração de relatórios em PDF.

---

## Arquitetura e Fluxo de Dados

A aplicação foi construída como um portal Full-Stack (Frontend e Backend na mesma base de código) utilizando as rotas de API do Next.js. 

```mermaid
flowchart TD
    subgraph Frontend_Web [Navegador do Usuário]
        Form[Formulário de Qualificação\nReact + Tailwind]
        Upload[Upload de Evidências\nArquivos/PDFs]
    end

    subgraph Backend_NextJS [Servidor Next.js API]
        Controller[Rota API /submit]
        PDF[Gerador Dinâmico\npdf-lib]
        Mailer[Motor de E-mail\nNodemailer / MS Graph]
    end
    
    subgraph Banco_de_Dados
        DB[(Prisma ORM\nPostgreSQL)]
    end

    Form -->|Respostas Q1-Q6| Controller
    Upload -->|Anexos Base64| Controller
    Controller -->|Calcula Pontuação| DB
    Controller -->|Dados Consolidados| PDF
    PDF -->|Relatório OEA Gerado| Mailer
    Mailer -->|Dispara E-mail com Anexos| Setor_Compliance((Time Audaz / OEA))
```

### Tecnologias Utilizadas
* **Framework:** Next.js (App Router) v16, React 19.
* **Estilização:** TailwindCSS v4.
* **Persistência de Dados:** Prisma ORM.
* **Geração de Documentos:** `pdf-lib` (para montar o termo de adesão e resultados em PDF de forma programática).
* **Notificações:** `nodemailer` e integrações preparadas para o ecossistema Microsoft Graph.

---

## Principais Funcionalidades

1. **Questionário Dinâmico:** Formulário inteligente que coleta Razão Social, CNPJ e cruza com perguntas técnicas (ex: "Possui API Argos?"). Cada resposta positiva soma pontos para o critério OEA.
2. **Coleta de Evidências:** Permite o upload de arquivos anexos obrigatórios atrelados a cada pergunta técnica.
3. **Compilação e Assinatura Automatizada:** Ao enviar, o backend gera um Dossiê em PDF com todas as respostas preenchidas e despacha automaticamente para a equipe interna responsável pela triagem de compliance.

---

## Instalação e Execução Local

```bash
# 1. Instale as dependências (Requer Node.js >= 20.19)
npm install

# 2. Configure as Variáveis de Ambiente no .env
# DATABASE_URL=postgresql://user:pass@host/db
# SMTP_USER, SMTP_PASS, etc...

# 3. Sincronize o Prisma com o Banco de Dados
# O comando abaixo empurrará o Schema pro banco
npx prisma db push --accept-data-loss

# 4. Inicie o Servidor em Modo de Desenvolvimento
npm run dev
```
O portal estará disponível em `http://localhost:3000`.
