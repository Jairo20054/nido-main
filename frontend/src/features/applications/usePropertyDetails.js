import { useEffect, useState } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';

export function usePropertyDetails(propertyId) {
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    api
      .get(`/properties/${propertyId}`, { auth: isAuthenticated })
      .then((response) => {
        if (active) {
          setProperty(response.data);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setProperty(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [propertyId, isAuthenticated]);

  return {
    property,
    loading,
    error,
  };
}
