import api from './api';

const propertyService = {
  // Obtener todas las propiedades con filtros opcionales
  getAllProperties: async (params = {}) => {
    try {
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Obtener propiedades cerca de la ubicación del usuario
  getNearbyProperties: async (lat, lon, radius = 50, params = {}) => {
    try {
      const response = await api.get('/properties', {
        params: {
          ...params,
          lat,
          lon,
          radius
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
      throw error;
    }
  },

  // Obtener una propiedad por ID
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  // Crear una nueva propiedad
  createProperty: async (propertyData) => {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Actualizar una propiedad
  updateProperty: async (id, propertyData) => {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Eliminar una propiedad
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Obtener la ubicación del usuario
  getUserLocation: async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }
};

export default propertyService;
