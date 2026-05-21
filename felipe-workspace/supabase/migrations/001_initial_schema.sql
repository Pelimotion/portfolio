-- =============================================================================
-- PELIMOTION OS — Schema Inicial
-- Migração: 001_initial_schema.sql
-- Gerado em: 2026-05-21
-- Baseado em: notion_architecture.json (22 databases mapeados)
-- =============================================================================
-- INSTRUÇÃO: Rodar no Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Rodar na ordem: 001 → 002 → 003
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSÕES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- full-text search em nomes/clientes

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMAS (separação física de domínios)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS pelimotion;
CREATE SCHEMA IF NOT EXISTS personal;

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS GLOBAIS
-- ─────────────────────────────────────────────────────────────────────────────

-- Status de projeto
CREATE TYPE pelimotion.project_stage_enum AS ENUM (
  'negociacao',
  'briefing',
  'debriefing',
  'roteiro',
  'storyboard',
  'montagem',
  'criacao',
  'animacao',
  'aprovacao_1',
  'alteracao',
  'finalizacao',
  'espera',
  'concluido',
  'fixo',
  'pagamento'
);

-- Status de workflow de produção
CREATE TYPE pelimotion.workflow_status_enum AS ENUM (
  'briefing_pre',
  'em_espera',
  'pausa',
  'criacao',
  'animacao',
  'entrega',
  'finalizacao'
);

-- Canal de distribuição
CREATE TYPE pelimotion.channel_enum AS ENUM (
  'interno',
  'redes',
  'mapping',
  'ooh'
);

-- Prioridade
CREATE TYPE pelimotion.priority_enum AS ENUM (
  'alta',
  'media',
  'baixa'
);

-- Status de CRM
CREATE TYPE pelimotion.crm_status_enum AS ENUM (
  'nao_iniciada',
  'prospeccao',
  'follow_up_1',
  'follow_up_2',
  'follow_up_3',
  'proposta_enviada',
  'relacionamento',
  'concluido'
);

-- Procedência/temperatura do lead
CREATE TYPE pelimotion.lead_temp_enum AS ENUM (
  'frio',
  'morno',
  'quente'
);

-- Setor do cliente
CREATE TYPE pelimotion.sector_enum AS ENUM (
  'entretenimento',
  'produtora',
  'jornal',
  'tech',
  'agencia',
  'imobiliario',
  'outro'
);

-- Tipo de despesa
CREATE TYPE pelimotion.expense_type_enum AS ENUM (
  'pessoal_variavel',
  'pessoal_fixo',
  'pelimotion_projeto',
  'pelimotion_fixo'
);

-- Forma de pagamento
CREATE TYPE pelimotion.payment_method_enum AS ENUM (
  'debito_c6',
  'credito_c6',
  'credito_mercado_pago',
  'debito_mercado_pago',
  'debito_viacredi',
  'pix',
  'dinheiro',
  'transferencia',
  'outro'
);

-- Status de tarefa genérico
CREATE TYPE public.task_status_enum AS ENUM (
  'nao_iniciada',
  'em_andamento',
  'concluido'
);

-- Área de tarefa pessoal
CREATE TYPE personal.task_area_enum AS ENUM (
  'casa',
  'rua',
  'pc',
  'comprar',
  'compromisso'
);

-- Área de tarefa PLM
CREATE TYPE pelimotion.plm_task_area_enum AS ENUM (
  'casa',
  'rua',
  'pc',
  'comprar'
);

-- Status de saúde
CREATE TYPE personal.health_status_enum AS ENUM (
  'investigando',
  'em_tratamento',
  'pendente',
  'concluido',
  'acompanhando'
);

-- Tipo de registro de saúde
CREATE TYPE personal.health_type_enum AS ENUM (
  'diario',
  'condicao',
  'medico',
  'tarefa'
);

-- Esfera de saúde
CREATE TYPE personal.health_sphere_enum AS ENUM (
  'corpo',
  'mente',
  'geral'
);

-- Status de projetos pessoais
CREATE TYPE personal.personal_project_status_enum AS ENUM (
  'planejando',
  'pausado',
  'executando',
  'arquivado'
);

-- Área de investimento/gasto
CREATE TYPE personal.expense_area_enum AS ENUM (
  'mercado',
  'casa',
  'internet',
  'carro',
  'pelimotion'
);

-- Prioridade de item casa
CREATE TYPE personal.home_priority_enum AS ENUM (
  'maxima',
  'alta',
  'media',
  'baixa'
);

