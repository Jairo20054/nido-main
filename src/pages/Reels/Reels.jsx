import React, { useState, useEffect } from 'react';
import ReelsViewer from '../../components/social/ReelsViewer';
import './Reels.css';

// Datos mock para reels
const generateMockReels = (count = 10) => Array.from({ length: count }, (_, i) => ({
  id: i + 1,
  videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_${i + 1}mb.mp4`,
  poster: `https://picsum.photos/400/700?random=${i}`,
  description: `¡Increíble propiedad en Bogotá! 🏠✨ #propiedad #bogota #arrendamiento ${i + 1}`,
  hashtags: ['propiedad', 'bogota', 'arrendamiento', 'casa', 'apartamento'],
  likes: 100 + (i * 15),
  comments: 10 + i,
  shares: 5 + (i % 3),
  user: {
    name: `Usuario ${i + 1}`,
    avatar: `https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i + 30}.jpg`,
    verified: i % 3 === 0
  },
  timestamp: `${i + 1} horas ago`,
  location: ["Zona Rosa", "Chapinero", "Usaquén", "Teusaquillo"][i % 4] + ", Bogotá",
  price: 80000 + (i * 10000)
}));

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});

  useEffect(() => {
    // Simular carga de datos
    const loadReels = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockReels = generateMockReels(8);
        setReels(mockReels);
      } catch (error) {
        console.error('Error al cargar reels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReels();
  }, []);

  const handleLike = (reelId) => {
    setLikedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleComment = (reelId) => {
    // Aquí iría la lógica para abrir modal de comentarios
    console.log('Abrir comentarios para reel:', reelId);
  };

  const handleShare = (reelId) => {
    // Aquí iría la lógica para compartir
    console.log('Compartir reel:', reelId);
  };

  const handleSave = (reelId) => {
    setSavedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  if (loading) {
    return (
      <div className="reels-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Cargando reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reels-page">
      <ReelsViewer
        reels={reels}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onSave={handleSave}
      />

      {/* Header overlay para mobile */}
      <div className="reels-header">
        <h1>Reels</h1>
        <div className="header-actions">
          <button className="search-btn" aria-label="Buscar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="camera-btn" aria-label="Cámara">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2C16.4183 2 20 5.58172 20 10C20 14.4183 16.4183 18 12 18C7.58172 18 4 14.4183 4 10C4 5.58172 7.58172 4 12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reels;
