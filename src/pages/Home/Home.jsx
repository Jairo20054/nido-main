import React, { useState, useEffect } from 'react';
import PostCardEnhanced from '../../components/PostCard/PostCardEnhanced';
import StoriesBar from '../../components/Stories/StoriesBar';
import BottomNav from '../../components/social/BottomNav';
import Composer from '../../components/social/Composer';
import { mockPosts, mockStories } from '../../utils/socialMocks';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    setPosts(mockPosts);
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
    <div className="home-container">
      <StoriesBar stories={mockStories} />
      <main className="feed-container">
        {posts.map((post) => (
          <PostCardEnhanced
            key={post.id}
            property={post}
            currentImageIndex={currentImageIndices[post.id] || 0}
            onImageChange={handleImageChange}
            onLike={handleLike}
            onSave={handleSave}
            onFollow={handleFollow}
          />
        ))}
      </main>
      <button className="fab-button" onClick={openComposer} aria-label="Crear nueva publicación">
        +
      </button>
      {isComposerOpen && <Composer onClose={closeComposer} />}
      <BottomNav />
    </div>
  );
};

export default Home;
