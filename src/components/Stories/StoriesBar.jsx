import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStories } from '../../utils/socialMocks';
import './StoriesBar.css';

const StoriesBar = ({ onStoryClick, onCreateStory }) => {
  const [stories] = useState(mockStories);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreationSidebar, setShowCreationSidebar] = useState(false);
  const fileInputRef = useRef(null);

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    onStoryClick?.(story);
  };

  const handleCreateClick = () => {
    setShowCreationSidebar(true);
  };

  const handleCreationOption = (type) => {
    setShowCreationSidebar(false);
    setIsCreating(true);
    if (type === 'photo' || type === 'file') {
      fileInputRef.current?.click();
    }
    // Handle text creation differently
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onCreateStory?.(file);
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  return (
    <>
      {/* Creation Sidebar */}
      {showCreationSidebar && (
        <div className="stories-creation-sidebar">
          <div className="creation-sidebar-header">
            <h3>Historias</h3>
            <button
              className="creation-sidebar-close"
              onClick={() => setShowCreationSidebar(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="creation-sidebar-content">
            <div className="user-story-item">
              <img src="/api/placeholder/56/56" alt="Tu avatar" className="user-story-avatar" />
              <span>Tu historia</span>
              <button className="user-story-more">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>

            <div className="creation-options">
              <button
                className="creation-option photo-option"
                onClick={() => handleCreationOption('photo')}
              >
                <div className="option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
                <span>Crear con foto</span>
              </button>

              <button
                className="creation-option text-option"
                onClick={() => handleCreationOption('text')}
              >
                <div className="option-icon text-icon">Aa</div>
                <span>Crear con texto</span>
              </button>

              <button
                className="creation-option file-option"
                onClick={() => handleCreationOption('file')}
              >
                <div className="option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <span>Archivo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="stories-bar">
        <div className="stories-container">
          {/* Botón crear story */}
          <motion.div
            className={`story-item create-story ${isCreating ? 'creating' : ''}`}
            onClick={handleCreateClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="story-avatar">
              <Plus size={20} />
            </div>
            <span className="story-label">Tu historia</span>
          </motion.div>

          {/* Stories existentes */}
          {stories.map((story) => (
            <motion.div
              key={story.id}
              className={`story-item ${story.isViewed ? 'viewed' : 'unviewed'}`}
              onClick={() => handleStoryClick(story)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="story-avatar">
                <img
                  src={story.user.avatar}
                  alt={story.user.name}
                  loading="lazy"
                />
                {!story.isViewed && <div className="story-ring" />}
              </div>
              <span className="story-label">{story.user.name.split(' ')[0]}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de story */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="story-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="story-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="story-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>

              <div className="story-header">
                <img
                  src={selectedStory.user.avatar}
                  alt={selectedStory.user.name}
                  className="story-user-avatar"
                />
                <span className="story-username">{selectedStory.user.name}</span>
                <span className="story-time">
                  {Math.floor((Date.now() - selectedStory.timestamp) / 3600000)}h
                </span>
              </div>

              <div className="story-media">
                {selectedStory.media.map((item, index) => (
                  <div key={index} className="story-media-item">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={`Story ${index + 1}`}
                        className="story-image"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="story-video"
                        autoPlay
                        muted
                        playsInline
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="story-actions">
                <input
                  type="text"
                  placeholder="Responder a la historia..."
                  className="story-reply-input"
                />
                <button className="story-like-btn">❤️</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default StoriesBar;
