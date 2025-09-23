import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReelsViewer.css';

const ReelsViewer = ({ reels = [], onLike, onComment, onShare, onSave }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});
  const [muted, setMuted] = useState(true);
  const [isDoubleTapping, setIsDoubleTapping] = useState(false);
  const videoRefs = useRef({});
  const containerRef = useRef(null);
  const lastTapRef = useRef(0);

  // Auto-play cuando el reel está visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [currentIndex]);

  // Manejar scroll vertical
  const handleScroll = useCallback((e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    const newIndex = Math.round(scrollTop / clientHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, reels.length]);

  // Doble tap para like
  const handleDoubleTap = useCallback((reelId) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike(reelId);
      setIsDoubleTapping(true);
      setTimeout(() => setIsDoubleTapping(false), 1000);
    }
    lastTapRef.current = now;
  }, []);

  const handleLike = useCallback((reelId) => {
    setLikedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
    onLike?.(reelId);
  }, [onLike]);

  const handleSave = useCallback((reelId) => {
    setSavedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
    onSave?.(reelId);
  }, [onSave]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = !muted;
    });
  }, [muted]);

  const currentReel = reels[currentIndex];

  if (!reels.length) {
    return (
      <div className="reels-viewer-empty">
        <p>No hay reels disponibles</p>
      </div>
    );
  }

  return (
    <div className="reels-viewer" ref={containerRef} onScroll={handleScroll}>
      <AnimatePresence mode="wait">
        {reels.map((reel, index) => (
          <motion.div
            key={reel.id}
            className={`reel-item ${index === currentIndex ? 'active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onDoubleClick={() => handleDoubleTap(reel.id)}
          >
            <video
              ref={(el) => (videoRefs.current[reel.id] = el)}
              src={reel.videoUrl}
              poster={reel.poster}
              muted={muted}
              loop
              playsInline
              className="reel-video"
              onLoadedData={(e) => {
                if (index === currentIndex) {
                  e.target.play();
                }
              }}
            />

            {/* Overlay con información */}
            <div className="reel-overlay">
              <div className="reel-header">
                <div className="user-info">
                  <img src={reel.user.avatar} alt={reel.user.name} className="user-avatar" />
                  <span className="username">{reel.user.name}</span>
                  {reel.user.verified && <span className="verified-badge">✓</span>}
                </div>
              </div>

              <div className="reel-content">
                <p className="reel-description">{reel.description}</p>
                {reel.hashtags && (
                  <div className="hashtags">
                    {reel.hashtags.map((tag, i) => (
                      <span key={i} className="hashtag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="reel-actions">
                <button
                  className={`action-btn ${likedReels[reel.id] ? 'liked' : ''}`}
                  onClick={() => handleLike(reel.id)}
                >
                  <Heart size={28} fill={likedReels[reel.id] ? '#ff3b72' : 'none'} />
                  <span>{reel.likes + (likedReels[reel.id] ? 1 : 0)}</span>
                </button>

                <button className="action-btn" onClick={() => onComment?.(reel.id)}>
                  <MessageCircle size={28} />
                  <span>{reel.comments}</span>
                </button>

                <button className="action-btn" onClick={() => onShare?.(reel.id)}>
                  <Share size={28} />
                </button>

                <button
                  className={`action-btn ${savedReels[reel.id] ? 'saved' : ''}`}
                  onClick={() => handleSave(reel.id)}
                >
                  <Bookmark size={28} fill={savedReels[reel.id] ? '#ff3b72' : 'none'} />
                </button>
              </div>
            </div>

            {/* Animación de doble tap */}
            <AnimatePresence>
              {isDoubleTapping && index === currentIndex && (
                <motion.div
                  className="double-tap-animation"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart size={80} fill="#ff3b72" color="#ff3b72" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón de mute/unmute */}
            <button className="mute-button" onClick={toggleMute}>
              {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReelsViewer;
