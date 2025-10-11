// src/pages/Home.jsx - FB Light Mode Layout Completo
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PostCard from '../components/PostCard/PostCard';
import StoriesBar from '../components/Stories/StoriesBar';
import CreatePost from '../components/CreatePost/CreatePost';
import LeftSidebar from '../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../components/RightSidebar/RightSidebar';
import BottomNav from '../components/social/BottomNav';
import { mockPosts, mockStories } from '../../utils/socialMocks';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState(mockPosts.slice(0, 6));
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [inView, hasMore, isLoading, loadMorePosts]);

  const loadMorePosts = useCallback(async () => {
    setIsLoading(true);
    setTimeout(() => {
      const newPosts = mockPosts.slice(page * 6, (page + 1) * 6);
      if (newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 800); // Simula delay
  }, [page]);

  const handleImageChange = useCallback((postId, direction) => {
    setCurrentImageIndices(prev => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find(p => p.id === postId);
      if (!post) return prev;
      const imagesCount = post.images.length;
      let newIndex = currentIndex;
      if (direction === 'next') newIndex = (currentIndex + 1) % imagesCount;
      else if (direction === 'prev') newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
      else newIndex = direction; // For direct index
      return { ...prev, [postId]: newIndex };
    });
  }, [posts]);

  const handleLike = useCallback((postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  }, []);

  const handleSave = useCallback((postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isSaved: !post.isSaved } : post
    ));
  }, []);

  const handleFollow = useCallback((postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isFollowing: !post.isFollowing } : post
    ));
  }, []);

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className="left-sidebar-container">
        <LeftSidebar />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Stories */}
        <motion.section 
          className="stories-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StoriesBar stories={mockStories} />
        </motion.section>

        {/* Create Post Area */}
        <motion.section 
          className="create-post-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <CreatePost />
        </motion.section>

        {/* Feed */}
        <section className="feed-section" role="feed" aria-label="Feed de publicaciones">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                className="post-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <PostCard
                  property={post}
                  currentImageIndex={currentImageIndices[post.id] || 0}
                  onImageChange={handleImageChange}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={handleFollow}
                  isLiked={post.isLiked}
                  isSaved={post.isSaved}
                />
              </motion.article>
            ))}
          </AnimatePresence>

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="load-more-trigger" aria-live="polite">
            {isLoading && (
              <motion.div 
                className="loading-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="spinner" role="status" aria-label="Cargando">
                  <svg viewBox="0 0 24 24" className="spinner-icon">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="spinner-path" />
                  </svg>
                </div>
                <span>Cargando más publicaciones...</span>
              </motion.div>
            )}
          </div>
        </section>

        {/* End Message */}
        {!hasMore && posts.length > 0 && (
          <motion.div 
            className="end-feed-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            role="status"
            aria-label="No hay más publicaciones"
          >
            <p>No hay más publicaciones por ahora. ¡Vuelve pronto!</p>
          </motion.div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar-container">
        <RightSidebar />
      </aside>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default Home;