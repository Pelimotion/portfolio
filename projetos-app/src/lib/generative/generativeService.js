import { supabase as db } from '../supabase';
import { generateIcon } from './icon-generator';
import { generatePattern, PATTERN_VERSION } from './pattern-generator';

/**
 * GENERATIVE SERVICE
 * Cache e persistência para ícones e padrões.
 */
export const generativeService = {
  async getProjectIdentity(slug, type = 'project') {
    try {
      const { data: project } = await db
        .from('projects_identity')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (project && project.metadata?.patternVersion === PATTERN_VERSION) {
        return project.metadata;
      }

      return this.regenerateIdentity(slug, type);
    } catch (e) {
      console.error('Generative service error:', e);
      return this.generateLocal(slug, type);
    }
  },

  async regenerateIdentity(slug, type = 'project', salt = '') {
    const icon = await generateIcon(slug, type, salt);
    const pattern = await generatePattern(slug, salt);

    const metadata = {
      icon: icon.svgString,
      pattern: pattern.svgString,
      layers: pattern.layers_json,
      type,
      salt,
      patternVersion: PATTERN_VERSION,
      generated_at: new Date().toISOString()
    };

    await db.from('projects_identity').upsert({
      slug,
      metadata
    }, { onConflict: 'slug' }).then(({ error }) => {
      if (error) console.warn('projects_identity upsert skipped:', error.message);
    });

    return metadata;
  },

  async randomize(slug, type = 'project') {
    const newSalt = Math.random().toString(36).substring(7);
    return this.regenerateIdentity(slug, type, newSalt);
  },

  async generateLocal(slug, type, salt = '') {
    const icon = await generateIcon(slug, type, salt);
    const pattern = await generatePattern(slug, salt);
    return {
      icon: icon.svgString,
      pattern: pattern.svgString,
      layers: pattern.layers_json
    };
  }
};
