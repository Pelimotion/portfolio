import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  CircleDashed, 
  AlertCircle, 
  Clock, 
  User, 
  Flame, 
  MoreHorizontal,
  Wand2,
  Video,
  Music,
  MonitorPlay
} from 'lucide-react';
import { SceneDetailModal } from '../../project/components/SceneDetailModal';

// Constantes do Pipeline
const MACRO_STATUS = {
  backlog: { label: 'Backlog', color: 'text-muted-foreground', bg: 'bg-secondary' },
  active: { label: 'Active', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  review: { label: 'Review', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  approved: { label: 'Approved', color: 'text-green-500', bg: 'bg-green-500/10' },
  delivered: { label: 'Delivered', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  archived: { label: 'Archived', color: 'text-muted-foreground', bg: 'bg-secondary/50' }
};

const MICRO_PIPELINE = [
  'Briefing', 'References', 'IA Generation', 'Selects', 
  'Upscale', 'Cleanup', 'Motion', 'Compositing', 
  'FX', 'Sound', 'Export', 'Feedback', 'Corrections'
];

// Mock inicial para desenhar a UI antes do banco estar pronto
const MOCK_SCENES = [
  {
    id: '1',
    title: 'Cena 01 - Hero Shot Produto',
    macro_status: 'active',
    micro_status: 'Motion',
    progress: 45,
    assignee: 'Felipe',
    priority: 'High',
    complexity: 'Hard',
    blockers: null
  },
  {
    id: '2',
    title: 'Cena 02 - Detalhe Textura',
    macro_status: 'review',
    micro_status: 'Feedback',
    progress: 80,
    assignee: 'Felipe',
    priority: 'Medium',
    complexity: 'Medium',
    blockers: 'Aguardando logo vetorizado'
  },
  {
    id: '3',
    title: 'Cena 03 - Packshot Final',
    macro_status: 'backlog',
    micro_status: 'Briefing',
    progress: 0,
    assignee: 'Unassigned',
    priority: 'Low',
    complexity: 'Easy',
    blockers: null
  }
];

export function ScenesPipeline({ projectId }) {
  const [scenes, setScenes] = useState(MOCK_SCENES);
  const [activeScene, setActiveScene] = useState(null);

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-primary" />
          Pipeline de Cenas
        </h3>
        <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 text-sm font-medium rounded-md transition-colors">
          + Adicionar Cena
        </button>
      </div>

      {/* Tabela / Lista Rica */}
      <div className="border border-border rounded-xl overflow-hidden bg-card/50">
        <div className="grid grid-cols-[2fr_1.5fr_2fr_1fr_1fr_auto] gap-4 p-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-card">
          <div>Cena / Shot</div>
          <div>Macro Status</div>
          <div>Pipeline Stage</div>
          <div>Assignee</div>
          <div>Priority</div>
          <div className="w-8"></div>
        </div>

        <div className="divide-y divide-border/50">
          {scenes.map(scene => (
            <div 
              key={scene.id} 
              onClick={() => setActiveScene(scene)}
              className="grid grid-cols-[2fr_1.5fr_2fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-secondary/20 transition-colors group cursor-pointer"
            >
              
              {/* Título e Blocker */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-medium text-sm text-foreground truncate">{scene.title}</span>
                {scene.blockers && (
                  <span className="flex items-center gap-1 text-[10px] text-destructive truncate">
                    <AlertCircle className="w-3 h-3" />
                    Blocker: {scene.blockers}
                  </span>
                )}
              </div>

              {/* Macro Status */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${MACRO_STATUS[scene.macro_status].bg} ${MACRO_STATUS[scene.macro_status].color}`}>
                  {scene.macro_status === 'active' ? <PlayCircle className="w-3.5 h-3.5" /> : 
                   scene.macro_status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                   <CircleDashed className="w-3.5 h-3.5" />}
                  {MACRO_STATUS[scene.macro_status].label}
                </span>
              </div>

              {/* Pipeline Stage (Micro Status) com ProgressBar sutil */}
              <div className="flex flex-col gap-1.5 pr-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    {scene.micro_status}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 font-mono">{scene.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${scene.progress}%` }}
                  />
                </div>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground truncate">{scene.assignee}</span>
              </div>

              {/* Priority */}
              <div>
                <span className={`flex items-center gap-1 text-xs ${scene.priority === 'High' ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                  {scene.priority === 'High' && <Flame className="w-3 h-3" />}
                  {scene.priority}
                </span>
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      <SceneDetailModal 
        scene={activeScene} 
        open={!!activeScene} 
        onOpenChange={(open) => !open && setActiveScene(null)} 
      />
    </div>
  );
}
