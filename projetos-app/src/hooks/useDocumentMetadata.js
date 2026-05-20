import { useEffect } from 'react';
import { generativeService } from '../lib/generative/generativeService';

/**
 * Hook para gerenciar o título da página e o favicon dinâmico (generativo).
 */
export function useDocumentMetadata(title, slug, type = 'project') {
  useEffect(() => {
    // 1. Atualizar Título do Navegador (Padrão Notion)
    if (title) {
      document.title = `${title} | TOCA HUB`;
    } else {
      document.title = 'TOCA HUB Dashboard';
    }

    // 2. Atualizar Favicon Dinâmico
    if (slug) {
      generativeService.getProjectIdentity(slug, type).then(meta => {
        if (meta?.icon) {
          updateFavicon(meta.icon);
        }
      }).catch(err => {
        console.warn('Erro ao atualizar favicon generativo:', err);
      });
    }

    // Cleanup: Reset title if needed (optional)
  }, [title, slug, type]);
}

function updateFavicon(svgString) {
  try {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    // Usar encodeURIComponent para segurança e suporte a caracteres especiais
    // SVG data URI direto é mais eficiente que Base64 para favicons simples
    link.href = "data:image/svg+xml," + encodeURIComponent(svgString);
  } catch (e) {
    console.error('Falha ao injetar favicon:', e);
  }
}
