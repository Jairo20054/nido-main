import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PropertySection from './PropertySection';
import { safeText } from './propertyDisplayUtils';

export default function PropertyDescription({ property }) {
  const [expanded, setExpanded] = useState(false);
  const description = safeText(property.description, property.summary || '');
  const canExpand = description.length > 260;

  return (
    <PropertySection title="Descripcion" className="nido-description-section">
      {description ? (
        <>
          <div className={`nido-description ${expanded ? 'nido-description--expanded' : ''}`}>
            <p>{description}</p>
            {!expanded && canExpand ? <span className="nido-description__fade" aria-hidden="true" /> : null}
          </div>
          {canExpand ? (
            <button type="button" className="nido-text-button" onClick={() => setExpanded((current) => !current)}>
              {expanded ? 'Ver menos' : 'Ver descripcion completa'}
              <ChevronDown size={15} className={expanded ? 'nido-text-button__icon--up' : ''} />
            </button>
          ) : null}
        </>
      ) : (
        <p className="nido-detail-empty">Esta propiedad aun no tiene descripcion completa.</p>
      )}
    </PropertySection>
  );
}
