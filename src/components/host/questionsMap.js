// questionsMap.js
// Configuration for dynamic questions based on host type selection

export const questionsMap = {
  rentals: [
    {
      id: 'propertyType',
      type: 'select',
      label: 'Tipo de propiedad',
      required: true,
      hint: 'Selecciona el tipo de alojamiento que ofreces',
      options: [
        { value: 'apartment', label: 'Apartamento' },
        { value: 'house', label: 'Casa' },
        { value: 'room', label: 'Habitación' },
        { value: 'studio', label: 'Estudio' }
      ]
    },
    {
      id: 'location',
      type: 'text',
      label: 'Ubicación',
      required: true,
      hint: 'Dirección completa de la propiedad',
      placeholder: 'Calle, número, ciudad, país'
    },
    {
      id: 'guests',
      type: 'number',
      label: 'Número máximo de huéspedes',
      required: true,
      min: 1,
      max: 20,
      hint: '¿Cuántas personas pueden alojarse?'
    },
    {
      id: 'bedrooms',
      type: 'number',
      label: 'Número de habitaciones',
      required: true,
      min: 1,
      max: 10
    },
    {
      id: 'price',
      type: 'number',
      label: 'Precio por noche (€)',
      required: true,
      min: 10,
      max: 1000,
      hint: 'Precio base por noche'
    }
  ],
  marketplace: [
    {
      id: 'itemType',
      type: 'select',
      label: 'Tipo de artículo',
      required: true,
      hint: '¿Qué tipo de producto vendes?',
      options: [
        { value: 'electronics', label: 'Electrónicos' },
        { value: 'clothing', label: 'Ropa y accesorios' },
        { value: 'home', label: 'Hogar y jardín' },
        { value: 'sports', label: 'Deportes' },
        { value: 'books', label: 'Libros' },
        { value: 'other', label: 'Otro' }
      ]
    },
    {
      id: 'itemName',
      type: 'text',
      label: 'Nombre del artículo',
      required: true,
      hint: 'Describe brevemente tu producto',
      placeholder: 'Ej: Bicicleta de montaña Trek'
    },
    {
      id: 'condition',
      type: 'radio',
      label: 'Estado del artículo',
      required: true,
      options: [
        { value: 'new', label: 'Nuevo' },
        { value: 'like_new', label: 'Como nuevo' },
        { value: 'good', label: 'Buen estado' },
        { value: 'fair', label: 'Estado regular' }
      ]
    },
    {
      id: 'price',
      type: 'number',
      label: 'Precio (€)',
      required: true,
      min: 1,
      max: 10000,
      hint: 'Precio de venta'
    },
    {
      id: 'description',
      type: 'text',
      label: 'Descripción detallada',
      required: false,
      hint: 'Proporciona más detalles sobre tu producto',
      placeholder: 'Describe características, medidas, etc.'
    }
  ],
  services: [
    {
      id: 'serviceType',
      type: 'select',
      label: 'Tipo de servicio',
      required: true,
      hint: '¿Qué tipo de servicio ofreces?',
      options: [
        { value: 'cleaning', label: 'Limpieza' },
        { value: 'repair', label: 'Reparaciones' },
        { value: 'tutoring', label: 'Clases particulares' },
        { value: 'pet_care', label: 'Cuidado de mascotas' },
        { value: 'gardening', label: 'Jardinería' },
        { value: 'other', label: 'Otro' }
      ]
    },
    {
      id: 'serviceName',
      type: 'text',
      label: 'Nombre del servicio',
      required: true,
      hint: 'Describe brevemente tu servicio',
      placeholder: 'Ej: Limpieza de oficinas'
    },
    {
      id: 'experience',
      type: 'select',
      label: 'Años de experiencia',
      required: true,
      options: [
        { value: '0-1', label: 'Menos de 1 año' },
        { value: '1-3', label: '1-3 años' },
        { value: '3-5', label: '3-5 años' },
        { value: '5+', label: 'Más de 5 años' }
      ]
    },
    {
      id: 'availability',
      type: 'checkboxes',
      label: 'Disponibilidad',
      required: true,
      hint: 'Selecciona los días que estás disponible',
      options: [
        { value: 'monday', label: 'Lunes' },
        { value: 'tuesday', label: 'Martes' },
        { value: 'wednesday', label: 'Miércoles' },
        { value: 'thursday', label: 'Jueves' },
        { value: 'friday', label: 'Viernes' },
        { value: 'saturday', label: 'Sábado' },
        { value: 'sunday', label: 'Domingo' }
      ]
    },
    {
      id: 'hourlyRate',
      type: 'number',
      label: 'Tarifa por hora (€)',
      required: true,
      min: 5,
      max: 200,
      hint: '¿Cuánto cobras por hora?'
    },
    {
      id: 'certifications',
      type: 'file',
      label: 'Certificaciones (opcional)',
      required: false,
      hint: 'Sube tus certificados o diplomas relevantes',
      accept: '.pdf,.jpg,.png'
    }
  ]
};
