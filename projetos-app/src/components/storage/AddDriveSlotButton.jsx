import React, { useState } from 'react';
import { Plus, Folder, File as FileIcon } from 'lucide-react';

export function AddDriveSlotButton({ onAdd }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('folder');

  const handleSave = () => {
    if (name.trim()) {
      onAdd(name, type);
      setName('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="flex items-center justify-center gap-2 p-3 border border-dashed border-border text-muted-foreground/60 hover:text-foreground hover:border-border/80 rounded-lg cursor-pointer transition-all min-h-[60px]"
      >
        <Plus className="w-4 h-4" /> Adicionar pasta ou arquivo
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-secondary/20 border border-border rounded-lg min-h-[60px]">
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="flex-1 min-w-0 bg-background border border-border/50 rounded text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
        placeholder="Nome do slot..."
        autoFocus
      />
      
      <select 
        value={type} 
        onChange={(e) => setType(e.target.value)}
        className="bg-background border border-border/50 rounded text-xs px-2 py-1.5 focus:outline-none focus:border-primary/50 cursor-pointer"
      >
        <option value="folder">Pasta</option>
        <option value="file">Arquivo</option>
      </select>

      <button onClick={handleSave} className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded hover:bg-primary/90 transition-colors">
        Add
      </button>
      <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
        ✕
      </button>
    </div>
  );
}
