import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { usePageStore } from '../../stores/usePageStore';
import { useProjects } from '../../hooks/useProjects';
import { Settings2, Filter, Plus, LayoutDashboard, Table, GripVertical, MoreHorizontal } from 'lucide-react';
import { CreateProjectModal } from './components/CreateProjectModal';

// ============================================
// DASHBOARD — Projects Hub
// Funciona com o banco antigo (projects) por enquanto
// e migrará para pages assim que o SQL rodar
// ============================================

// Colunas default (compatibilidade com tabela `projects`)
const DEFAULT_COLUMNS = [
  { id: 'briefing', label: 'Briefing', color: 'blue' },
  { id: 'producao', label: 'Produção', color: 'yellow' },
  { id: 'revisao', label: 'Revisão', color: 'purple' },
  { id: 'entregue', label: 'Entregue', color: 'green' },
];

export default function Dashboard() {
  const { projects, loading, updateProjectStatus } = useProjects();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const columns = useMemo(() => {
    return DEFAULT_COLUMNS.map((col) => ({
      ...col,
      items: projects.filter((p) => p.status === col.id),
    }));
  }, [projects]);

  const handleDragStart = (event) => {
    const project = projects.find((p) => p.id === event.active.id);
    if (project) setActiveProject(project);
  };

  const handleDragEnd = (event) => {
    setActiveProject(null);
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id;
    const overId = over.id;
    const overProject = projects.find((p) => p.id === overId);
    const newStatus = overProject ? overProject.status : overId;
    const isValidStatus = DEFAULT_COLUMNS.some((c) => c.id === newStatus);
    const current = projects.find((p) => p.id === projectId);

    if (current && isValidStatus && current.status !== newStatus) {
      updateProjectStatus(projectId, newStatus);
    }
  };

  const colorMap = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    gray: 'bg-secondary',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">Projects Hub</h1>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500/50" />
            {projects.length} projetos
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-secondary/50 rounded-md p-0.5 border border-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-background shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-background shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table
            </button>
          </div>

          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium transition-colors ml-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Projeto
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground animate-pulse">Carregando projetos...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="flex h-full gap-5 overflow-x-auto pb-4 items-start">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {columns.map((col) => (
                <KanbanColumn key={col.id} column={col} colorMap={colorMap} navigate={navigate} />
              ))}
              <DragOverlay>
                {activeProject && <ProjectCard project={activeProject} />}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <ProjectsTable projects={projects} navigate={navigate} />
        )}
      </main>

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

// ---- KANBAN COLUMN ----
function KanbanColumn({ column, colorMap, navigate }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="w-72 shrink-0 flex flex-col">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${colorMap[column.color]}`} />
        <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {column.label}
        </span>
        <span className="text-xs text-muted-foreground bg-secondary px-1.5 rounded-full ml-1">
          {column.items.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[100px]">
        <SortableContext items={column.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {column.items.map((project) => (
            <SortableProjectCard key={project.id} project={project} onClick={() => navigate(`/page/${project.id}`)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ---- SORTABLE PROJECT CARD ----
function SortableProjectCard({ project, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
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
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 shadow-sm cursor-pointer hover:border-muted-foreground/50 transition-colors group"
    >
      <h4 className="font-medium text-sm text-card-foreground mb-1 truncate">{project.title}</h4>
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
      )}
      {project.drive_folder_url && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-blue-500">📁 Drive</span>
        </div>
      )}
    </div>
  );
}

// ---- DRAG OVERLAY CARD ----
function ProjectCard({ project }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
      <h4 className="font-medium text-sm text-card-foreground">{project.title}</h4>
    </div>
  );
}

// ---- TABLE VIEW ----
function ProjectsTable({ projects, navigate }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 p-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-card">
        <div>Title</div>
        <div>Status</div>
        <div>Drive</div>
        <div>Created</div>
        <div className="w-8" />
      </div>
      <div className="divide-y divide-border/50">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/page/${project.id}`)}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 p-3 items-center hover:bg-secondary/20 transition-colors cursor-pointer group"
          >
            <div className="font-medium text-sm text-foreground truncate">{project.title}</div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500 capitalize">
                {project.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {project.drive_folder_url ? '📁 Linked' : '—'}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(project.created_at).toLocaleDateString()}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 hover:bg-secondary rounded text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
