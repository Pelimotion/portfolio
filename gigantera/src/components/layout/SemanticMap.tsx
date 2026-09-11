import React from 'react';
import { STRATA_CATALOG } from '../../data/artworks';

export const SemanticMap: React.FC = () => {
  return (
    <nav className="sr-only" aria-label="Mapa Estratigráfico Acessível para Teclado e Leitor de Tela">
      <ul>
        <li>
          <a href="#cymatic-stage">Ir para Navegação Cimática e Sintonia</a>
        </li>
        {STRATA_CATALOG.map((stratum) => (
          <li key={stratum.id}>
            <a href={`#stratum-${stratum.id}`}>
              Pular para {stratum.title} ({stratum.depthRange})
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
