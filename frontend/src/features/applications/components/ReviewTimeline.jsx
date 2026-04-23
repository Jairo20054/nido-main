import React from 'react';

export function ReviewTimeline({ items }) {
  return (
    <div className="review-timeline">
      {items.map((item) => (
        <div
          key={item.id}
          className={`review-timeline__item review-timeline__item--${item.status}`}
        >
          <div className="review-timeline__dot" />
          <div className="review-timeline__content">
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            {item.meta ? <small>{item.meta}</small> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
