// src/components/PropertyStories/PropertyStories.jsx
import React, { useState } from 'react';
import './PropertyStories.css';

const PropertyStories = () => {
  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const stories = [
    {
      id: 1,
      user: 'Carlos Méndez',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      image: 'https://apartamento-bogota-zona-rosa.bogota-hotels-co.net/data/Photos/OriginalPhoto/1820/182016/182016102.JPEG',
      title: 'Renovación completa'
    },
    {
      id: 2,
      user: 'María Rodríguez',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      image: 'https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg',
      title: 'Casa familiar'
    },
    {
      id: 3,
      user: 'Andrés López',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1',
      title: 'Vista panorámica'
    },
    {
      id: 4,
      user: 'Laura Sánchez',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      title: 'Apartamento premium'
    },
    {
      id: 5,
      user: 'Ana Gómez',
      avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      title: 'Apartamento moderno'
    },
    {
      id: 6,
      user: 'Luis Martínez',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      title: 'Loft céntrico'
    },
    {
      id: 7,
      user: 'Roberto Díaz',
      avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
      image: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      title: 'Casa campestre'
    }
  ];

  const openStory = (story) => {
    setActiveStory(story);
    setProgress(0);
    
    // Simular progreso de la historia
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          closeStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50);
  };

  const closeStory = () => {
    setActiveStory(null);
    setProgress(0);
  };

  return (
    <div className="property-stories">
      <div className="stories-container">
        {stories.map(story => (
          <div 
            key={story.id} 
            className="story-item"
            onClick={() => openStory(story)}
          >
            <div className="story-avatar">
              <img src={story.avatar} alt={story.user} />
            </div>
            <span className="story-username">{story.user}</span>
          </div>
        ))}
      </div>
      
      {activeStory && (
        <div className="story-modal" onClick={closeStory}>
          <div className="story-modal-content" onClick={e => e.stopPropagation()}>
            <div className="story-progress">
              <div 
                className="story-progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <button className="close-modal" onClick={closeStory}>×</button>
            
            <div className="story-image-container">
              <img src={activeStory.image} alt={activeStory.title} />
            </div>
            
            <div className="story-modal-info">
              <div className="user-info">
                <img src={activeStory.avatar} alt={activeStory.user} />
                <span>{activeStory.user}</span>
              </div>
              <p>{activeStory.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyStories;
