import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { AlignLeft, LayoutTemplate, Clock, Share, MoreHorizontal, Settings2, Filter, ArrowLeft } from 'lucide-react';
import { ScenesPipeline } from '../dashboard/components/ScenesPipeline'; // Reutilizaremos ou moveremos depois

export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  
  const project = projects.find(p => p.id === projectId);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">Carregando workspace...</div>;
  }

  if (!project) {
    return <div className="flex-1 flex items-center justify-center text-destructive">Projeto não encontrado ou você não tem acesso.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Topbar da Página */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border shrink-0 bg-card/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors mr-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
            {project.id.split('-')[0].toUpperCase()}
          </span>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {project.title}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground">
          <button className="flex items-center gap-2 text-sm hover:text-foreground px-2 py-1.5 rounded transition-colors">
            <Share className="w-4 h-4" /> Share
          </button>
          <button className="p-1.5 hover:bg-secondary hover:text-foreground rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Conteúdo Estilo Notion */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Capa do Projeto (Opcional) */}
        <div className="h-32 bg-gradient-to-r from-blue-900/20 to-purple-900/20 w-full border-b border-border/50"></div>
        
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
          
          {/* Header do Documento */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30" contentEditable suppressContentEditableWarning>
              {project.title}
            </h1>
            
            {/* Metadados Estilo Linear/Notion Properties */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-20">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${project.status === 'entregue' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'entregue' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <span className="capitalize">{project.status.replace('_', ' ')}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-20">Owner</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                  <span className="text-foreground">Felipe Conceição</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-20">Created</span>
                <span className="text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Briefing / Rich Text */}
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm leading-relaxed p-4 hover:bg-secondary/20 rounded-lg transition-colors cursor-text min-h-[100px] border border-transparent hover:border-border/50">
              {project.description || "Adicione o briefing criativo da produção aqui. Pressione '/' para comandos..."}
            </div>
          </div>

          {/* Table Database (Cenas) */}
          <div className="space-y-4 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Cenas & Assets (Production Pipeline)</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 bg-secondary/50 rounded transition-colors border border-border/50">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 bg-secondary/50 rounded transition-colors border border-border/50">
                  <Settings2 className="w-3.5 h-3.5" /> View
                </button>
              </div>
            </div>
            
            <ScenesPipeline projectId={project.id} />
          </div>

        </div>
      </main>
    </div>
  );
}
