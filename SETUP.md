# Sistema de Gerenciamento Escolar - Tia Sheila

## Implementação Completa

Sistema educacional completo desenvolvido em React.js com JavaScript puro e Supabase.

### Arquitetura

**Frontend:**
- React.js com JavaScript (sem TypeScript)
- Tailwind CSS v4 para estilização
- Next.js App Router

**Backend:**
- Supabase (PostgreSQL)
- Autenticação com email/senha
- Row Level Security (RLS)

**Storage:**
- Vercel Blob para fotos e documentos

### Funcionalidades Implementadas

✅ **Autenticação**
- Login com email e senha
- Logout
- Proteção de rotas via middleware

✅ **Dashboard**
- Estatísticas (total de alunos, ativos, presença do dia, pagamentos pendentes)
- Lista de alunos recentes
- Botão de logout

✅ **Gerenciamento de Alunos (CRUD)**
- Listagem com grid e visualização em tabela
- Busca e filtros
- Cadastro com foto
- Edição de informações
- Exclusão com confirmação
- Página de detalhes completos

✅ **Presença Diária**
- Seleção de data
- Marcação de presença por aluno
- Armazenamento de histórico

✅ **Controle de Pagamentos**
- Registro de pagamentos por mês
- Status (pago/pendente)
- Edição e exclusão
- Toggle de status

✅ **Gerenciamento de Documentos**
- Upload de documentos por aluno
- Organização por tipo
- Download de arquivos
- Exclusão de documentos

### Estrutura do Banco de Dados

**Tabelas principais:**
- `students`: Dados dos alunos (nome, data_nascimento, foto, responsável, série, turma, status)
- `attendances`: Registro de presença diária
- `payments`: Controle de pagamentos mensais
- `documents`: Documentos dos alunos
- `school_settings`: Configurações da escola

### Passos para Começar

1. **Configure o Supabase:**
   - Execute o script SQL: `scripts/001_create_database.sql`
   - Crie um usuário com credenciais para login (email/senha)

2. **Acesse o sistema:**
   - URL: http://localhost:3000/auth/login (em desenvolvimento)
   - Email: Configure no Supabase
   - Senha: Configure no Supabase

3. **Crie um aluno:**
   - Vá para "Alunos" → "Novo Aluno"
   - Preencha nome, série e turma (obrigatórios)
   - Envie uma foto (opcional)

4. **Marque presença:**
   - Acesse "Presença"
   - Selecione a data
   - Marque os alunos presentes
   - Salve

5. **Registre pagamentos:**
   - Acesse "Pagamentos" → "Novo Pagamento"
   - Selecione aluno, mês, valor e status
   - Salve

6. **Upload de documentos:**
   - Acesse "Documentos" → "Novo Documento"
   - Selecione aluno e arquivo
   - Salve

### Variáveis de Ambiente Necessárias

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Estas são automaticamente configuradas pelo Supabase no v0.

### Fluxo de Autenticação

1. Usuário acessa `/auth/login`
2. Faz login com email/senha
3. Middleware redireciona para `/` (dashboard)
4. Usuário pode acessar todas as páginas protegidas
5. Clica em "Sair" para fazer logout

### Campos Obrigatórios

**Aluno:**
- Nome completo
- Série

**Presença:**
- Data
- Aluno e status

**Pagamento:**
- Aluno
- Mês
- Valor

**Documento:**
- Aluno
- Nome do documento
- Arquivo

### Próximos Passos (Opcional)

1. **Autenticação aprimorada:**
   - Adicionar OAuth (Google, Facebook)
   - Recuperação de senha

2. **Relatórios:**
   - Relatório de presença mensal
   - Relatório de pagamentos
   - Relatório de matrículas

3. **Notificações:**
   - Email com resumo mensal
   - Notificação de pagamentos pendentes

4. **Backup:**
   - Configurar backups automáticos do Supabase

### Contato

**Desenvolvido por:** Alfabetizando Sistemas
**Última atualização:** Janeiro/2026

---

## Estrutura de Pastas

```
app/
├── auth/
│   └── login/
│       └── page.js
├── alunos/
│   ├── page.js (lista)
│   ├── novo/
│   │   └── page.js (cadastro)
│   └── [id]/
│       ├── page.js (detalhes)
│       └── editar/
│           └── page.js (edição)
├── presenca/
│   └── page.js
├── pagamentos/
│   └── page.js
├── documentos/
│   └── page.js
├── api/
│   └── upload/
│       └── route.js
├── layout.js (layout principal)
├── page.js (dashboard)
└── globals.css

lib/
├── supabase/
│   ├── client.js
│   └── server.js

scripts/
└── 001_create_database.sql
```

## Componentes Utilizados

- shadcn/ui (Button, Input, Card, Dialog, Alert, Tabs, etc)
- lucide-react (Ícones)
- Tailwind CSS (Estilização)

## Segurança

- RLS ativado em todas as tabelas
- Proteção de rotas via middleware
- Validação de entrada
- Tokens seguros do Supabase
