import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import StoriesBar from '../../components/Stories/StoriesBar';
import propertyService from '../../services/propertyService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        let location = null;
        try {
          location = await propertyService.getUserLocation();
          setUserLocation(location);
        } catch (err) {
          console.warn('User location not available, loading default properties');
        }

        let response;
        if (location) {
          response = await propertyService.getNearbyProperties(location.lat, location.lon);
        } else {
          response = await propertyService.getAllProperties();
        }
        setProperties(response.data);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleImageChange = (propertyId, direction) => {
    setCurrentImageIndices((prev) => {
      const currentIndex = prev[propertyId] || 0;
      const property = properties.find((p) => p.id === propertyId);
      if (!property) return prev;
      const imagesCount = property.images.length;
      let newIndex = currentIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % imagesCount;
      } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
      }
      return { ...prev, [propertyId]: newIndex };
    });
  };

  const handleViewDetails = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleReserve = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleContact = (propertyId) => {
    // TODO: Implement contact host functionality
    alert(`Contact host for property ${propertyId}`);
  };

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <StoriesBar />

      <main className="property-list-container">
        {loading && <p>Cargando propiedades...</p>}
        {!loading && properties.length === 0 && <p>No se encontraron propiedades.</p>}
        <AnimatePresence>
          {properties.map((property) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PropertyCard
                property={property}
                currentImageIndex={currentImageIndices[property.id] || 0}
                onViewDetails={handleViewDetails}
                onContact={handleContact}
                onReserve={handleReserve}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default Home;
