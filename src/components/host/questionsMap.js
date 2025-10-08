// questionsMap.js
// JSON structure for questions by selection type
// Types: rentals (arrendamiento), marketplace, services (productos y servicios)

const questionsMap = {
  rentals: [
    {
      id: 'propertyType',
      type: 'select',
      label: '¿Qué tipo de propiedad quieres arrendar?',
      required: true,
      hint: 'Selecciona el tipo de propiedad que ofreces.',
      options: [
        { value: 'apartment', label: 'Apartamento' },
        { value: 'house', label: 'Casa' },
        { value: 'room', label: 'Habitación' },
        { value: 'studio', label: 'Estudio' }
      ]
    },
    {
      id: 'duration',
      type: 'select',
      label: '¿Cuál es la duración mínima del arrendamiento?',
      required: true,
      hint: 'Elige la duración mínima permitida.',
      options: [
        { value: '1month', label: '1 mes' },
        { value: '3months', label: '3 meses' },
        { value: '6months', label: '6 meses' },
        { value: '1year', label: '1 año' }
      ]
    },
    {
      id: 'guests',
      type: 'number',
      label: '¿Cuántos huéspedes pueden alojarse?',
      required: true,
      hint: 'Número máximo de huéspedes.',
      min: 1,
      max: 20
    },
    {
      id: 'description',
      type: 'text',
      label: 'Describe tu propiedad',
      required: false,
      hint: 'Proporciona detalles atractivos sobre tu propiedad.',
      placeholder: 'Escribe una descripción...'
    },
    {
      id: 'amenities',
      type: 'checkboxes',
      label: '¿Qué comodidades ofreces?',
      required: false,
      hint: 'Selecciona todas las que apliquen.',
      options: [
        { value: 'wifi', label: 'WiFi' },
        { value: 'parking', label: 'Estacionamiento' },
        { value: 'pool', label: 'Piscina' },
        { value: 'gym', label: 'Gimnasio' },
        { value: 'kitchen', label: 'Cocina' }
      ]
    }
  ],
  marketplace: [
    {
      id: 'serviceType',
      type: 'select',
      label: '¿Qué tipo de servicios quieres ofrecer?',
      required: true,
      hint: 'Elige la categoría de tus productos o servicios.',
      options: [
        { value: 'food', label: 'Comida y bebidas' },
        { value: 'entertainment', label: 'Entretenimiento' },
        { value: 'tours', label: 'Tours y experiencias' },
        { value: 'other', label: 'Otros' }
      ]
    },
    {
      id: 'priceRange',
      type: 'select',
      label: '¿Cuál es el rango de precios de tus productos?',
      required: true,
      hint: 'Selecciona el rango aproximado.',
      options: [
        { value: 'low', label: 'Bajo (menos de $50)' },
        { value: 'medium', label: '$50 - $200' },
        { value: 'high', label: 'Alto (más de $200)' }
      ]
    },
    {
      id: 'availability',
      type: 'radio',
      label: '¿Cuándo están disponibles tus servicios?',
      required: true,
      hint: 'Indica la disponibilidad general.',
      options: [
        { value: 'weekdays', label: 'Días de semana' },
        { value: 'weekends', label: 'Fines de semana' },
        { value: 'always', label: 'Siempre' }
      ]
    },
    {
      id: 'details',
      type: 'text',
      label: 'Detalles adicionales',
      required: false,
      hint: 'Cualquier información extra sobre tus ofertas.',
      placeholder: 'Escribe detalles...'
    }
  ],
  services: [
    {
      id: 'serviceCategory',
      type: 'select',
      label: '¿Qué categoría de productos o servicios adicionales ofreces?',
      required: true,
      hint: 'Selecciona la categoría principal.',
      options: [
        { value: 'cleaning', label: 'Limpieza' },
        { value: 'maintenance', label: 'Mantenimiento' },
        { value: 'transport', label: 'Transporte' },
        { value: 'other', label: 'Otros' }
      ]
    },
    {
      id: 'requirements',
      type: 'text',
      label: '¿Tienes algún requisito especial para estos servicios?',
      required: false,
      hint: 'Describe requisitos como certificaciones o equipos necesarios.',
      placeholder: 'Escribe requisitos...'
    },
    {
      id: 'pricing',
      type: 'number',
      label: 'Precio base por servicio',
      required: true,
      hint: 'Precio mínimo o base.',
      min: 0
    },
    {
      id: 'documents',
      type: 'file',
      label: 'Sube documentos relevantes (opcional)',
      required: false,
      hint: 'Certificados, licencias, etc. (UI solo, no upload real).',
      accept: '.pdf,.jpg,.png'
    },
    {
      id: 'contact',
      type: 'text',
      label: 'Información de contacto adicional',
      required: false,
      hint: 'Teléfono o email extra si es necesario.',
      placeholder: 'Escribe contacto...'
    }
  ]
};

export default questionsMap;
