import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCardEnhanced from '../../components/PostCard/PostCardEnhanced';
import StoriesBar from '../../components/Stories/StoriesBar';
import ReelsViewer from '../../components/social/ReelsViewer';
import BottomNav from '../../components/social/BottomNav';
import Composer from '../../components/social/Composer';
import { mockPosts, mockStories, mockReels } from '../../utils/socialMocks';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load initial posts
  useEffect(() => {
    setPosts(mockPosts.slice(0, 10));
    setPage(1);
  }, []);

  // Infinite scroll handler
  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const newPosts = mockPosts.slice(0, nextPage * 10);

      if (newPosts.length >= mockPosts.length) {
        setHasMore(false);
      }

      setPosts(newPosts);
      setPage(nextPage);
      setIsLoading(false);
    }, 1000);
  }, [page, isLoading, hasMore]);

  const handleImageChange = (postId, direction) => {
    setCurrentImageIndices((prev) => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find((p) => p.id === postId);
      if (!post) return prev;
      const imagesCount = post.images.length;
      let newIndex = currentIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % imagesCount;
      } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
      }
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
      )
    );
  };

  const handleSave = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  const handleFollow = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isFollowing: !post.isFollowing } : post
      )
    );
  };

  const openComposer = () => {
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
  };

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stories Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <StoriesBar stories={mockStories} />
      </motion.div>

      {/* Feed Section */}
      <main className="feed-container">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <PostCardEnhanced
                property={post}
                currentImageIndex={currentImageIndices[post.id] || 0}
                onImageChange={handleImageChange}
                onLike={handleLike}
                onSave={handleSave}
                onFollow={handleFollow}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando más publicaciones...</p>
          </motion.div>
        )}

        {/* End of feed message */}
        {!hasMore && posts.length > 0 && (
          <motion.div
            className="end-feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>¡Has visto todas las publicaciones! 🎉</p>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        className="fab-button"
        onClick={openComposer}
        aria-label="Crear nueva publicación"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </motion.button>

      {/* Composer Modal */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Composer onClose={closeComposer} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default Home;
