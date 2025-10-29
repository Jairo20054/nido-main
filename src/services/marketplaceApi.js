// Marketplace API Service - Mock implementation
// In production, replace with actual API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Mock data for products
const mockProducts = [
  {
    id: 1,
    title: 'Sofá Moderno 3 Plazas',
    price: 1299900,
    originalPrice: 1599900,
    images: ['/images/sofa-1.jpg', '/images/sofa-2.jpg', '/images/sofa-3.jpg'],
    category: 'furniture',
    subcategory: 'Sofás y sillones',
    description: 'Sofá moderno de 3 plazas con tapizado en tela resistente. Incluye cojines decorativos y estructura en madera certificada.',
    condition: 'new',
    location: 'Bogotá, Cundinamarca',
    seller: {
      id: 1,
      name: 'Muebles del Valle',
      verified: true,
      rating: 4.8,
      responseTime: '2 horas',
      totalSales: 156,
      avatar: '/images/seller-1.jpg'
    },
    rating: 4.6,
    reviewCount: 23,
    features: ['3 plazas', 'Tapizado tela', 'Estructura madera', 'Cojines incluidos', 'Garantía 2 años'],
    availability: 'En stock',
    shippingTime: '3-5 días hábiles',
    tags: ['Nuevo', 'Envío gratis', 'Garantía 2 años'],
    variants: [
      { type: 'color', value: 'Gris', price: 1299900 },
      { type: 'color', value: 'Azul', price: 1299900 },
      { type: 'color', value: 'Beige', price: 1329900 }
    ]
  },
  {
    id: 2,
    title: 'Refrigerador Samsung 400L',
    price: 899900,
    images: ['/images/fridge-1.jpg', '/images/fridge-2.jpg'],
    category: 'appliances',
    subcategory: 'Refrigeradores',
    description: 'Refrigerador Samsung de 400L con tecnología No Frost y dispensador de agua. Eficiencia energética A+.',
    condition: 'new',
    location: 'Medellín, Antioquia',
    seller: {
      id: 2,
      name: 'ElectroHogar SAS',
      verified: true,
      rating: 4.9,
      responseTime: '< 1 hora',
      totalSales: 89,
      avatar: '/images/seller-2.jpg'
    },
    rating: 4.8,
    reviewCount: 45,
    features: ['No Frost', 'Dispensador agua', '400L capacidad', 'Eficiencia energética A+', 'Inverter'],
    availability: 'Disponible',
    shippingTime: '5-7 días hábiles',
    tags: ['Nuevo', 'Garantía oficial', 'Instalación incluida']
  },
  {
    id: 3,
    title: 'Set Ollas Antiadherentes 5 piezas',
    price: 149900,
    originalPrice: 199900,
    images: ['/images/pots-set.jpg', '/images/pots-set-2.jpg'],
    category: 'kitchen',
    subcategory: 'Ollas y sartenes',
    description: 'Set completo de 5 ollas antiadherentes con mango ergonómico y compatible con todo tipo de cocinas.',
    condition: 'new',
    location: 'Cali, Valle del Cauca',
    seller: {
      id: 3,
      name: 'Cocina Moderna',
      verified: true,
      rating: 4.7,
      responseTime: '3 horas',
      totalSales: 234,
      avatar: '/images/seller-3.jpg'
    },
    rating: 4.5,
    reviewCount: 67,
    features: ['5 piezas', 'Antiadherente', 'Mango ergonómico', 'Inducción compatible', 'Fácil limpieza'],
    availability: 'En stock',
    shippingTime: '2-3 días hábiles',
    tags: ['Oferta', 'Nuevo', 'Envío gratis']
  },
  {
    id: 4,
    title: 'Lámpara LED de Escritorio',
    price: 79900,
    images: ['/images/desk-lamp.jpg', '/images/desk-lamp-2.jpg'],
    category: 'lighting',
    subcategory: 'Lámparas de mesa',
    description: 'Lámpara de escritorio LED regulable con brazo articulado y base pesada. Ideal para estudio o oficina.',
    condition: 'new',
    location: 'Barranquilla, Atlántico',
    seller: {
      id: 4,
      name: 'Iluminación Express',
      verified: false,
      rating: 4.3,
      responseTime: '5 horas',
      totalSales: 78,
      avatar: '/images/seller-4.jpg'
    },
    rating: 4.2,
    reviewCount: 34,
    features: ['LED regulable', 'Brazo articulado', 'Base pesada', 'Cable 1.5m', 'USB integrado'],
    availability: 'Disponible',
    shippingTime: '3-4 días hábiles',
    tags: ['Nuevo', 'LED eficiente']
  },
  {
    id: 5,
    title: 'Juego de Sábanas Queen Size',
    price: 89900,
    images: ['/images/sheets-set.jpg', '/images/sheets-set-2.jpg'],
    category: 'textiles',
    subcategory: 'Sábanas y fundas',
    description: 'Juego completo de sábanas de algodón 100% para cama queen size. Incluye 2 fundas de almohada.',
    condition: 'new',
    location: 'Bogotá, Cundinamarca',
    seller: {
      id: 5,
      name: 'Textiles del Hogar',
      verified: true,
      rating: 4.6,
      responseTime: '4 horas',
      totalSales: 145,
      avatar: '/images/seller-5.jpg'
    },
    rating: 4.4,
    reviewCount: 56,
    features: ['Algodón 100%', 'Queen size', '2 fundas almohada', 'Lavable máquina', 'Suave al tacto'],
    availability: 'En stock',
    shippingTime: '2-3 días hábiles',
    tags: ['Nuevo', 'Algodón premium']
  },
  {
    id: 6,
    title: 'Organizador de Cocina 4 Cajones',
    price: 129900,
    images: ['/images/kitchen-organizer.jpg', '/images/kitchen-organizer-2.jpg'],
    category: 'storage',
    subcategory: 'Organización de cocina',
    description: 'Organizador modular para cocina con 4 cajones deslizantes y diseño moderno.',
    condition: 'new',
    location: 'Medellín, Antioquia',
    seller: {
      id: 6,
      name: 'Organización Total',
      verified: true,
      rating: 4.5,
      responseTime: '2 horas',
      totalSales: 92,
      avatar: '/images/seller-6.jpg'
    },
    rating: 4.3,
    reviewCount: 28,
    features: ['4 cajones', 'Deslizantes suave', 'Madera MDF', 'Fácil ensamblaje', 'Espacio optimizado'],
    availability: 'Disponible',
    shippingTime: '4-5 días hábiles',
    tags: ['Nuevo', 'Fácil instalación']
  },
  {
    id: 7,
    title: 'Taladro Inalámbrico Bosch',
    price: 249900,
    images: ['/images/drill-1.jpg', '/images/drill-2.jpg'],
    category: 'tools',
    subcategory: 'Herramientas eléctricas',
    description: 'Taladro inalámbrico Bosch con batería de litio y múltiples funciones. Ideal para proyectos DIY.',
    condition: 'new',
    location: 'Bogotá, Cundinamarca',
    seller: {
      id: 7,
      name: 'Herramientas Pro',
      verified: true,
      rating: 4.7,
      responseTime: '1 hora',
      totalSales: 203,
      avatar: '/images/seller-7.jpg'
    },
    rating: 4.5,
    reviewCount: 89,
    features: ['Batería litio', '18V', '2 velocidades', 'Mandril automático', 'Maletín incluido'],
    availability: 'En stock',
    shippingTime: '3-5 días hábiles',
    tags: ['Nuevo', 'Garantía Bosch', 'Batería incluida']
  },
  {
    id: 8,
    title: 'Mesa de Jardín Extensible',
    price: 349900,
    images: ['/images/garden-table.jpg', '/images/garden-table-2.jpg'],
    category: 'garden',
    subcategory: 'Muebles de jardín',
    description: 'Mesa de jardín extensible con tapa de vidrio templado. Resistente a la intemperie.',
    condition: 'new',
    location: 'Cali, Valle del Cauca',
    seller: {
      id: 8,
      name: 'Jardín Perfecto',
      verified: true,
      rating: 4.4,
      responseTime: '6 horas',
      totalSales: 67,
      avatar: '/images/seller-8.jpg'
    },
    rating: 4.3,
    reviewCount: 42,
    features: ['Extensible', 'Vidrio templado', 'Aluminio resistente', 'Fácil limpieza', 'Plegable'],
    availability: 'Disponible',
    shippingTime: '7-10 días hábiles',
    tags: ['Nuevo', 'Resistente intemperie', 'Garantía 3 años']
  }
];

