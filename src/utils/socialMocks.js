// socialMocks.js - Datos mock para funcionalidades sociales
export const mockUsers = [
  {
    id: 1,
    name: "María González",
    username: "mariagonzalez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    verified: true,
    bio: "Amante de los viajes y la fotografía 📸 | Propietaria de hermosos espacios en Bogotá",
    followers: 1250,
    following: 89,
    posts: 24
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    username: "carlosr",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    verified: false,
    bio: "Arquitecto especializado en espacios modernos 🏗️ | Descubre mis diseños",
    followers: 892,
    following: 156,
    posts: 18
  },
  {
    id: 3,
    name: "Ana Martínez",
    username: "anamartinez",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    verified: true,
    bio: "Interior designer | Creo espacios que inspiran ✨",
    followers: 2103,
    following: 234,
    posts: 45
  }
];

export const mockPosts = [
  {
    id: 1,
    user: mockUsers[0],
    images: [
      "https://picsum.photos/800/600?random=1",
      "https://picsum.photos/800/600?random=2",
      "https://picsum.photos/800/600?random=3"
    ],
    description: "¡Nuevo apartamento en Zona Rosa! 🏠✨ Perfecto para tu estadía en Bogotá. Con todas las comodidades y una vista increíble de la ciudad. ¿Quién se anima a reservar?",
    hashtags: ["apartamento", "bogota", "zonarosa", "alquiler", "viajes"],
    likes: 127,
    comments: 23,
    shares: 8,
    timestamp: "2 horas ago",
    location: "Zona Rosa, Bogotá",
    price: 120000,
    type: "apartment",
    isLiked: false,
    isSaved: false,
    isFollowing: false
  },
  {
    id: 2,
    user: mockUsers[1],
    images: [
      "https://picsum.photos/800/600?random=4",
      "https://picsum.photos/800/600?random=5"
    ],
    description: "Casa moderna en Chapinero con jardín privado 🌳 Ideal para familias o grupos de amigos. Espacios amplios y luminosos con acabados de lujo.",
    hashtags: ["casa", "chapinero", "jardin", "familia", "lujo"],
    likes: 89,
    comments: 15,
    shares: 5,
    timestamp: "4 horas ago",
    location: "Chapinero, Bogotá",
    price: 250000,
    type: "house",
    isLiked: true,
    isSaved: true,
    isFollowing: true
  },
  {
    id: 3,
    user: mockUsers[2],
    images: [
      "https://picsum.photos/800/600?random=6",
      "https://picsum.photos/800/600?random=7",
      "https://picsum.photos/800/600?random=8"
    ],
    description: "Estudio minimalista en el corazón de Usaquén 🎨 Perfecto para creativos y profesionales. Ambiente tranquilo y funcional con todo lo necesario.",
    hashtags: ["estudio", "usaquen", "minimalista", "creativos", "profesional"],
    likes: 203,
    comments: 31,
    shares: 12,
    timestamp: "6 horas ago",
    location: "Usaquén, Bogotá",
    price: 80000,
    type: "studio",
    isLiked: false,
    isSaved: false,
    isFollowing: false
  }
];

export const mockReels = [
  {
    id: 1,
    user: mockUsers[0],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://picsum.photos/400/700?random=9",
    description: "Tour por mi nuevo apartamento en Zona Rosa! 😍",
    hashtags: ["apartamento", "tour", "bogota", "zonarosa"],
    likes: 145,
    comments: 28,
    shares: 7,
    timestamp: "1 hora ago",
    location: "Zona Rosa, Bogotá",
    price: 120000
  },
  {
    id: 2,
    user: mockUsers[1],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://picsum.photos/400/700?random=10",
    description: "Amanecer desde la terraza de mi casa en Chapinero 🌅",
    hashtags: ["casa", "terraza", "amanecer", "chapinero"],
    likes: 98,
    comments: 19,
    shares: 4,
    timestamp: "3 horas ago",
    location: "Chapinero, Bogotá",
    price: 250000
  },
  {
    id: 3,
    user: mockUsers[2],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://picsum.photos/400/700?random=11",
    description: "Tips de decoración para espacios pequeños ✨",
    hashtags: ["decoracion", "tips", "pequeños", "usaquen"],
    likes: 267,
    comments: 45,
    shares: 18,
    timestamp: "5 horas ago",
    location: "Usaquén, Bogotá",
    price: 80000
  }
];

export const mockStories = [
  {
    id: 1,
    user: mockUsers[0],
    media: [
      {
        type: "image",
        url: "https://picsum.photos/400/600?random=12",
        duration: 5000
      },
      {
        type: "image",
        url: "https://picsum.photos/400/600?random=13",
        duration: 3000
      }
    ],
    timestamp: Date.now() - 3600000, // 1 hora ago
    isViewed: false
  },
  {
    id: 2,
    user: mockUsers[1],
    media: [
      {
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: 10000
      }
    ],
    timestamp: Date.now() - 7200000, // 2 horas ago
    isViewed: true
  },
  {
    id: 3,
    user: mockUsers[2],
    media: [
      {
        type: "image",
        url: "https://picsum.photos/400/600?random=14",
        duration: 4000
      }
    ],
    timestamp: Date.now() - 18000000, // 5 horas ago
    isViewed: false
  }
];

export const mockServices = [
  {
    id: 1,
    title: "Limpieza Profesional",
    description: "Servicio de limpieza profunda para propiedades",
    category: "Limpieza",
    price: 50000,
    rating: 4.8,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    provider: mockUsers[0],
    location: "Zona Rosa, Bogotá",
    duration: "2-3 horas"
  },
  {
    id: 2,
    title: "Mantenimiento de Jardín",
    description: "Cuidado y mantenimiento de jardines y áreas verdes",
    category: "Jardinería",
    price: 75000,
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    provider: mockUsers[1],
    location: "Chapinero, Bogotá",
    duration: "1 día"
  },
  {
    id: 3,
    title: "Decoración de Interiores",
    description: "Asesoría y decoración personalizada para tu espacio",
    category: "Decoración",
    price: 150000,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    provider: mockUsers[2],
    location: "Usaquén, Bogotá",
    duration: "3-5 días"
  }
];
