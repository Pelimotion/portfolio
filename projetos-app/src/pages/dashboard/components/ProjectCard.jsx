import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Folder } from 'lucide-react';

export function ProjectCard({ project }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card border border-border rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-muted-foreground/50 transition-colors"
    >
      <h4 className="font-semibold text-card-foreground text-sm mb-1">{project.title}</h4>
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {project.description}
        </p>
      )}
      
      {project.drive_folder_url && (
        <div className="flex items-center gap-1.5 mt-2">
          <Folder className="w-3.5 h-3.5 text-blue-500" />
          <a 
            href={project.drive_folder_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking link
          >
            Google Drive
          </a>
        </div>
      )}
    </div>
  );
}
