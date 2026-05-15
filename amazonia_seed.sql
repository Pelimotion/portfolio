-- ==============================================================================
-- SCRIPT DE POPULACAO: Amazonia como Essencia (v3 - Completo)
-- Execute no SQL Editor do Supabase
-- ==============================================================================

DO $$
DECLARE
  v_root_hub_id  uuid := '00000000-0000-0000-0000-000000000000';
  v_project_id   uuid := gen_random_uuid();
  v_pipeline_id  uuid := gen_random_uuid();

  -- IDs dos usuarios (buscados por email)
  v_uid_felipe   uuid;
  v_uid_beleite  uuid;
  v_uid_rodrigo  uuid;

  -- Properties IDs
  v_prop_status_id uuid := gen_random_uuid();
  v_prop_ato_id    uuid := gen_random_uuid();
  v_prop_resp_id   uuid := gen_random_uuid();
  v_prop_data_id   uuid := gen_random_uuid();
  v_prop_desc_id   uuid := gen_random_uuid();

  -- Loop vars
  v_scene_id uuid;
  v_position integer := 0;
  val_status text;
  val_ato    text;
  val_resp   text;

  -- [Ato, Responsavel, Titulo, Status, Data, Descricao]
  v_scenes text[][] := ARRAY[
    -- Ato 01
    ARRAY['Ato 01','Rodrigo','Cena 01','Styleframes','2026-05-22','Inicia em escuridao com movimento lento, vapor baixo e som grave quase subaquatico. Dona Onete surge em escala realista e narra o que havia antes da floresta. Uma pequena vibracao luminosa atravessa o espaco.'],
    ARRAY['Ato 01','Rodrigo','Cena 02','Styleframes','2026-05-22','Evento K-Pg. Som surdo de poeira ate explosao com clarao. Poeira em camera lenta. Dona Onete descreve o impacto de 60 milhoes de anos atras (frio, escuridao, recomeco).'],
    ARRAY['Ato 01','Rodrigo','Cena 03A','Styleframes','2026-05-22','Pequenos brotos aparecem no chao (time-lapse organico), sons de umidade. A vegetacao acordou com pressa e se abracou formando o dossel verde.'],
    ARRAY['Ato 01','Rodrigo','Cena 03B','Backlog','2026-06-10','A vegetacao adensa e ocorre a diversificacao das especies (multiplicacao de passaro, peixe ou borboleta). Encaixe perfeito da flora e fauna.'],
    ARRAY['Ato 01','Rodrigo','Cena 04A','Backlog','2026-06-10','Imagens de nuvens velozes, chuva, cheias e secas (variacao climatica).'],
    ARRAY['Ato 01','Rodrigo','Cena 04B','Backlog','2026-06-10','Dona Onete explica o isolamento das populacoes. A floresta faz movimentos de contracao a distancia.'],
    ARRAY['Ato 01','Rodrigo','Cena 04C','Backlog','2026-06-10','A terra se parte (Pangeia). Imagens se fragmentam com novas cores e som grave. A diversificacao da vida no aperto da ilha.'],
    ARRAY['Ato 01','Rodrigo','Cena 05','Backlog','2026-06-10','O ruido aumenta e a Cordilheira dos Andes cresce em escala monumental pelo oeste.'],
    ARRAY['Ato 01','Rodrigo','Cena 06A','Backlog','2026-06-10','A agua para de ir para o oeste, se acumula nos Andes e inverte o curso para o leste.'],
    ARRAY['Ato 01','Rodrigo','Cena 06B','Backlog','2026-06-10','Zoom out acompanhando a expansao das varzeas. A agua redesenha o chao ate o oceano.'],
    ARRAY['Ato 01','Rodrigo','Cena 06C','Backlog','2026-06-10','O grande rio atravessa o continente. Ilhas cobertas de verde. Sol se poe, lua nasce e Dona Onete canta Lua Namoradeira.'],
    -- Ato 02
    ARRAY['Ato 02','Felipe','Cena 07A','Styleframes','2026-05-22','Floresta noturna, pulsacao ritmica. Tracos de neon eletricos percorrem troncos revelando a comunicacao em rede da mata.'],
    ARRAY['Ato 02','Felipe','Cena 07B','Styleframes','2026-05-22','Gang do Eletro aparece. Discurso sobre a vida se espalhando no ambiente denso.'],
    ARRAY['Ato 02','Felipe','Cena 07C','Styleframes','2026-05-22','Projecao dos letreiros: +10% das especies do planeta e menos de 1% da superficie.'],
    ARRAY['Ato 02','Felipe','Cena 08','Backlog','2026-06-10','Terras Firmes. Floresta de plano vertical, luz filtrada. Keila descreve o ambiente protegido. Letreiro: +390 bilhoes de arvores.'],
    ARRAY['Ato 02','Felipe','Cena 09','Backlog','2026-06-10','Varzea. A agua avanca, submergindo troncos, trazendo barro dos Andes. Maderito conduz. Gang declara em coro: Abundancia.'],
    ARRAY['Ato 02','Felipe','Cena 10','Backlog','2026-06-10','Igapo. Agua escurece (espelho profundo). Will em uma canoa rabeta explica a acidez e lentidao da agua preta.'],
    ARRAY['Ato 02','Felipe','Cena 11','Backlog','2026-06-10','Campinaranas. Solo de areia branca, troncos finos, invasao de luz. DJ Waldo apresenta o grafico das ilhas de luz.'],
    ARRAY['Ato 02','Felipe','Cena 12','Backlog','2026-06-10','Savana. Horizonte aberto, capins ondulando. Elenco fala da resistencia ao fogo.'],
    ARRAY['Ato 02','Felipe','Cena 13','Backlog','2026-06-10','Mangue. Raizes gigantes, guaras vermelhos, som de lama. Letreiro: bercario da vida do maior manguezal continuo.'],
    ARRAY['Ato 02','Felipe','Cena 14','Backlog','2026-06-10','Paramos. Clima frio, neblina. Foco nas plantas peludas (frailejones) que extraem umidade.'],
    ARRAY['Ato 02','Felipe','Cena 15','Backlog','2026-06-10','Banzeiro sonoro com Dona Onete. Biomas se sobrepoem, celebrando que nada vive isolado.'],
    -- Ato 03
    ARRAY['Ato 03','Be Leite','Cena 16','Styleframes','2026-05-22','Juma Xipaia projetada em tamanho real fazendo saudacao em seu idioma. Fala sobre os rios fluirem como veias.'],
    ARRAY['Ato 03','Be Leite','Cena 17','Styleframes','2026-05-22','Letreiro: Maior bacia hidrografica do planeta. Projecao de canoa pescando Mapara.'],
    ARRAY['Ato 03','Be Leite','Cena 18','Styleframes','2026-05-22','Aguas do rio espalham sedimentos e desenham novas terras.'],
    ARRAY['Ato 03','Be Leite','Cena 19A','Backlog','2026-06-10','Rios Voadores. O vapor sai dos troncos e chove no extremo oposto da instalacao.'],
    ARRAY['Ato 03','Be Leite','Cena 19B','Backlog','2026-06-10','Letreiro sobre Rios Voadores: 20 bilhoes de toneladas de vapor por dia.'],
    ARRAY['Ato 03','Be Leite','Cena 20','Backlog','2026-06-10','Mergulho no chao. Fios luminosos (micorrizas). Txai Surui e Juma detalham a troca de nutrientes e bioluminescencia dos fungos.'],
    ARRAY['Ato 03','Be Leite','Cena 21','Backlog','2026-06-10','Close em abelha encostando o polen em flor de Acai (dependencia do minusculo).'],
    ARRAY['Ato 03','Be Leite','Cena 22','Backlog','2026-06-10','Douradas em ciclo 360 e um passaro cruza o publico unindo os recantos.'],
    ARRAY['Ato 03','Be Leite','Cena 23','Backlog','2026-06-10','Juma reflete sobre os ribeirinhos. Maos puxando redes, colhendo acai e trancando cestos.'],
    ARRAY['Ato 03','Be Leite','Cena 24','Backlog','2026-06-10','Tracos luminosos se conectam ate o rompimento de um fio. Paisagem perde cor e Juma interage: Voce sente essa perda?'],
    -- Ato 04
    ARRAY['Ato 04','A definir','Cena 25A','Styleframes','2026-05-22','Sons da cidade misturados ao Tecnobrega. Imagens de tracos urbanos e capitais amazonicas.'],
    ARRAY['Ato 04','A definir','Cena 25B','Styleframes','2026-05-22','Elenco pontua que a vida urbana moderna e apoiada na estrutura da floresta.'],
    ARRAY['Ato 04','A definir','Cena 26A','Styleframes','2026-05-22','Palavras Agua, Solo, Ar, Bicho, Gente surgem no cenario.'],
    ARRAY['Ato 04','A definir','Cena 26B','Backlog','2026-06-10','Frases cruzam as imagens: Se tu respira, tu ja tas nisso.'],
    ARRAY['Ato 04','A definir','Cena 26C','Backlog','2026-06-10','Frases sobre o alimento: Se tu comes, tu ja estas nisso (imagem de acai batido).'],
    ARRAY['Ato 04','A definir','Cena 26D','Backlog','2026-06-10','Apice da mensagem. O coletivo avisa em coro: A gente e parte.'],
    ARRAY['Ato 04','A definir','Cena 27','Backlog','2026-06-10','Cenario rareia em particulas ate o Blackout. Dona Onete ressurge questionando: Qual e o rastro que tu vais deixar nessa historia? Fim com creditos e todos comemorando.']
  ];

