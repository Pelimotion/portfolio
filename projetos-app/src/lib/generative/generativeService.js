import { db } from '../supabase';
import { generateIcon } from './icon-generator';
import { generatePattern } from './pattern-generator';

/**
 * GENERATIVE SERVICE
 * Cache e persistência para ícones e padrões.
 */
export const generativeService = {
  async getProjectIdentity(slug) {
    try {
      // 1. Tentar buscar no Supabase
      const { data: project, error } = await db
        .from('projects_identity')
        .select('*')
        .eq('slug', slug)
        .single();

      if (project) {
        return project.metadata;
      }

      // 2. Se não existir, gerar e salvar
      const icon = await generateIcon(slug);
      const pattern = await generatePattern(slug);
      
      const metadata = {
        icon: icon.svgString,
        pattern: pattern.svgString,
        layers: pattern.layers_json,
        generated_at: new Date().toISOString()
      };

      await db.from('projects_identity').upsert({
        slug,
        metadata
      });

      return metadata;
    } catch (e) {
      console.error('Generative service error:', e);
      // Fallback para geração local sem cache se o banco falhar
      const icon = await generateIcon(slug);
      const pattern = await generatePattern(slug);
      return {
        icon: icon.svgString,
        pattern: pattern.svgString,
        layers: pattern.layers_json
      };
    }
  }
};