// Mock categories
const mockCategories = [
  {
    id: 'furniture',
    label: 'Muebles y Decoración',
    icon: '🪑',
    subcategories: [
      'Sofás y sillones', 'Sillas y mesas', 'Camas y colchones',
      'Escritorios', 'Armarios y roperos', 'Estanterías', 'Mesas de centro'
    ]
  },
  {
    id: 'appliances',
    label: 'Electrodomésticos',
    icon: '🏠',
    subcategories: [
      'Refrigeradores', 'Lavadoras', 'Microondas', 'Aspiradoras',
      'Cafeteras', 'Licuadoras', 'Hornos eléctricos'
    ]
  },
  {
    id: 'kitchen',
    label: 'Cocina y Utensilios',
    icon: '🍳',
    subcategories: [
      'Ollas y sartenes', 'Vajilla', 'Cubiertos', 'Utensilios de cocina',
      'Organización', 'Electrodomésticos de cocina'
    ]
  },
  {
    id: 'garden',
    label: 'Jardín y Exteriores',
    icon: '🌿',
    subcategories: [
      'Muebles de jardín', 'Herramientas', 'Plantas y macetas',
      'Iluminación exterior', 'Decoración jardín', 'Riego'
    ]
  },
  {
    id: 'lighting',
    label: 'Iluminación',
    icon: '💡',
    subcategories: [
      'Lámparas de techo', 'Lámparas de mesa', 'Lámparas de pie',
      'Iluminación LED', 'Lámparas infantiles', 'Iluminación decorativa'
    ]
  },
  {
    id: 'textiles',
    label: 'Textiles del Hogar',
    icon: '🛏️',
    subcategories: [
      'Sábanas y fundas', 'Edredones', 'Cortinas', 'Toallas',
      'Alfombras', 'Cojines decorativos'
    ]
  },
  {
    id: 'storage',
    label: 'Organización y Almacenamiento',
    icon: '📦',
    subcategories: [
      'Cajoneras', 'Organizadores', 'Cajas de almacenamiento',
      'Percheros', 'Muebles de baño', 'Estanterías modulares'
    ]
  },
  {
    id: 'tools',
    label: 'Bricolaje y Herramientas',
    icon: '🔧',
    subcategories: [
      'Herramientas manuales', 'Herramientas eléctricas', 'Pintura',
      'Materiales de construcción', 'Ferretería', 'Seguridad'
    ]
  }
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions
export const marketplaceApi = {
  // Get products with filtering and pagination
  async getProducts(params = {}) {
    await delay();

    let filteredProducts = [...mockProducts];

    // Search filter
    if (params.q) {
      const query = params.q.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (params.category && params.category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === params.category);
    }

    // Price range filter
    if (params.minPrice || params.maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price;
        const minPrice = params.minPrice || 0;
        const maxPrice = params.maxPrice || Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Condition filter
    if (params.condition && params.condition !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.condition === params.condition);
    }

    // Location filter
    if (params.location && params.location !== 'all') {
      filteredProducts = filteredProducts.filter(product =>
        product.location.toLowerCase().includes(params.location.toLowerCase())
      );
    }

    // Rating filter
    if (params.rating && params.rating > 0) {
      filteredProducts = filteredProducts.filter(product => product.rating >= params.rating);
    }

    // Sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => b.id - a.id);
          break;
        case 'relevance':
        default:
          // Keep original order for relevance
          break;
      }
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit)
    };
  },

  // Get single product by ID
  async getProduct(id) {
    await delay();
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  // Get categories
  async getCategories() {
    await delay();
    return mockCategories;
  },

  // Search suggestions
  async getSearchSuggestions(query) {
    await delay(200); // Faster for autocomplete
    if (!query || query.length < 2) return [];

    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Product titles
    mockProducts.forEach(product => {
      if (product.title.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'product',
          text: product.title,
          id: product.id
        });
      }
    });

    // Categories
    mockCategories.forEach(category => {
      if (category.label.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'category',
          text: category.label,
          id: category.id
        });
      }
      // Subcategories
      category.subcategories.forEach(sub => {
        if (sub.toLowerCase().includes(lowerQuery)) {
          suggestions.push({
            type: 'subcategory',
            text: `${category.label} > ${sub}`,
            categoryId: category.id,
            subcategory: sub
          });
        }
      });
    });

    return suggestions.slice(0, 8); // Limit suggestions
  },

  // Add to cart (mock - in real app this would be a POST)
  async addToCart(productId, quantity = 1) {
    await delay();
    // In a real app, this would make an API call
    return { success: true, message: 'Added to cart' };
  },

  // Get cart (mock - in real app this would fetch from server)
  async getCart() {
    await delay();
    // In a real app, this would fetch cart from server
    return [];
  }
};

export default marketplaceApi;