BEGIN

  -- =========================================================
  -- 1. Buscar IDs reais dos usuarios pelo email
  -- =========================================================
  SELECT id INTO v_uid_felipe  FROM auth.users WHERE email = 'conceicao.felipe@gmail.com' LIMIT 1;
  SELECT id INTO v_uid_beleite FROM auth.users WHERE email = 'beleite@tocahub.co'         LIMIT 1;
  SELECT id INTO v_uid_rodrigo FROM auth.users WHERE email = 'rodrigo@tocahub.co'         LIMIT 1;

  -- =========================================================
  -- 2. Criar Projeto na tabela pages (sistema atual)
  -- =========================================================
  INSERT INTO public.pages (id, title, parent_id, page_type, position, content, is_archived)
  VALUES (v_project_id, 'Amazonia como Essencia', v_root_hub_id, 'database_item', 0, '', false);

  -- =========================================================
  -- 3. Criar Projeto na tabela legada projects (compatibilidade)
  -- =========================================================
  INSERT INTO public.projects (id, title, description, status, created_at)
  VALUES (v_project_id, 'Amazonia como Essencia', 'Cliente: MAZ', 'briefing', now())
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================
  -- 4. Vincular usuarios ao projeto (project_members)
  -- =========================================================
  IF v_uid_felipe IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_uid_felipe, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_uid_beleite IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_uid_beleite, 'editor')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_uid_rodrigo IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_uid_rodrigo, 'editor')
    ON CONFLICT DO NOTHING;
  END IF;

  -- =========================================================
  -- 5. Criar Pipeline Database (filho do projeto)
  -- =========================================================
  INSERT INTO public.pages (id, title, parent_id, page_type, position, content, is_archived)
  VALUES (v_pipeline_id, 'Pipeline', v_project_id, 'database', 0, '', false);

  -- =========================================================
  -- 6. Criar Propriedades do Pipeline
  -- =========================================================
  INSERT INTO public.properties (id, database_id, name, property_type, position, config) VALUES
    (v_prop_status_id, v_pipeline_id, 'Status', 'status', 0, '{
      "options": [
        {"id": "styleframes", "label": "Styleframes", "color": "blue"},
        {"id": "backlog",     "label": "Backlog",      "color": "gray"},
        {"id": "animacao",    "label": "Animacao",     "color": "yellow"},
        {"id": "finalizacao", "label": "Finalizacao",  "color": "purple"}
      ]
    }'::jsonb),
    (v_prop_ato_id, v_pipeline_id, 'Ato', 'select', 1, '{
      "options": [
        {"id": "ato1", "label": "Ato 01", "color": "green"},
        {"id": "ato2", "label": "Ato 02", "color": "blue"},
        {"id": "ato3", "label": "Ato 03", "color": "purple"},
        {"id": "ato4", "label": "Ato 04", "color": "orange"}
      ]
    }'::jsonb),
    (v_prop_resp_id, v_pipeline_id, 'Responsavel', 'select', 2, '{
      "options": [
        {"id": "rodrigo",  "label": "Rodrigo",   "color": "blue"},
        {"id": "felipe",   "label": "Felipe",    "color": "purple"},
        {"id": "beleite",  "label": "Be Leite",  "color": "yellow"},
        {"id": "adefinir", "label": "A definir", "color": "gray"}
      ]
    }'::jsonb),
    (v_prop_data_id, v_pipeline_id, 'Data de Entrega', 'date', 3, '{}'::jsonb),
    (v_prop_desc_id, v_pipeline_id, 'Descricao da Cena', 'text', 4, '{}'::jsonb);

  -- =========================================================
  -- 7. Inserir as 39 cenas com valores de propriedade
  -- =========================================================
  FOR i IN 1 .. array_length(v_scenes, 1) LOOP
    v_scene_id := gen_random_uuid();
    v_position := v_position + 1024;

    -- Mapeia status
    CASE v_scenes[i][4]
      WHEN 'Styleframes' THEN val_status := 'styleframes';
      WHEN 'Backlog'     THEN val_status := 'backlog';
      WHEN 'Animacao'    THEN val_status := 'animacao';
      ELSE                    val_status := 'backlog';
    END CASE;

    -- Mapeia ato
    CASE v_scenes[i][1]
      WHEN 'Ato 01' THEN val_ato := 'ato1';
      WHEN 'Ato 02' THEN val_ato := 'ato2';
      WHEN 'Ato 03' THEN val_ato := 'ato3';
      WHEN 'Ato 04' THEN val_ato := 'ato4';
      ELSE               val_ato := 'ato1';
    END CASE;

    -- Mapeia responsavel
    CASE v_scenes[i][2]
      WHEN 'Rodrigo'    THEN val_resp := 'rodrigo';
      WHEN 'Felipe'     THEN val_resp := 'felipe';
      WHEN 'Be Leite'   THEN val_resp := 'beleite';
      ELSE                   val_resp := 'adefinir';
    END CASE;

    -- Cria a cena
    INSERT INTO public.pages (id, title, parent_id, page_type, position, content, is_archived)
    VALUES (v_scene_id, v_scenes[i][3], v_pipeline_id, 'database_item', v_position, '', false);

    -- Insere valores das propriedades
    INSERT INTO public.property_values (page_id, property_id, value) VALUES
      (v_scene_id, v_prop_status_id, jsonb_build_object('selected', val_status)),
      (v_scene_id, v_prop_ato_id,    jsonb_build_object('selected', val_ato)),
      (v_scene_id, v_prop_resp_id,   jsonb_build_object('selected', val_resp)),
      (v_scene_id, v_prop_data_id,   jsonb_build_object('date', v_scenes[i][5])),
      (v_scene_id, v_prop_desc_id,   jsonb_build_object('text', v_scenes[i][6]));

  END LOOP;

  RAISE NOTICE 'Projeto criado com sucesso! ID: %', v_project_id;
  RAISE NOTICE 'Pipeline ID: %', v_pipeline_id;
  RAISE NOTICE 'Felipe  ID: %', v_uid_felipe;
  RAISE NOTICE 'Be Leite ID: %', v_uid_beleite;
  RAISE NOTICE 'Rodrigo  ID: %', v_uid_rodrigo;

END $$;
