import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Folder, MoreHorizontal, Copy, Trash2, Archive, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ProjectArtPattern } from '../../../components/ui/ProjectArtPattern';

export function ProjectCard({ project }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: {
      type: 'Project',
      project,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleOpenDetail = () => {
    if (!isDragging) {
      navigate(`/project/${project.id}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleOpenDetail}
      className="relative group bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] transition-all duration-200 overflow-hidden"
    >
      {/* Background Art Pattern */}
      <ProjectArtPattern projectId={project.id} className="opacity-[0.12] group-hover:opacity-[0.20]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{project.title}</h4>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className="p-1.5 rounded-md hover:bg-[var(--surface-overlay)] text-muted-foreground opacity-0 group-hover:opacity-100 transition-all focus:outline-none"
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="z-50 min-w-[160px] bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-xl p-1 animate-in fade-in-0 zoom-in-95">
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-md cursor-pointer outline-none">
                  <Copy className="w-3.5 h-3.5" /> Duplicar
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-primary/10 rounded-md cursor-pointer outline-none">
                  <Archive className="w-3.5 h-3.5" /> Arquivar
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-[var(--border-subtle)] my-1" />
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer outline-none">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {project.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          {project.drive_folder_url ? (
            <div className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400/80">Drive Link</span>
            </div>
          ) : <div />}

          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--surface-2)] bg-muted flex items-center justify-center text-[8px] font-bold">
              FC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
