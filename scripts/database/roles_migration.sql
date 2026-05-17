-- ─────────────────────────────────────────────────────────────────────────────
-- PELIMOTION — Roles Migration
-- Projeto: gfaqnkmmbozmhroicqyc (Supabase)
-- Rodar no Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Garantir que profiles.role existe com constraint de valores válidos
--    (o projetos-app já usa profiles.role; esta migration é idempotente)
DO $$
BEGIN
    -- Adiciona coluna se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='profiles' AND column_name='role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'editor' NOT NULL;
    END IF;

    -- Adiciona constraint se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name='profiles_role_check'
    ) THEN
        ALTER TABLE profiles
            ADD CONSTRAINT profiles_role_check
            CHECK (role IN ('admin', 'editor', 'viewer'));
    END IF;
END $$;

-- 2. Índice para queries de role (ex: "todos os admins")
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- 3. View pública para roles (usada por sistemas externos e logs)
CREATE OR REPLACE VIEW user_roles AS
SELECT
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles;

-- 4. Função auxiliar: verifica se o usuário corrente tem o role exato ou superior
--    Uso em RLS: has_role('editor') retorna true para admin e editor
CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND (
              role = required_role
              OR (required_role = 'viewer' AND role IN ('admin', 'editor'))
              OR (required_role = 'editor' AND role = 'admin')
          )
    );
$$;

-- 5. Função auxiliar: retorna o role do usuário atual (para uso em policies)
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- 6. RLS — profiles
--    Usuários veem e editam apenas o próprio perfil
--    Admins veem todos os perfis
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (
        auth.uid() = id
        OR has_role('admin')
    );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- impede que usuário mude o próprio role
        AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (has_role('admin'));

-- 7. RLS — blog_posts (acesso baseado em role)
--    SELECT: público (o blog precisa ler)
--    INSERT/UPDATE: somente editor ou admin
--    DELETE: somente admin
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read blog_posts" ON blog_posts;
CREATE POLICY "Public read blog_posts" ON blog_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Editors can write blog_posts" ON blog_posts;
CREATE POLICY "Editors can write blog_posts" ON blog_posts
    FOR INSERT WITH CHECK (has_role('editor'));

DROP POLICY IF EXISTS "Editors can update blog_posts" ON blog_posts;
CREATE POLICY "Editors can update blog_posts" ON blog_posts
    FOR UPDATE USING (has_role('editor'));

DROP POLICY IF EXISTS "Admins can delete blog_posts" ON blog_posts;
CREATE POLICY "Admins can delete blog_posts" ON blog_posts
    FOR DELETE USING (has_role('admin'));

-- 8. RLS — content_presets
DROP POLICY IF EXISTS "Editors can manage presets" ON content_presets;
CREATE POLICY "Editors can manage presets" ON content_presets
    FOR ALL USING (has_role('editor'));

-- 9. Setar o usuário admin inicial (substitua pelo email real)
--    Execute esta linha separadamente após criar o usuário no Supabase Auth:
--
--    UPDATE profiles SET role = 'admin' WHERE email = 'pelimotionart@gmail.com';
--
-- ─────────────────────────────────────────────────────────────────────────────
-- FIM DA MIGRATION
-- ─────────────────────────────────────────────────────────────────────────────
