import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { ProjectCard } from './ProjectCard';
import { useProjects } from '../../../hooks/useProjects';

const COLUMNS = [
  { id: 'briefing', title: 'Briefing', color: 'bg-blue-500' },
  { id: 'producao', title: 'Produção', color: 'bg-yellow-500' },
  { id: 'revisao', title: 'Revisão', color: 'bg-purple-500' },
  { id: 'entregue', title: 'Entregue', color: 'bg-green-500' },
];

export function Board() {
  const { projects, loading, updateProjectStatus } = useProjects();
  const [activeProject, setActiveProject] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Ajuda a distinguir clique de arraste
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Carregando projetos...</p>
      </div>
    );
  }

  const handleDragStart = (event) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) setActiveProject(project);
  };

  const handleDragEnd = (event) => {
    setActiveProject(null);
    const { active, over } = event;

    if (!over) return;

    const projectId = active.id;
    const overId = over.id;

    // Se o elemento foi solto em cima de outro card
    const overProject = projects.find((p) => p.id === overId);
    let newStatus = overProject ? overProject.status : overId;

    // Garante que o newStatus é válido (está dentro das colunas permitidas)
    const isValidStatus = COLUMNS.some(c => c.id === newStatus);

    const activeProject = projects.find((p) => p.id === projectId);

    if (activeProject && isValidStatus && activeProject.status !== newStatus) {
      updateProjectStatus(projectId, newStatus);
    }
  };

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            projects={projects.filter((p) => p.status === column.id)}
          />
        ))}

        <DragOverlay>
          {activeProject ? <ProjectCard project={activeProject} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
