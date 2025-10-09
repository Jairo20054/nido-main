import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import './StoriesBar.css';

const StoriesBar = ({ onStoryClick, onCreateStory }) => {
  const { isAuthenticated } = useAuthContext();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch stories on component mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.stories.getStories();
        if (response.success) {
          // Transform data to match component expectations
          const transformedStories = response.data.map(story => ({
            id: story._id,
            user: story.userId, // Assuming userId is populated
            media: story.media,
            timestamp: new Date(story.createdAt).getTime(),
            isViewed: false // TODO: Implement viewed tracking
          }));
          setStories(transformedStories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        // Fallback to empty array
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    onStoryClick?.(story);
  };

  const handleCreateClick = () => {
    setUploadError(null);
    setIsCreating(true);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsCreating(true);
        setUploadError(null);
        const response = await api.stories.uploadStory(file);
        if (response.success) {
          // Add the new story to the list
          const newStory = {
            id: response.data._id,
            user: response.data.userId,
            media: response.data.media,
            timestamp: new Date(response.data.createdAt).getTime(),
            isViewed: false
          };
          setStories(prev => [newStory, ...prev]);
          onCreateStory?.(file);
        } else {
          setUploadError('Error al subir la historia');
        }
      } catch (error) {
        console.error('Error uploading story:', error);
        setUploadError('Error al subir la historia');
      } finally {
        setIsCreating(false);
        e.target.value = null; // Reset file input
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  return (
    <>
      <div className="stories-bar">
        <div className="stories-container">
          {/* Botón crear story */}
          {isAuthenticated && (
            <motion.div
              className={`story-item create-story ${isCreating ? 'creating' : ''}`}
              onClick={handleCreateClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              tabIndex={0}
              role="button"
              aria-label="Crear nueva historia"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCreateClick();
                }
              }}
            >
              <div className="story-avatar">
                <Plus size={20} />
              </div>
              <span className="story-label">Tu historia</span>
            </motion.div>
          )}

          {/* Stories existentes */}
          {loading ? (
            <div className="loading-text">Cargando historias...</div>
          ) : stories.length === 0 ? (
            <div className="no-stories-text">No hay historias disponibles</div>
          ) : (
            stories.map((story) => (
              <motion.div
                key={story.id}
                className={`story-item ${story.isViewed ? 'viewed' : 'unviewed'}`}
                onClick={() => handleStoryClick(story)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                tabIndex={0}
                role="button"
                aria-label={`Ver historia de ${story.user.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStoryClick(story);
                  }
                }}
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
            ))
          )}
        </div>
        {uploadError && <div className="upload-error">{uploadError}</div>}
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-modal-title"
          >
            <motion.div
              className="story-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="story-close"
                onClick={handleCloseModal}
                aria-label="Cerrar historia"
              >
                <X size={24} />
              </button>

              <div className="story-header" id="story-modal-title">
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
                  aria-label="Responder a la historia"
                />
                <button className="story-like-btn" aria-label="Me gusta">❤️</button>
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
