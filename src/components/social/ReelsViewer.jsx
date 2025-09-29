import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReelsViewer.css';

const ReelsViewer = ({ reels = [], onLike, onComment, onShare, onSave, horizontal = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});
  const [muted, setMuted] = useState(true);
  const [isDoubleTapping, setIsDoubleTapping] = useState(false);
  const videoRefs = useRef({});
  const containerRef = useRef(null);
  const lastTapRef = useRef(0);
  const playingVideosRef = useRef(new Set());
  const playTimeoutsRef = useRef({});

  // Auto-play cuando el reel está visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const videoId = video.dataset.reelId;

          if (entry.isIntersecting) {
            // Throttle play calls to prevent rapid toggling
            if (playTimeoutsRef.current[videoId]) {
              clearTimeout(playTimeoutsRef.current[videoId]);
            }

            playTimeoutsRef.current[videoId] = setTimeout(async () => {
              try {
                if (!playingVideosRef.current.has(videoId) && video.readyState >= 2) {
                  await video.play();
                  playingVideosRef.current.add(videoId);
                }
              } catch (error) {
                console.warn('Video play interrupted or failed:', error);
              }
            }, 100);
          } else {
            // Clear any pending play timeout
            if (playTimeoutsRef.current[videoId]) {
              clearTimeout(playTimeoutsRef.current[videoId]);
              delete playTimeoutsRef.current[videoId];
            }

            try {
              video.pause();
              playingVideosRef.current.delete(videoId);
            } catch (error) {
              console.warn('Video pause failed:', error);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
      // Clear all timeouts on cleanup
      Object.values(playTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
      playTimeoutsRef.current = {};
    };
  }, [currentIndex]);

  // Manejar scroll vertical u horizontal
  const handleScroll = useCallback((e) => {
    if (horizontal) {
      const { scrollLeft, clientWidth } = e.target;
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
        setCurrentIndex(newIndex);
      }
    } else {
      const { scrollTop, clientHeight } = e.target;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
        setCurrentIndex(newIndex);
      }
    }
  }, [currentIndex, reels.length, horizontal]);

  // Definir handleLike antes de usarlo en handleDoubleTap
  const handleLike = useCallback((reelId) => {
    setLikedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
    onLike?.(reelId);
  }, [onLike]);

  // Doble tap para like
  const handleDoubleTap = useCallback((reelId) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike(reelId);
      setIsDoubleTapping(true);
      setTimeout(() => setIsDoubleTapping(false), 1000);
    }
    lastTapRef.current = now;
  }, [handleLike]);

  const handleSave = useCallback((reelId) => {
    setSavedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
    onSave?.(reelId);
  }, [onSave]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = !muted;
      }
    });
  }, [muted]);

  if (!reels.length) {
    return (
      <div className="reels-viewer-empty">
        <p>No hay reels disponibles</p>
      </div>
    );
  }

  return (
    <div className="reels-viewer" ref={containerRef} onScroll={handleScroll}>
      <AnimatePresence mode="popLayout">
        {reels.map((reel, index) => (
          <motion.article
            key={reel.id}
            className={`post-card ${index === currentIndex ? 'active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onDoubleClick={() => handleDoubleTap(reel.id)}
            role="article"
            aria-labelledby={`reel-${reel.id}-title`}
          >
            <div className="post-image">
              <video
                ref={(el) => (videoRefs.current[reel.id] = el)}
                src={reel.videoUrl}
                poster={reel.poster}
                muted={muted}
                loop
                playsInline
                className="reel-video"
                data-reel-id={reel.id}
                onLoadedData={async (e) => {
                  if (index === currentIndex) {
                    try {
                      if (!playingVideosRef.current.has(reel.id) && e.target.readyState >= 2) {
                        await e.target.play();
                        playingVideosRef.current.add(reel.id);
                      }
                    } catch (error) {
                      console.warn('Video play failed on load:', error);
                    }
                  }
                }}
                onError={(e) => {
                  console.warn('Video failed to load:', reel.videoUrl, e);
                }}
              />
            </div>

            {/* Overlay con información */}
            <div className="post-header">
              <div className="user-info">
                <img src={reel.user.avatar} alt={reel.user.name} className="user-avatar" />
                <div className="user-details">
                  <button className="username" aria-label={`Perfil de ${reel.user.name}`}>
                    {reel.user.name}
                  </button>
                  {reel.user.verified && <span className="verified-badge">✓</span>}
                </div>
              </div>
            </div>

            <div className="post-caption">
              <p className="caption">{reel.description}</p>
              {reel.hashtags && (
                <div className="hashtags">
                  {reel.hashtags.map((tag, i) => (
                    <span key={i} className="hashtag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="post-actions">
              <div className="action-buttons">
                <button
                  className={`action-button ${likedReels[reel.id] ? 'liked' : ''}`}
                  onClick={() => handleLike(reel.id)}
                  aria-label={likedReels[reel.id] ? 'Quitar me gusta' : 'Me gusta'}
                >
                  <Heart size={24} fill={likedReels[reel.id] ? '#ff3b72' : 'none'} />
                  <span>{reel.likes + (likedReels[reel.id] ? 1 : 0)}</span>
                </button>

                <button className="action-button" onClick={() => onComment?.(reel.id)} aria-label="Comentar">
                  <MessageCircle size={24} />
                  <span>{reel.comments}</span>
                </button>

                <button className="action-button" onClick={() => onShare?.(reel.id)} aria-label="Compartir">
                  <Share size={24} />
                </button>

                <button
                  className={`save-button ${savedReels[reel.id] ? 'saved' : ''}`}
                  onClick={() => handleSave(reel.id)}
                  aria-label={savedReels[reel.id] ? 'Quitar de guardados' : 'Guardar'}
                >
                  <Bookmark size={24} fill={savedReels[reel.id] ? '#ff3b72' : 'none'} />
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
            <button className="mute-button" onClick={toggleMute} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
              {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReelsViewer;
