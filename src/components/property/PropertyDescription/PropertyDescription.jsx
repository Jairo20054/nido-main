import React, { useState } from 'react';
import './PropertyDescription.css';

const PropertyDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return null;
  }

  const paragraphs = description.split('\\n').filter(p => p.trim());
  const shouldTruncate = paragraphs.length > 3;
  const displayParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, 3);

  return (
    <div className="property-description">
      <h2>Descripción</h2>
      <div className="description-content">
        {displayParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="description-toggle"
            type="button"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Mostrar menos' : 'Mostrar más'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyDescription;
