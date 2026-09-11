import React from 'react';
import { StratumInfo } from '../../types/art';
import { CurrentDrift } from './CurrentDrift';

interface StratumSectionProps {
  stratum: StratumInfo;
}

export const StratumSection: React.FC<StratumSectionProps> = ({ stratum }) => {
  return (
    <section
      id={`stratum-${stratum.id}`}
      className="stratum-block"
      data-stratum={stratum.id}
      aria-labelledby={`title-${stratum.id}`}
    >
      <header className="stratum-header">
        <span className="stratum-depth-label">{stratum.depthRange}</span>
        <h2 id={`title-${stratum.id}`} className="stratum-title">
          {stratum.title}
        </h2>
        <p className="stratum-description">{stratum.description}</p>
      </header>

      <CurrentDrift artworks={stratum.artworks} stratumId={stratum.id} />
    </section>
  );
};
