import React from 'react';
import { useParams } from 'react-router-dom';
import { PageRenderer } from '../../components/page/PageRenderer';

// ============================================
// PAGE VIEW — Rota /page/:pageId
// Renderiza qualquer página do sistema
// ============================================

export default function PageView() {
  const { pageId } = useParams();
  return <PageRenderer pageId={pageId} />;
}