-- Esfera de item casa
CREATE TYPE personal.home_sphere_enum AS ENUM (
  'geral',
  'banheiro',
  'cozinha',
  'lavanderia',
  'quarto',
  'entrada',
  'sala',
  'ferramenta'
);


-- =============================================================================
-- DOMÍNIO: PELIMOTION (schema: pelimotion)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CLIENTES / CRM
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.crm_contacts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  company       TEXT,
  role_title    TEXT,                          -- "Decisor 1"
  role_title_2  TEXT,                          -- "Decisor 2"
  phone_1       TEXT,
  phone_2       TEXT,
  contact_url_1 TEXT,
  contact_url_2 TEXT,
  website       TEXT,
  sector        pelimotion.sector_enum,
  revenue_brl   NUMERIC(12,2),
  main_events   TEXT,
  main_info     TEXT,
  crm_status    pelimotion.crm_status_enum NOT NULL DEFAULT 'nao_iniciada',
  lead_temp     pelimotion.lead_temp_enum NOT NULL DEFAULT 'frio',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. FORNECEDORES / PRODUTORAS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.suppliers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  city          TEXT,
  state         TEXT,
  neighborhood  TEXT,
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  rating        NUMERIC(3,1),                  -- ex: 4.8
  votes         INT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROJETOS (Pipeline Pelimotion — núcleo do sistema)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  client            TEXT,                       -- nome do cliente (join com CRM opcional)
  crm_contact_id    UUID REFERENCES pelimotion.crm_contacts(id) ON DELETE SET NULL,
  stage             pelimotion.project_stage_enum NOT NULL DEFAULT 'negociacao',
  total_value       NUMERIC(12,2),
  cost_value        NUMERIC(12,2),
  cost_paid         NUMERIC(12,2) DEFAULT 0,
  received_value    NUMERIC(12,2) DEFAULT 0,
  next_payment_value NUMERIC(12,2),
  is_delivered      BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
  next_delivery_at  DATE,
  next_payment_at   DATE,
  closed_at         DATE,
  media_urls        TEXT[],                     -- Bunny.net URLs
  documentation_urls TEXT[],
  suppliers         TEXT[],                     -- nomes dos fornecedores
  assigned_to       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notion_id         TEXT UNIQUE,               -- ID original do Notion (migração)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Colunas calculadas (geradas pelo banco, equivalente às fórmulas do Notion)
  profit            NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(received_value, 0) - COALESCE(cost_paid, 0)
  ) STORED,
  amount_receivable NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(total_value, 0) - COALESCE(received_value, 0)
  ) STORED,
  amount_payable    NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(cost_value, 0) - COALESCE(cost_paid, 0)
  ) STORED
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ETAPAS DE PROJETO (Cronograma — regra de negócio crítica do calendário)
-- ─────────────────────────────────────────────────────────────────────────────
-- Cada projeto tem N etapas com início e fim definidos.
-- O calendário renderiza cada etapa como barra contínua no mês.
CREATE TABLE pelimotion.project_stages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES pelimotion.projects(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,               -- "Motion Design - Animação"
  stage_type      pelimotion.project_stage_enum,
  description_for_client TEXT,
  start_date      DATE NOT NULL,               -- início da barra no calendário
  end_date        DATE NOT NULL,               -- fim da barra no calendário
  delivery_date   DATE,                        -- data pontual de entrega (opcional)
  estimate_days   INT,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INT NOT NULL DEFAULT 0,      -- ordem de exibição
  notion_id       TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT end_after_start CHECK (end_date >= start_date)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. WORKFLOW (consolidação das 3 tabelas duplicadas do Notion)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.workflow_tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID REFERENCES pelimotion.projects(id) ON DELETE SET NULL,
  task_name     TEXT NOT NULL,
  product       TEXT,
  task_type     TEXT,
  duration      TEXT,
  channel       pelimotion.channel_enum,
  status        pelimotion.workflow_status_enum NOT NULL DEFAULT 'briefing_pre',
  priority      pelimotion.priority_enum NOT NULL DEFAULT 'media',
  responsible   TEXT,                          -- "Pelimonster" | "Mejias Motion Tattoo"
  observations  TEXT,
  deadline      DATE,
  notion_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TAREFAS PLM (Tasks Plm)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES pelimotion.projects(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  area        pelimotion.plm_task_area_enum,
  task_date   DATE,
  is_done     BOOLEAN NOT NULL DEFAULT FALSE,
  status      public.task_status_enum NOT NULL DEFAULT 'nao_iniciada',
  notion_id   TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. DESPESAS DE PROJETO (🥗 Despesas — vinculada ao Pipeline)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.project_expenses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID REFERENCES pelimotion.projects(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  value         NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  expense_date  DATE,
  supplier      TEXT,
  notes         TEXT,
  notion_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. CAIXA PELIMOTION
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE pelimotion.cash_area_enum AS ENUM (
  'contabilidade',
  'tributo',
  'escritorio',
  'workstation',
  'clientes'
);

CREATE TABLE pelimotion.cash_flow (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES pelimotion.projects(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  areas       pelimotion.cash_area_enum[],
  due_date    DATE,
  notion_id   TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. PRODUTOS / CATÁLOGO DE SERVIÇOS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  duration_sec  INT,                            -- duração em segundos
  complexity    INT CHECK (complexity BETWEEN 1 AND 10),
  credits       NUMERIC(8,2) GENERATED ALWAYS AS (
    COALESCE(duration_sec, 0) * COALESCE(complexity, 1)
  ) STORED,
  notion_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. ENTRADAS SIMPLES (legado Notion — manter para migração)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE pelimotion.income_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  value       NUMERIC(12,2) NOT NULL DEFAULT 0,
  entry_date  DATE,
  project_id  UUID REFERENCES pelimotion.projects(id) ON DELETE SET NULL,
  notion_id   TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- DOMÍNIO: PESSOAL (schema: personal)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. TAREFAS PESSOAIS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE personal.tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  area        personal.task_area_enum,
  task_date   DATE,
  is_done     BOOLEAN NOT NULL DEFAULT FALSE,
  status      public.task_status_enum NOT NULL DEFAULT 'nao_iniciada',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notion_id   TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. SAÍDAS / GASTOS PESSOAIS (☕ Saídas — 12 props, com recorrência)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE personal.expenses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  value                 NUMERIC(12,2) NOT NULL DEFAULT 0,
  expense_type          pelimotion.expense_type_enum,
  payment_method        pelimotion.payment_method_enum,
  areas                 TEXT[],                -- multi-select: Casa, Carro, Comida, etc.
  competence_date       DATE,                  -- data de competência (dia 1 do mês)
  due_day               INT CHECK (due_day BETWEEN 1 AND 31), -- dia do vencimento
  is_recurring          BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid               BOOLEAN NOT NULL DEFAULT FALSE,
  project_id            UUID REFERENCES pelimotion.projects(id) ON DELETE SET NULL,
  notion_id             TEXT UNIQUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Vencimento calculado (imutável — make_date é immutable no PostgreSQL)
  -- Exemplo: competence_date=2026-05-01, due_day=10 → due_date=2026-05-10
  due_date              DATE GENERATED ALWAYS AS (
    CASE
      WHEN competence_date IS NOT NULL AND due_day IS NOT NULL
      THEN make_date(
        EXTRACT(YEAR  FROM competence_date)::int,
        EXTRACT(MONTH FROM competence_date)::int,
        due_day
      )
      ELSE NULL
    END
  ) STORED
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. INVESTIMENTOS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE personal.investments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  area          personal.expense_area_enum,
  price         NUMERIC(12,2),
  invest_date   DATE,
  is_done       BOOLEAN NOT NULL DEFAULT FALSE,
  notion_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. CASA / LISTA DE NECESSIDADES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE personal.home_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  sphere          personal.home_sphere_enum,
  priority        personal.home_priority_enum NOT NULL DEFAULT 'media',
  estimated_price NUMERIC(10,2),
  notes           TEXT,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  notion_id       TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. SAÚDE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE personal.health_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  entry_type  personal.health_type_enum NOT NULL DEFAULT 'diario',
  sphere      personal.health_sphere_enum NOT NULL DEFAULT 'geral',
  status      personal.health_status_enum NOT NULL DEFAULT 'investigando',
  tags        TEXT[],                          -- multi-select: Sintoma, Reflexão, etc.
  notes       TEXT,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notion_id   TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. PROJETOS PESSOAIS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE personal.projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  status      personal.personal_project_status_enum NOT NULL DEFAULT 'planejando',
  total_value NUMERIC(12,2),
  project_date DATE,
  notion_id   TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
