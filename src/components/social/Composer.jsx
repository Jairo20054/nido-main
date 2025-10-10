import React, { useState, useRef, useCallback } from 'react';
import { X, Image, MapPin, DollarSign, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import './Composer.css';

const Composer = ({ onPublish, onClose, initialMedia = null, inline = false }) => {
  const [selectedFiles, setSelectedFiles] = useState(initialMedia ? [initialMedia] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((files) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setCurrentIndex(selectedFiles.length);
    }
  }, [selectedFiles.length]);

  // Drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Remover archivo
  const removeFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Navegación entre archivos
  const navigateMedia = useCallback((direction) => {
    if (direction === 'next') {
      setCurrentIndex(prev => (prev + 1) % selectedFiles.length);
    } else {
      setCurrentIndex(prev => (prev - 1 + selectedFiles.length) % selectedFiles.length);
    }
  }, [selectedFiles.length]);

  // Publicar
  const handlePublish = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsPublishing(true);
    try {
      const postData = {
        media: selectedFiles,
        caption,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        location,
        price: price ? parseFloat(price) : null,
        timestamp: new Date().toISOString()
      };

      await onPublish(postData);

      // Reset form
      setSelectedFiles([]);
      setCurrentIndex(0);
      setCaption('');
      setHashtags('');
      setLocation('');
      setPrice('');
      onClose();
    } catch (error) {
      console.error('Error al publicar:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [selectedFiles, caption, hashtags, location, price, onPublish, onClose]);

  // Auto-resize textarea
  const handleCaptionChange = useCallback((e) => {
    setCaption(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, []);

  const currentFile = selectedFiles[currentIndex];
  const isImage = currentFile?.type.startsWith('image/');
  const isVideo = currentFile?.type.startsWith('video/');

  // Inline mode
  if (inline) {
    return (
      <div className="composer-inline">
        <div className="composer-inline-content">
          <img
            src="/api/placeholder/40/40"
            alt="Avatar"
            className="composer-avatar"
          />
          <input
            type="text"
            placeholder="¿Qué estás pensando...? ¿Buscas vivienda?"
            className="composer-input"
            onFocus={() => {
              // Open modal mode
              if (onClose) onClose(); // Close any existing modal
              // Trigger modal opening - this would need to be handled by parent
            }}
            readOnly
          />
        </div>
        <div className="composer-actions">
          <button className="composer-action-btn photo-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </button>
          <button className="composer-action-btn feeling-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          <button className="composer-action-btn checkin-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Modal mode
  return (
    <div className="composer-overlay" onClick={onClose}>
      <motion.div
        className="composer-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="composer-header">
          <h2>Crear publicación</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="composer-content">
          {/* Área de media */}
          <div
            className={`media-area ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFiles.length === 0 ? (
              <div className="media-upload-zone">
                <div className="upload-content">
                  <Image size={48} />
                  <p>Arrastra imágenes o videos aquí</p>
                  <button
                    className="select-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar archivos
                  </button>
                </div>
              </div>
            ) : (
              <div className="media-preview">
                <div className="preview-container">
                  {isImage && (
                    <img
                      src={URL.createObjectURL(currentFile)}
                      alt="Preview"
                      className="preview-media"
                    />
                  )}
                  {isVideo && (
                    <video
                      src={URL.createObjectURL(currentFile)}
                      className="preview-media"
                      controls
                    />
                  )}
                </div>

                {selectedFiles.length > 1 && (
                  <>
                    <button
                      className="nav-btn prev"
                      onClick={() => navigateMedia('prev')}
                    >
                      ‹
                    </button>
                    <button
                      className="nav-btn next"
                      onClick={() => navigateMedia('next')}
                    >
                      ›
                    </button>
                    <div className="media-indicators">
                      {selectedFiles.map((_, index) => (
                        <span
                          key={index}
                          className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <button
                  className="remove-media-btn"
                  onClick={() => removeFile(currentIndex)}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="composer-form">
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Escribe una descripción..."
                maxLength={2200}
                rows={3}
              />
              <span className="char-count">{caption.length}/2200</span>
            </div>

            <div className="form-group">
              <label>Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#propiedad #bogota #arrendamiento"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ubicación</label>
                <div className="location-input">
                  <MapPin size={16} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bogotá, Colombia"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Precio (opcional)</label>
                <div className="price-input">
                  <DollarSign size={16} />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="100000"
                    min="0"
                    step="1000"
                  />
                  <span>/noche</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="composer-footer">
          <button
            className="publish-btn"
            onClick={handlePublish}
            disabled={selectedFiles.length === 0 || isPublishing}
          >
            {isPublishing ? (
              <div className="publishing-spinner" />
            ) : (
              <>
                <Send size={16} />
                Publicar
              </>
            )}
          </button>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Composer;
