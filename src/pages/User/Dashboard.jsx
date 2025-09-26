import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import ProtectedRoute from '../../components/common/ProtectedRoute';

const Dashboard = () => {
  const { authToken } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setProfile(response.usuario || response);
      } catch (err) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [authToken]);

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return <div>No se encontró el perfil.</div>;
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-container">
        <h1>Bienvenido, {profile.name}</h1>
        <p>Email: {profile.email}</p>
        {/* Aquí puedes agregar más detalles del perfil */}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
