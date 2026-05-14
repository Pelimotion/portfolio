import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Clock, Share, MoreHorizontal, ArrowLeft, Star } from 'lucide-react';

// ============================================
// PAGE RENDERER — Compatível com banco legado
// Tenta buscar da tabela `pages` primeiro,
// se não existir, fallback para `projects`
// ============================================

export function PageRenderer({ pageId }) {
  const [page, setPage] = useState(null);
  const [source, setSource] = useState(null); // 'pages' | 'projects'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Tentar tabela nova primeiro
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('id', pageId)
          .single();

        if (pageData && !pageError) {
          setPage(pageData);
          setSource('pages');
          setLoading(false);
          return;
        }
      } catch (e) {
        // Tabela 'pages' pode não existir ainda
      }

      try {
        // Fallback para tabela legada
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', pageId)
          .single();

        if (projectData && !projectError) {
          // Normalizar para formato de página
          setPage({
            id: projectData.id,
            title: projectData.title,
            content: projectData.description || '',
            icon: null,
            cover: null,
            page_type: 'database_item',
            created_at: projectData.created_at,
            assigned_to: null,
            // Campos extras do projeto
            _status: projectData.status,
            _drive_folder_url: projectData.drive_folder_url,
          });
          setSource('projects');
        }
      } catch (e) {
        console.error('Failed to load page:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pageId]);

  const handleTitleChange = useCallback(
    async (e) => {
      const newTitle = e.target.innerText.trim();
      if (!newTitle || newTitle === page?.title) return;

      setPage((prev) => ({ ...prev, title: newTitle }));

      const table = source === 'pages' ? 'pages' : 'projects';
      await supabase.from(table).update({ title: newTitle }).eq('id', pageId);
    },
    [pageId, page, source]
  );

  const handleContentChange = useCallback(
    async (html) => {
      setPage((prev) => ({ ...prev, content: html }));

      const table = source === 'pages' ? 'pages' : 'projects';
      const field = source === 'pages' ? 'content' : 'description';
      await supabase.from(table).update({ [field]: html }).eq('id', pageId);
    },
    [pageId, source]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Página não encontrada</p>
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground underline">
          Voltar ao Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Topbar */}
      <header className="h-12 flex items-center justify-between px-6 border-b border-border shrink-0 bg-card/50">
        <div className="flex items-center gap-3 text-sm overflow-hidden">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {page.id.substring(0, 6).toUpperCase()}
          </span>
          <span className="truncate text-muted-foreground">{page.title}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><Star className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><Share className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-900/20 to-purple-900/20 w-full border-b border-border/50 hover:from-blue-900/30 hover:to-purple-900/30 transition-colors cursor-pointer group relative">
          <span className="absolute bottom-3 right-4 text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to add cover
          </span>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
          {/* Icon + Title */}
          <div className="space-y-2">
            {page.icon && (
              <span className="text-5xl select-none cursor-pointer hover:opacity-80 transition-opacity">
                {page.icon}
              </span>
            )}
            <h1
              className="text-4xl font-bold text-foreground focus:outline-none empty:before:content-['Untitled'] empty:before:text-muted-foreground/30"
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleChange}
            >
              {page.title}
            </h1>
          </div>

          {/* Properties (Legacy mode) */}
          {source === 'projects' && (
            <div className="space-y-2 border-b border-border/50 pb-6">
              <div className="flex items-center gap-4 py-1 px-2 -mx-2 hover:bg-secondary/20 rounded transition-colors">
                <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-500 capitalize">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {page._status?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 py-1 px-2 -mx-2 hover:bg-secondary/20 rounded transition-colors">
                <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">Owner</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                  <span className="text-sm">Felipe Conceição</span>
                </div>
              </div>
              <div className="flex items-center gap-4 py-1 px-2 -mx-2 hover:bg-secondary/20 rounded transition-colors">
                <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">Created</span>
                <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(page.created_at).toLocaleDateString()}
                </span>
              </div>
              {page._drive_folder_url && (
                <div className="flex items-center gap-4 py-1 px-2 -mx-2 hover:bg-secondary/20 rounded transition-colors">
                  <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">Drive</span>
                  <a href={page._drive_folder_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate">
                    {page._drive_folder_url}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Content (RichText) */}
          <div className="max-w-[850px]">
            <RichTextEditor
              content={page.content || ''}
              onChange={handleContentChange}
              placeholder="Adicione conteúdo, briefing, notas... Pressione '/' para comandos"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
