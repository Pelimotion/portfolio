import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, Settings2, GripVertical, Check, Palette, ChevronDown } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { COLOR_MAP } from '../../core/colors';

// ============================================
// PROPERTY MANAGER MODAL — Customizing Database
// ============================================

export function PropertyManagerModal({ databaseId, properties, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [editingProps, setEditingProps] = useState(properties || []);
  const [selectedPropId, setSelectedPropId] = useState(null);

  // Sync only when modal opens (not on every parent re-render while editing)
  useEffect(() => {
    if (open) setEditingProps(properties || []);
  }, [open]);

  const selectedProp = (editingProps || []).find(p => p.id === selectedPropId);

  const handleAddProperty = async () => {
    try {
      const newProp = await propertyService.create({
        databaseId,
        name: 'Nova Propriedade',
        propertyType: 'text',
        config: {}
      });
      setEditingProps(prev => [...(prev || []), newProp]);
      setSelectedPropId(newProp.id);
    } catch (e) { console.error(e); }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Excluir esta propriedade removerá todos os dados salvos nela. Deseja continuar?')) return;
    try {
      await propertyService.destroy(id);
      setEditingProps(prev => (prev || []).filter(p => p.id !== id));
      if (selectedPropId === id) setSelectedPropId(null);
    } catch (e) { console.error(e); }
  };

  const handleUpdateProp = async (id, updates) => {
    try {
      const updated = await propertyService.update(id, updates);
      setEditingProps(prev => (prev || []).map(p => p.id === id ? updated : p));
    } catch (e) { console.error(e); }
  };

  const handleAddOption = (propId) => {
    const prop = (editingProps || []).find(p => p.id === propId);
    if (!prop) return;
    const options = prop.config?.options || [];
    const newId = `opt_${Date.now()}`;
    const newOptions = [...options, { id: newId, label: 'Nova Opção', color: 'gray' }];
    handleUpdateProp(propId, { config: { ...prop.config, options: newOptions } });
  };

  const handleUpdateOption = (propId, optId, updates) => {
    const prop = (editingProps || []).find(p => p.id === propId);
    if (!prop) return;
    const options = prop.config?.options || [];
    const newOptions = options.map(o => o.id === optId ? { ...o, ...updates } : o);
    handleUpdateProp(propId, { config: { ...prop.config, options: newOptions } });
  };

  const handleDeleteOption = (propId, optId) => {
    const prop = (editingProps || []).find(p => p.id === propId);
    if (!prop) return;
    const options = prop.config?.options || [];
    const newOptions = options.filter(o => o.id !== optId);
    handleUpdateProp(propId, { config: { ...prop.config, options: newOptions } });
  };

  const handleMoveOption = (propId, optId, direction) => {
    const prop = (editingProps || []).find(p => p.id === propId);
    if (!prop) return;
    const options = [...(prop.config?.options || [])];
    const idx = options.findIndex(o => o.id === optId);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= options.length) return;
    
    [options[idx], options[newIdx]] = [options[newIdx], options[idx]];
    handleUpdateProp(propId, { config: { ...prop.config, options: options } });
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) onUpdate();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors">
          <Settings2 className="w-3.5 h-3.5" />
          Propriedades
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in-0" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl z-[101] overflow-hidden flex h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-200"
          aria-describedby="prop-manager-description"
        >
          <Dialog.Title className="sr-only">Propriedades do Database</Dialog.Title>
          <Dialog.Description id="prop-manager-description" className="sr-only">
            Gerencie as propriedades e campos deste banco de dados.
          </Dialog.Description>
          
          {/* Sidebar: Prop List */}
          <div className="w-64 border-r border-border bg-secondary/10 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Propriedades</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Configurações do Database
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(editingProps || []).map(prop => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedPropId(prop.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs group transition-colors ${
                    selectedPropId === prop.id 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <GripVertical className="w-3 h-3 opacity-30" />
                  <span className="flex-1 text-left truncate">{prop.name}</span>
                  <span className="text-[9px] opacity-60 bg-secondary px-1 py-0.5 rounded uppercase">{prop.property_type}</span>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <button 
                onClick={handleAddProperty}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Adicionar Propriedade
              </button>
            </div>
          </div>

          {/* Main: Prop Editor */}
          <div className="flex-1 flex flex-col bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedProp ? (
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-foreground">Editar: {selectedProp.name}</h4>
                    <span className="px-2 py-0.5 bg-secondary rounded text-[10px] uppercase font-bold text-muted-foreground">{selectedProp.property_type}</span>
                  </div>
                ) : (
                  <h4 className="text-sm font-semibold text-muted-foreground">Selecione uma propriedade</h4>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedProp && (
                  <button 
                    onClick={() => handleDeleteProperty(selectedProp.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir Propriedade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <Dialog.Close asChild>
                  <button className="p-1.5 hover:bg-secondary rounded-full text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
                </Dialog.Close>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedProp ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Nome</label>
                      <input 
                        type="text" 
                        value={selectedProp.name}
                        onChange={(e) => handleUpdateProp(selectedProp.id, { name: e.target.value })}
                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tipo</label>
                      <select 
                        value={selectedProp.property_type}
                        onChange={(e) => handleUpdateProp(selectedProp.id, { property_type: e.target.value })}
                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="select">Seleção Única</option>
                        <option value="status">Status</option>
                        <option value="people">Responsável</option>
                        <option value="date">Data</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="url">Link</option>
                      </select>
                    </div>
                  </div>

                  {(selectedProp.property_type === 'select' || selectedProp.property_type === 'status') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Opções (Labels & Cores)</label>
                        <button 
                          onClick={() => handleAddOption(selectedProp.id)}
                          className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors font-bold uppercase tracking-wider"
                        >
                          <Plus className="w-3 h-3" /> Adicionar Opção
                        </button>
                      </div>

                      <div className="space-y-2">
                        {selectedProp.config?.options?.map((opt, idx, arr) => (
                          <div key={opt.id} className="flex items-center gap-2 group p-2 rounded-xl border border-transparent hover:border-border hover:bg-secondary/10 transition-all">
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleMoveOption(selectedProp.id, opt.id, -1)} disabled={idx === 0} className="p-0.5 hover:bg-secondary rounded disabled:opacity-20"><ChevronDown className="w-3 h-3 rotate-180" /></button>
                              <button onClick={() => handleMoveOption(selectedProp.id, opt.id, 1)} disabled={idx === arr.length - 1} className="p-0.5 hover:bg-secondary rounded disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                            </div>
                            
                            <div className={`w-3.5 h-3.5 rounded-sm shrink-0 ${COLOR_MAP[opt.color]?.dot || 'bg-gray-500'}`} />
                            
                            <input 
                              type="text" 
                              value={opt.label}
                              onChange={(e) => handleUpdateOption(selectedProp.id, opt.id, { label: e.target.value })}
                              className="flex-1 bg-transparent border-none py-1 text-sm focus:ring-0 outline-none transition-colors font-medium"
                            />
                            
                            {selectedProp.property_type === 'status' && (
                              <div className="flex items-center gap-1">
                                <input 
                                  type="date"
                                  value={opt.startDate || ''}
                                  onChange={(e) => handleUpdateOption(selectedProp.id, opt.id, { startDate: e.target.value })}
                                  className="w-[110px] bg-secondary/30 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-muted-foreground"
                                  title="Data de Início"
                                />
                                <span className="text-muted-foreground/40 text-xs">-</span>
                                <input 
                                  type="date"
                                  value={opt.deadline || ''}
                                  onChange={(e) => handleUpdateOption(selectedProp.id, opt.id, { deadline: e.target.value })}
                                  className="w-[110px] bg-secondary/30 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-muted-foreground"
                                  title="Data de Entrega"
                                />
                              </div>
                            )}
                            
                            {/* Color Selector */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mx-2">
                              {Object.keys(COLOR_MAP).map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleUpdateOption(selectedProp.id, opt.id, { color })}
                                  className={`w-3 h-3 rounded-sm transition-transform hover:scale-150 ${COLOR_MAP[color].dot} ${opt.color === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                                />
                              ))}
                            </div>

                            <button 
                              onClick={() => handleDeleteOption(selectedProp.id, opt.id)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProp.property_type === 'people' && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
                      <Palette className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Sincronização Automática</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Esta propriedade utiliza a lista de membros sincronizada com o Supabase Auth. Todos os usuários com acesso ao sistema aparecerão como opções de atribuição.</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <Settings2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Gerenciador de Dados</h3>
                  <p className="text-sm max-w-[280px]">Selecione ou crie uma propriedade para configurar como os dados deste projeto são organizados.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-secondary/10 border-t border-border flex justify-end">
               <Dialog.Close asChild>
                 <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
                   Salvar Alterações
                 </button>
               </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
