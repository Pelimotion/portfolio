import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ProjectCard } from './ProjectCard';

export function Column({ column, projects }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div className="flex flex-col bg-card/50 border border-border rounded-xl w-80 shrink-0 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {column.title}
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {projects.length}
        </span>
      </div>

      <div 
        ref={setNodeRef}
        className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
      >
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
