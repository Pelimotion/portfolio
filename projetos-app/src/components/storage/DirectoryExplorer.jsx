import { 
  Folder, ChevronRight, ChevronDown, Check, Loader2,
  FileText, File, Image as ImageIcon, Video, Music
} from 'lucide-react';

const getFileIcon = (mimeType) => {
  if (!mimeType || mimeType === 'application/vnd.google-apps.folder') return Folder;
  if (mimeType.includes('image/')) return ImageIcon;
  if (mimeType.includes('video/')) return Video;
  if (mimeType.includes('audio/')) return Music;
  if (mimeType.includes('application/pdf')) return FileText;
  return File;
};

/**
 * DIRECTORY EXPLORER
 * Renderiza uma árvore de diretórios para seleção de pastas
 */
export function DirectoryExplorer({ 
  folders = [], 
  onSelect, 
  selectedId, 
  loading = false,
  emptyMessage = "Nenhuma pasta encontrada."
}) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Organiza folders em estrutura de árvore
  const buildTree = (list) => {
    const map = {};
    const roots = [];
    
    list.forEach(f => {
      map[f.id] = { ...f, children: [] };
    });

    list.forEach(f => {
      if (f.parentId && map[f.parentId]) {
        map[f.parentId].children.push(map[f.id]);
      } else {
        roots.push(map[f.id]);
      }
    });

    return roots;
  };

  const tree = buildTree(folders);

  const renderNode = (node, depth = 0) => {
    const isExpanded = expanded[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;
    const Icon = getFileIcon(node.mimeType);

    return (
      <div key={node.id} className="select-none">
        <div 
          onClick={() => onSelect(node)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <div 
            onClick={(e) => hasChildren && toggleExpand(node.id, e)}
            className={`p-0.5 rounded hover:bg-secondary transition-transform ${!hasChildren ? 'opacity-0' : ''}`}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </div>
          
          <div className="w-4 h-4 shrink-0 flex items-center justify-center relative">
            {node.thumbnail ? (
              <img src={node.thumbnail} alt="" className="w-full h-full object-cover rounded-[2px]" />
            ) : (
              <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground/60'}`} />
            )}
          </div>
          
          <span className="text-xs font-medium truncate flex-1">{node.name}</span>
          
          {isSelected && <Check className="w-3 h-3 shrink-0" />}
        </div>

        {isExpanded && hasChildren && (
          <div className="animate-in slide-in-from-top-1 duration-200">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-xs font-medium">Lendo diretórios do Google Drive...</p>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs text-muted-foreground italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {tree.map(root => renderNode(root))}
    </div>
  );
}
