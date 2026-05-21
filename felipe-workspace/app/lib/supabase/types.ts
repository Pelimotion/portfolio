/**
 * Tipos TypeScript do Supabase — gerados a partir de 001_initial_schema.sql
 * Atualizar manualmente se o schema mudar, ou rodar:
 *   npx supabase gen types typescript --project-id gfaqnkmmbozmhroicqyc --schema public,pelimotion,personal > lib/supabase/types.ts
 *   (requer `supabase login` com access token)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: 'admin' | 'editor' | 'viewer'
          avatar_url: string | null
          xp: number | null
          level: number | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          avatar_url?: string | null
          xp?: number | null
          level?: number | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          avatar_url?: string | null
          xp?: number | null
          level?: number | null
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string | null
          title: string | null
          status: string | null
          category: string | null
          meta_description: string | null
          meta_title: string | null
          content: string | null
          lang: string | null
          hero_prompt: string | null
          created_at: string | null
          updated_at: string | null
          data: Json | null
        }
        Insert: {
          id?: string
          slug?: string | null
          title?: string | null
          status?: string | null
          category?: string | null
          meta_description?: string | null
          meta_title?: string | null
          content?: string | null
          lang?: string | null
          hero_prompt?: string | null
          created_at?: string | null
          updated_at?: string | null
          data?: Json | null
        }
        Update: {
          id?: string
          slug?: string | null
          title?: string | null
          status?: string | null
          category?: string | null
          meta_description?: string | null
          meta_title?: string | null
          content?: string | null
          lang?: string | null
          hero_prompt?: string | null
          created_at?: string | null
          updated_at?: string | null
          data?: Json | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      current_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      task_status_enum: 'nao_iniciada' | 'em_andamento' | 'concluido'
    }
  }
  pelimotion: {
    Tables: {
      crm_contacts: {
        Row: {
          id: string
          name: string
          company: string | null
          role_title: string | null
          role_title_2: string | null
          phone_1: string | null
          phone_2: string | null
          contact_url_1: string | null
          contact_url_2: string | null
          website: string | null
          sector: Database['pelimotion']['Enums']['sector_enum'] | null
          revenue_brl: number | null
          main_events: string | null
          main_info: string | null
          crm_status: Database['pelimotion']['Enums']['crm_status_enum']
          lead_temp: Database['pelimotion']['Enums']['lead_temp_enum']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          role_title?: string | null
          role_title_2?: string | null
          phone_1?: string | null
          phone_2?: string | null
          contact_url_1?: string | null
          contact_url_2?: string | null
          website?: string | null
          sector?: Database['pelimotion']['Enums']['sector_enum'] | null
          revenue_brl?: number | null
          main_events?: string | null
          main_info?: string | null
          crm_status?: Database['pelimotion']['Enums']['crm_status_enum']
          lead_temp?: Database['pelimotion']['Enums']['lead_temp_enum']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          role_title?: string | null
          role_title_2?: string | null
          phone_1?: string | null
          phone_2?: string | null
          contact_url_1?: string | null
          contact_url_2?: string | null
          website?: string | null
          sector?: Database['pelimotion']['Enums']['sector_enum'] | null
          revenue_brl?: number | null
          main_events?: string | null
          main_info?: string | null
          crm_status?: Database['pelimotion']['Enums']['crm_status_enum']
          lead_temp?: Database['pelimotion']['Enums']['lead_temp_enum']
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          city: string | null
          state: string | null
          neighborhood: string | null
          address: string | null
          phone: string | null
          website: string | null
          rating: number | null
          votes: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city?: string | null
          state?: string | null
          neighborhood?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          rating?: number | null
          votes?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string | null
          state?: string | null
          neighborhood?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          rating?: number | null
          votes?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          client: string | null
          crm_contact_id: string | null
          stage: Database['pelimotion']['Enums']['project_stage_enum']
          total_value: number | null
          cost_value: number | null
          cost_paid: number | null
          received_value: number | null
          next_payment_value: number | null
          is_delivered: boolean
          is_paid: boolean
          next_delivery_at: string | null
          next_payment_at: string | null
          closed_at: string | null
          media_urls: string[] | null
          documentation_urls: string[] | null
          suppliers: string[] | null
          assigned_to: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
          profit: number | null
          amount_receivable: number | null
          amount_payable: number | null
        }
        Insert: {
          id?: string
          name: string
          client?: string | null
          crm_contact_id?: string | null
          stage?: Database['pelimotion']['Enums']['project_stage_enum']
          total_value?: number | null
          cost_value?: number | null
          cost_paid?: number | null
          received_value?: number | null
          next_payment_value?: number | null
          is_delivered?: boolean
          is_paid?: boolean
          next_delivery_at?: string | null
          next_payment_at?: string | null
          closed_at?: string | null
          media_urls?: string[] | null
          documentation_urls?: string[] | null
          suppliers?: string[] | null
          assigned_to?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client?: string | null
          crm_contact_id?: string | null
          stage?: Database['pelimotion']['Enums']['project_stage_enum']
          total_value?: number | null
          cost_value?: number | null
          cost_paid?: number | null
          received_value?: number | null
          next_payment_value?: number | null
          is_delivered?: boolean
          is_paid?: boolean
          next_delivery_at?: string | null
          next_payment_at?: string | null
          closed_at?: string | null
          media_urls?: string[] | null
          documentation_urls?: string[] | null
          suppliers?: string[] | null
          assigned_to?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_stages: {
        Row: {
          id: string
          project_id: string
          name: string
          stage_type: Database['pelimotion']['Enums']['project_stage_enum'] | null
          description_for_client: string | null
          start_date: string
          end_date: string
          delivery_date: string | null
          estimate_days: number | null
          is_done: boolean
          sort_order: number
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          stage_type?: Database['pelimotion']['Enums']['project_stage_enum'] | null
          description_for_client?: string | null
          start_date: string
          end_date: string
          delivery_date?: string | null
          estimate_days?: number | null
          is_done?: boolean
          sort_order?: number
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          stage_type?: Database['pelimotion']['Enums']['project_stage_enum'] | null
          description_for_client?: string | null
          start_date?: string
          end_date?: string
          delivery_date?: string | null
          estimate_days?: number | null
          is_done?: boolean
          sort_order?: number
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflow_tasks: {
        Row: {
          id: string
          project_id: string | null
          task_name: string
          product: string | null
          task_type: string | null
          duration: string | null
          channel: Database['pelimotion']['Enums']['channel_enum'] | null
          status: Database['pelimotion']['Enums']['workflow_status_enum']
          priority: Database['pelimotion']['Enums']['priority_enum']
          responsible: string | null
          observations: string | null
          deadline: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          task_name: string
          product?: string | null
          task_type?: string | null
          duration?: string | null
          channel?: Database['pelimotion']['Enums']['channel_enum'] | null
          status?: Database['pelimotion']['Enums']['workflow_status_enum']
          priority?: Database['pelimotion']['Enums']['priority_enum']
          responsible?: string | null
          observations?: string | null
          deadline?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          task_name?: string
          product?: string | null
          task_type?: string | null
          duration?: string | null
          channel?: Database['pelimotion']['Enums']['channel_enum'] | null
          status?: Database['pelimotion']['Enums']['workflow_status_enum']
          priority?: Database['pelimotion']['Enums']['priority_enum']
          responsible?: string | null
          observations?: string | null
          deadline?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string | null
          name: string
          area: Database['pelimotion']['Enums']['plm_task_area_enum'] | null
          task_date: string | null
          is_done: boolean
          status: Database['public']['Enums']['task_status_enum']
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          area?: Database['pelimotion']['Enums']['plm_task_area_enum'] | null
          task_date?: string | null
          is_done?: boolean
          status?: Database['public']['Enums']['task_status_enum']
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          area?: Database['pelimotion']['Enums']['plm_task_area_enum'] | null
          task_date?: string | null
          is_done?: boolean
          status?: Database['public']['Enums']['task_status_enum']
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_expenses: {
        Row: {
          id: string
          project_id: string | null
          name: string
          value: number
          is_paid: boolean
          expense_date: string | null
          supplier: string | null
          notes: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          value?: number
          is_paid?: boolean
          expense_date?: string | null
          supplier?: string | null
          notes?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          value?: number
          is_paid?: boolean
          expense_date?: string | null
          supplier?: string | null
          notes?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cash_flow: {
        Row: {
          id: string
          project_id: string | null
          name: string
          areas: Database['pelimotion']['Enums']['cash_area_enum'][] | null
          due_date: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          areas?: Database['pelimotion']['Enums']['cash_area_enum'][] | null
          due_date?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          areas?: Database['pelimotion']['Enums']['cash_area_enum'][] | null
          due_date?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          duration_sec: number | null
          complexity: number | null
          credits: number | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          duration_sec?: number | null
          complexity?: number | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          duration_sec?: number | null
          complexity?: number | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      income_entries: {
        Row: {
          id: string
          name: string
          value: number
          entry_date: string | null
          project_id: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          value?: number
          entry_date?: string | null
          project_id?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          value?: number
          entry_date?: string | null
          project_id?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      project_stage_enum:
        | 'negociacao'
        | 'briefing'
        | 'debriefing'
        | 'roteiro'
        | 'storyboard'
        | 'montagem'
        | 'criacao'
        | 'animacao'
        | 'aprovacao_1'
        | 'alteracao'
        | 'finalizacao'
        | 'espera'
        | 'concluido'
        | 'fixo'
        | 'pagamento'
      workflow_status_enum:
        | 'briefing_pre'
        | 'em_espera'
        | 'pausa'
        | 'criacao'
        | 'animacao'
        | 'entrega'
        | 'finalizacao'
      channel_enum: 'interno' | 'redes' | 'mapping' | 'ooh'
      priority_enum: 'alta' | 'media' | 'baixa'
      crm_status_enum:
        | 'nao_iniciada'
        | 'prospeccao'
        | 'follow_up_1'
        | 'follow_up_2'
        | 'follow_up_3'
        | 'proposta_enviada'
        | 'relacionamento'
        | 'concluido'
      lead_temp_enum: 'frio' | 'morno' | 'quente'
      sector_enum:
        | 'entretenimento'
        | 'produtora'
        | 'jornal'
        | 'tech'
        | 'agencia'
        | 'imobiliario'
        | 'outro'
      expense_type_enum:
        | 'pessoal_variavel'
        | 'pessoal_fixo'
        | 'pelimotion_projeto'
        | 'pelimotion_fixo'
      payment_method_enum:
        | 'debito_c6'
        | 'credito_c6'
        | 'credito_mercado_pago'
        | 'debito_mercado_pago'
        | 'debito_viacredi'
        | 'pix'
        | 'dinheiro'
        | 'transferencia'
        | 'outro'
      plm_task_area_enum: 'casa' | 'rua' | 'pc' | 'comprar'
      cash_area_enum:
        | 'contabilidade'
        | 'tributo'
        | 'escritorio'
        | 'workstation'
        | 'clientes'
    }
  }
  personal: {
    Tables: {
      tasks: {
        Row: {
          id: string
          name: string
          description: string | null
          area: Database['personal']['Enums']['task_area_enum'] | null
          task_date: string | null
          is_done: boolean
          status: Database['public']['Enums']['task_status_enum']
          assigned_to: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          area?: Database['personal']['Enums']['task_area_enum'] | null
          task_date?: string | null
          is_done?: boolean
          status?: Database['public']['Enums']['task_status_enum']
          assigned_to?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          area?: Database['personal']['Enums']['task_area_enum'] | null
          task_date?: string | null
          is_done?: boolean
          status?: Database['public']['Enums']['task_status_enum']
          assigned_to?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          name: string
          value: number
          expense_type: Database['pelimotion']['Enums']['expense_type_enum'] | null
          payment_method: Database['pelimotion']['Enums']['payment_method_enum'] | null
          areas: string[] | null
          competence_date: string | null
          due_day: number | null
          is_recurring: boolean
          is_paid: boolean
          project_id: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          name: string
          value?: number
          expense_type?: Database['pelimotion']['Enums']['expense_type_enum'] | null
          payment_method?: Database['pelimotion']['Enums']['payment_method_enum'] | null
          areas?: string[] | null
          competence_date?: string | null
          due_day?: number | null
          is_recurring?: boolean
          is_paid?: boolean
          project_id?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          value?: number
          expense_type?: Database['pelimotion']['Enums']['expense_type_enum'] | null
          payment_method?: Database['pelimotion']['Enums']['payment_method_enum'] | null
          areas?: string[] | null
          competence_date?: string | null
          due_day?: number | null
          is_recurring?: boolean
          is_paid?: boolean
          project_id?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          name: string
          description: string | null
          area: Database['personal']['Enums']['expense_area_enum'] | null
          price: number | null
          invest_date: string | null
          is_done: boolean
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          area?: Database['personal']['Enums']['expense_area_enum'] | null
          price?: number | null
          invest_date?: string | null
          is_done?: boolean
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          area?: Database['personal']['Enums']['expense_area_enum'] | null
          price?: number | null
          invest_date?: string | null
          is_done?: boolean
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      home_items: {
        Row: {
          id: string
          name: string
          sphere: Database['personal']['Enums']['home_sphere_enum'] | null
          priority: Database['personal']['Enums']['home_priority_enum']
          estimated_price: number | null
          notes: string | null
          is_done: boolean
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sphere?: Database['personal']['Enums']['home_sphere_enum'] | null
          priority?: Database['personal']['Enums']['home_priority_enum']
          estimated_price?: number | null
          notes?: string | null
          is_done?: boolean
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sphere?: Database['personal']['Enums']['home_sphere_enum'] | null
          priority?: Database['personal']['Enums']['home_priority_enum']
          estimated_price?: number | null
          notes?: string | null
          is_done?: boolean
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_log: {
        Row: {
          id: string
          name: string
          entry_type: Database['personal']['Enums']['health_type_enum']
          sphere: Database['personal']['Enums']['health_sphere_enum']
          status: Database['personal']['Enums']['health_status_enum']
          tags: string[] | null
          notes: string | null
          log_date: string
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          entry_type?: Database['personal']['Enums']['health_type_enum']
          sphere?: Database['personal']['Enums']['health_sphere_enum']
          status?: Database['personal']['Enums']['health_status_enum']
          tags?: string[] | null
          notes?: string | null
          log_date?: string
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          entry_type?: Database['personal']['Enums']['health_type_enum']
          sphere?: Database['personal']['Enums']['health_sphere_enum']
          status?: Database['personal']['Enums']['health_status_enum']
          tags?: string[] | null
          notes?: string | null
          log_date?: string
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          status: Database['personal']['Enums']['personal_project_status_enum']
          total_value: number | null
          project_date: string | null
          notion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: Database['personal']['Enums']['personal_project_status_enum']
          total_value?: number | null
          project_date?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: Database['personal']['Enums']['personal_project_status_enum']
          total_value?: number | null
          project_date?: string | null
          notion_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_area_enum: 'casa' | 'rua' | 'pc' | 'comprar' | 'compromisso'
      expense_area_enum: 'mercado' | 'casa' | 'internet' | 'carro' | 'pelimotion'
      health_status_enum:
        | 'investigando'
        | 'em_tratamento'
        | 'pendente'
        | 'concluido'
        | 'acompanhando'
      health_type_enum: 'diario' | 'condicao' | 'medico' | 'tarefa'
      health_sphere_enum: 'corpo' | 'mente' | 'geral'
      personal_project_status_enum:
        | 'planejando'
        | 'pausado'
        | 'executando'
        | 'arquivado'
      home_priority_enum: 'maxima' | 'alta' | 'media' | 'baixa'
      home_sphere_enum:
        | 'geral'
        | 'banheiro'
        | 'cozinha'
        | 'lavanderia'
        | 'quarto'
        | 'entrada'
        | 'sala'
        | 'ferramenta'
    }
  }
}

// Shortcuts — acesso direto ao tipo Row de cada tabela
export type Project = Database['pelimotion']['Tables']['projects']['Row']
export type ProjectStage = Database['pelimotion']['Tables']['project_stages']['Row']
export type WorkflowTask = Database['pelimotion']['Tables']['workflow_tasks']['Row']
export type CrmContact = Database['pelimotion']['Tables']['crm_contacts']['Row']
export type Supplier = Database['pelimotion']['Tables']['suppliers']['Row']
export type ProjectExpense = Database['pelimotion']['Tables']['project_expenses']['Row']
export type CashFlow = Database['pelimotion']['Tables']['cash_flow']['Row']
export type Product = Database['pelimotion']['Tables']['products']['Row']
export type PlmTask = Database['pelimotion']['Tables']['tasks']['Row']
export type IncomeEntry = Database['pelimotion']['Tables']['income_entries']['Row']

export type PersonalTask = Database['personal']['Tables']['tasks']['Row']
export type PersonalExpense = Database['personal']['Tables']['expenses']['Row']
export type Investment = Database['personal']['Tables']['investments']['Row']
export type HomeItem = Database['personal']['Tables']['home_items']['Row']
export type HealthLog = Database['personal']['Tables']['health_log']['Row']
export type PersonalProject = Database['personal']['Tables']['projects']['Row']

export type Profile = Database['public']['Tables']['profiles']['Row']
