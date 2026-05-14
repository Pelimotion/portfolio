import { usePageStore } from '../stores/usePageStore';
import { propertyService } from '../services/propertyService';
import { bootstrapProjectPipeline } from '../core/databaseFactory';
import { ROOT_HUB_ID } from '../core/schemas';

export async function generateMockData() {
  try {
    const { createPage } = usePageStore.getState();

    console.log('Criando Projeto: ATO 1...');
    // 1. Criar o Projeto "ATO 1"
    const project = await createPage({
      title: 'ATO 1 - O TEMPO NOS TROUXE',
      parentId: ROOT_HUB_ID,
      pageType: 'database_item',
      icon: '🎬'
    });

    console.log('Criando Pipeline do Projeto...');
    // 2. Criar Database de Cenas (Pipeline)
    const pipelineDb = await bootstrapProjectPipeline(project.id);
    const properties = await propertyService.fetchByDatabase(pipelineDb.id);

    // Propriedades úteis
    const statusProp = properties.find(p => p.name === 'Status');
    const priorityProp = properties.find(p => p.name === 'Prioridade');
    const deadlineProp = properties.find(p => p.name === 'Deadline');

    const statusOptions = statusProp?.config?.options || [];
    const priorityOptions = priorityProp?.config?.options || [];

    // Datas base (Hoje, +/- dias)
    const today = new Date();

    console.log('Gerando 27 Cenas...');
    // 3. Gerar 27 cenas
    for (let i = 1; i <= 27; i++) {
      const sceneTitle = `CENA ${String(i).padStart(2, '0')}`;
      
      const scene = await createPage({
        title: sceneTitle,
        parentId: pipelineDb.id,
        pageType: 'database_item',
        icon: '🎞️',
        content: `<h2>Detalhes da Cena</h2><p>Briefing gerado automaticamente para a ${sceneTitle}.</p><ul><li>Revisar iluminação.</li><li>Ajustar motion.</li></ul>`
      });

      // Distribuir status aleatoriamente, pendendo para os primeiros
      const statusIdx = Math.floor(Math.random() * Math.min(statusOptions.length, 5));
      const priorityIdx = Math.floor(Math.random() * priorityOptions.length);
      
      // Data aleatória entre -5 e +15 dias a partir de hoje
      const daysOffset = Math.floor(Math.random() * 20) - 5;
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysOffset);

      // Salvar propriedades
      if (statusProp && statusOptions[statusIdx]) {
        await propertyService.upsertValue(scene.id, statusProp.id, { selected: statusOptions[statusIdx].id });
      }
      
      if (priorityProp && priorityOptions[priorityIdx]) {
        await propertyService.upsertValue(scene.id, priorityProp.id, { selected: priorityOptions[priorityIdx].id });
      }

      if (deadlineProp) {
        await propertyService.upsertValue(scene.id, deadlineProp.id, { date: targetDate.toISOString() });
      }
    }

    console.log('Mock gerado com sucesso!');
    alert('Mock de dados (ATO 1) gerado com sucesso! Atualize a página.');
  } catch (err) {
    console.error('Erro ao gerar mock:', err);
    alert('Erro ao gerar mock. Veja o console.');
  }
}
