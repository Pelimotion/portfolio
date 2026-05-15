import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { seedDefaultDriveSlots } from '../core/databaseFactory';

export function useDriveSlots({ projectId, pageId, isScene = false }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    setLoading(true);
    
    let { data: slotsData } = await supabase
      .from('project_drive_slots')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');

    if (!slotsData) { setLoading(false); return; }

    // Auto-seed for legacy projects
    if (slotsData.length === 0) {
      await seedDefaultDriveSlots(projectId);
      const { data: newSlotsData } = await supabase
        .from('project_drive_slots')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order');
      
      if (!newSlotsData || newSlotsData.length === 0) {
        setLoading(false);
        return;
      }
      slotsData = newSlotsData;
    }

    const slotIds = slotsData.map(s => s.id);

    // 2. Busca os links desta página (projeto ou cena)
    const { data: pageLinks } = await supabase
      .from('drive_slot_links')
      .select('*')
      .in('slot_id', slotIds)
      .eq('page_id', pageId);

    // 3. Se for cena, busca também os links do projeto pai (herança)
    let projectLinks = [];
    if (isScene) {
      const { data: pl } = await supabase
        .from('drive_slot_links')
        .select('*')
        .in('slot_id', slotIds)
        .eq('page_id', projectId);
      projectLinks = pl ?? [];
    }

    // 4. Combina: slot + link próprio + link herdado
    const merged = slotsData.map(slot => ({
      ...slot,
      link: pageLinks?.find(l => l.slot_id === slot.id) ?? null,
      inherited_link: isScene
        ? (projectLinks.find(l => l.slot_id === slot.id) ?? null)
        : null,
    }));

    setSlots(merged);
    setLoading(false);
  };

  useEffect(() => { fetchSlots(); }, [projectId, pageId]);

  // ── MUTATIONS ──────────────────────────────────────────────────

  // Atualiza nome ou tipo de um slot (só funciona na view do projeto)
  async function updateSlot(slotId, updates) {
    await supabase
      .from('project_drive_slots')
      .update(updates)
      .eq('id', slotId);
    await fetchSlots();
  }

  // Adiciona novo slot ao projeto
  async function addSlot(displayName, slotType) {
    const maxOrder = slots.length > 0 ? Math.max(...slots.map(s => s.sort_order)) : -1;
    await supabase
      .from('project_drive_slots')
      .insert({
        project_id: projectId,
        slot_key: displayName.toLowerCase().replace(/\\s+/g, '_') + '_' + Date.now(),
        display_name: displayName,
        slot_type: slotType,
        sort_order: maxOrder + 1,
      });
    await fetchSlots();
  }

  // Remove um slot e todos os links associados (CASCADE cuida do banco)
  async function removeSlot(slotId) {
    await supabase
      .from('project_drive_slots')
      .delete()
      .eq('id', slotId);
    await fetchSlots();
  }

  // Salva ou atualiza o link de Drive para um slot nesta página
  async function upsertLink(slotId, linkData) {
    await supabase
      .from('drive_slot_links')
      .upsert({
        slot_id: slotId,
        page_id: pageId,
        ...linkData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slot_id,page_id' });
    await fetchSlots();
  }

  // Remove o link de uma cena para um slot (volta a mostrar o herdado do projeto)
  async function removeLink(slotId) {
    await supabase
      .from('drive_slot_links')
      .delete()
      .eq('slot_id', slotId)
      .eq('page_id', pageId);
    await fetchSlots();
  }

  return { slots, loading, updateSlot, addSlot, removeSlot, upsertLink, removeLink, refetch: fetchSlots };
}
