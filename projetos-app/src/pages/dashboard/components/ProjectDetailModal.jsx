import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSearchParams } from 'react-router-dom';
import { X, AlignLeft, LayoutTemplate, Clock, MoreHorizontal, Maximize2, Share } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';

export function ProjectDetailModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { projects } = useProjects();
  
  const project = projects.find(p => p.id === projectId);
  
  const handleClose = () => {
    setSearchParams(params => {
      params.delete('projectId');
      return params;
    });
  };

  if (!projectId) return null;

  return (
    <Dialog.Root open={!!projectId} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl h-[85vh] translate-x-[-50%] translate-y-[-50%] border border-border bg-card shadow-2xl sm:rounded-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col">
          
          {/* Topbar do Modal (Ações) */}
          <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                {project?.id?.split('-')[0].toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><Share className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><Maximize2 className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <Dialog.Close asChild>
                <button className="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Área Principal (2 Colunas: Conteúdo e Propriedades) */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Esquerda: Conteúdo Rico */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-border custom-scrollbar">
              {project ? (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Título Grande */}
                  <h1 className="text-3xl font-bold text-foreground focus:outline-none" contentEditable suppressContentEditableWarning>
                    {project.title}
                  </h1>

                  {/* Placeholder Tiptap */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <AlignLeft className="w-4 h-4" />
                      <h3 className="font-semibold text-sm">Briefing & Notas</h3>
                    </div>
                    
                    <div className="min-h-[200px] text-muted-foreground text-sm leading-relaxed p-4 bg-secondary/30 rounded-lg border border-dashed border-border/50 hover:bg-secondary/50 transition-colors cursor-text">
                      {project.description || "Clique aqui para adicionar detalhes usando o editor avançado (Em breve)..."}
                    </div>
                  </div>

                  {/* Tabs: Scenes, Assets, Comments */}
                  <div className="pt-8 border-t border-border mt-8">
                    <div className="flex items-center gap-4 border-b border-border pb-px">
                      <button className="px-1 pb-2 border-b-2 border-primary text-sm font-medium text-foreground">Scenes Pipeline</button>
                      <button className="px-1 pb-2 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Assets</button>
                      <button className="px-1 pb-2 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Approvals</button>
                    </div>
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      <LayoutTemplate className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      A arquitetura de Cenas será injetada aqui (Fase 5)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Carregando...</div>
              )}
            </div>

            {/* Direita: Propriedades Metadados */}
            <div className="w-80 bg-sidebar/30 overflow-y-auto p-6 space-y-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Properties</h3>
              
              <div className="space-y-4">
                {/* Propriedade: Status */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border border-border text-sm">
                    <span className={`w-2 h-2 rounded-full ${project?.status === 'entregue' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                    <span className="capitalize">{project?.status?.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Propriedade: Assinalado */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Assignee</span>
                  <div className="flex items-center gap-2 px-1 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                    <span>Felipe Conceição</span>
                  </div>
                </div>

                {/* Propriedade: Data */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Created</span>
                  <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Propriedade: Link Drive */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Root Drive</span>
                  {project?.drive_folder_url ? (
                    <a href={project.drive_folder_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline px-1 truncate">
                      {project.drive_folder_url}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground italic px-1">Empty</span>
                  )}
                </div>
              </div>

            </div>
          </div>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
