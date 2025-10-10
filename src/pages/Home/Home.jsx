// src/pages/Home/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../../components/PostCard/PostCard';
import StoriesBar from '../../components/Stories/StoriesBar';
import ReelsViewer from '../../components/social/ReelsViewer';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import SidebarRight from '../../components/SidebarRight/SidebarRight';
import Composer from '../../components/social/Composer';
import { mockPosts, mockStories, mockReels } from '../../utils/socialMocks';
import styles from './Home.module.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  // Load initial posts
  useEffect(() => {
    setPosts(mockPosts.slice(0, 10));
    setPage(1);
  }, []);

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
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
      )
    );
  };

  const handleSave = (postId) => {
    setSavedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
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
    <>
      <div className={styles.homeGrid}>
        {/* Left Sidebar */}
        <aside className={styles.leftSidebar}>
          <LeftSidebar />
        </aside>

        {/* Main Feed */}
        <main className={styles.mainFeed}>
          {/* Stories */}
          <StoriesBar
            stories={mockStories}
            onStoryClick={(story) => console.log('View story:', story)}
            onCreateStory={(file) => console.log('Create story with:', file)}
          />

          {/* Feed */}
          <div className={styles.feedContainer}>
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    property={post}
                    currentImageIndex={currentImageIndices[post.id] || 0}
                    onImageChange={handleImageChange}
                    onLike={handleLike}
                    onSave={handleSave}
                    onFollow={handleFollow}
                    isLiked={likedPosts[post.id]}
                    isSaved={savedPosts[post.id]}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Reels Section */}
            <section className={styles.reelsSection}>
              <h3 className={styles.sectionTitle}>Reels</h3>
              <ReelsViewer reels={mockReels} horizontal={true} />
            </section>

            {isLoading && <div className={styles.loading}>Cargando...</div>}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={styles.rightSidebar}>
          <SidebarRight />
        </aside>
      </div>

      {/* Composer */}
      <AnimatePresence>
        {isComposerOpen && (
          <Composer onClose={closeComposer} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;