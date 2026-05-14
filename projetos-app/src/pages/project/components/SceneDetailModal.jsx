import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlignLeft, Clock, MoreHorizontal, Link, Wand2, MonitorPlay, Video, Music, CheckCircle2, AlertCircle, FileAudio, FileVideo, Tags, PlayCircle } from 'lucide-react';

export function SceneDetailModal({ scene, open, onOpenChange }) {
  if (!scene) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl h-[90vh] translate-x-[-50%] translate-y-[-50%] border border-border bg-card shadow-2xl sm:rounded-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col">
          
          {/* Topbar da Cena */}
          <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                SCN-{scene.id.substring(0,4)}
              </span>
              <div className="h-4 w-[1px] bg-border mx-1" />
              <span className="text-sm font-medium text-muted-foreground">Projeto Raiz</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><Link className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-secondary rounded-md transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <Dialog.Close asChild>
                <button className="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Area (Left) */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-border custom-scrollbar space-y-8">
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30" contentEditable suppressContentEditableWarning>
                  {scene.title}
                </h1>
                
                {/* Pipeline Visual Bar */}
                <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pipeline Stage</span>
                    <span className="text-sm font-semibold flex items-center gap-1.5 text-blue-500">
                      <Wand2 className="w-4 h-4" />
                      {scene.micro_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">{scene.progress}% Completo</span>
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden border border-border/50">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${scene.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiptap / Rich Text Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground mb-2">
                  <AlignLeft className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">Direção & Script</h3>
                </div>
                <div className="text-muted-foreground text-sm leading-relaxed p-4 bg-secondary/10 rounded-lg border border-transparent hover:border-border/50 transition-colors cursor-text min-h-[100px]">
                  Descreva a ação da cena, movimentos de câmera e intenção...
                </div>
              </div>

              {/* Generative AI Parameters */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  <h3 className="font-semibold text-sm">Generative AI Setup</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Positive Prompt</label>
                    <textarea className="w-full text-sm bg-secondary/30 border border-border rounded-md p-2 min-h-[80px]" placeholder="cinematic lighting, ultra detailed, 8k..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Negative Prompt</label>
                    <textarea className="w-full text-sm bg-secondary/30 border border-border rounded-md p-2 min-h-[80px]" placeholder="blurry, low quality, deformed..." />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Model</label>
                    <input className="w-full text-sm bg-secondary/30 border border-border rounded-md px-2 py-1" defaultValue="Midjourney v6" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Seed</label>
                    <input className="w-full text-sm bg-secondary/30 border border-border rounded-md px-2 py-1 font-mono text-xs" placeholder="Random" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                    <input className="w-full text-sm bg-secondary/30 border border-border rounded-md px-2 py-1 font-mono text-xs" defaultValue="16:9" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">LoRA / Style</label>
                    <input className="w-full text-sm bg-secondary/30 border border-border rounded-md px-2 py-1" placeholder="Product_Hero_V2" />
                  </div>
                </div>
              </div>

              {/* Assets Gallery */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">Assets & Previews</h3>
                  </div>
                  <button className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded transition-colors border border-border/50">
                    + Upload
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-video bg-secondary rounded-lg border border-border/50 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <Video className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Add Render</span>
                  </div>
                  <div className="aspect-video bg-secondary rounded-lg border border-border/50 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <Music className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Add Audio</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Metadata (Right) */}
            <div className="w-80 bg-sidebar/30 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Properties</h3>
                
                {/* Status Macro */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Macro Status</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20">
                    <PlayCircle className="w-3 h-3" />
                    <span className="capitalize">{scene.macro_status}</span>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Priority</span>
                  <span className={`text-xs font-medium ${scene.priority === 'High' ? 'text-orange-500' : 'text-muted-foreground'}`}>
                    {scene.priority}
                  </span>
                </div>

                {/* Complexity */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Complexity</span>
                  <span className="text-xs font-medium text-foreground bg-secondary px-2 py-0.5 rounded">
                    {scene.complexity}
                  </span>
                </div>

                {/* Owner */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Assignee</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                    <span className="text-xs text-foreground">{scene.assignee}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Deadline</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Set Date
                  </span>
                </div>
              </div>

              {/* Blockers */}
              <div className="space-y-3 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground">Blockers & Risks</h3>
                {scene.blockers ? (
                  <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md border border-destructive/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{scene.blockers}</span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic px-1">Nenhum bloqueio ativo.</div>
                )}
              </div>

              {/* Tags / Organization */}
              <div className="space-y-3 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Tags className="w-4 h-4 text-muted-foreground" /> Organization
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-bold bg-secondary text-muted-foreground px-2 py-1 rounded-sm border border-border/50">EXTERIOR</span>
                  <span className="text-[10px] uppercase font-bold bg-secondary text-muted-foreground px-2 py-1 rounded-sm border border-border/50">DAY</span>
                  <button className="text-[10px] uppercase font-bold bg-transparent text-muted-foreground px-2 py-1 rounded-sm border border-dashed border-border/80 hover:bg-secondary transition-colors">+ TAG</button>
                </div>
              </div>

            </div>
          </div>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
