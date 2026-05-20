export const LOCATIONS = [
  {
    country: 'Colombia',
    departments: [
      {
        name: 'Antioquia',
        cities: ['Medellin', 'Envigado', 'Bello', 'Itagui', 'Rionegro', 'Sabaneta', 'La Estrella'],
      },
      {
        name: 'Atlantico',
        cities: ['Barranquilla', 'Soledad', 'Puerto Colombia', 'Malambo', 'Galapa'],
      },
      {
        name: 'Bogota D.C.',
        cities: ['Bogota'],
      },
      {
        name: 'Bolivar',
        cities: ['Cartagena', 'Turbaco', 'Arjona', 'Magangue'],
      },
      {
        name: 'Cundinamarca',
        cities: ['Chia', 'Cajica', 'Zipaquira', 'Soacha', 'Facatativa', 'Mosquera', 'Funza'],
      },
      {
        name: 'Risaralda',
        cities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
      },
      {
        name: 'Santander',
        cities: ['Bucaramanga', 'Floridablanca', 'Giron', 'Piedecuesta'],
      },
      {
        name: 'Valle del Cauca',
        cities: ['Cali', 'Palmira', 'Jamundi', 'Yumbo', 'Buga', 'Tulua', 'Cartago'],
      },
    ],
  },
  {
    country: 'Mexico',
    departments: [
      {
        name: 'Ciudad de Mexico',
        cities: ['Benito Juarez', 'Cuauhtemoc', 'Miguel Hidalgo', 'Coyoacan', 'Alvaro Obregon'],
      },
      {
        name: 'Jalisco',
        cities: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tlajomulco de Zuniga'],
      },
      {
        name: 'Nuevo Leon',
        cities: ['Monterrey', 'San Pedro Garza Garcia', 'San Nicolas de los Garza', 'Guadalupe'],
      },
    ],
  },
  {
    country: 'Estados Unidos',
    departments: [
      {
        name: 'Florida',
        cities: ['Miami', 'Orlando', 'Tampa', 'Fort Lauderdale'],
      },
      {
        name: 'Texas',
        cities: ['Austin', 'Houston', 'Dallas', 'San Antonio'],
      },
    ],
  },
];

export const getCountryOptions = () => LOCATIONS.map((item) => item.country);

export const getDepartmentsForCountry = (country) =>
  LOCATIONS.find((item) => item.country === country)?.departments || [];

export const getCitiesForDepartment = (country, department) =>
  getDepartmentsForCountry(country).find((item) => item.name === department)?.cities || [];

export const inferCountryFromLocation = (department, city) => {
  const normalizedDepartment = String(department || '').trim().toLowerCase();
  const normalizedCity = String(city || '').trim().toLowerCase();

  if (!normalizedDepartment && !normalizedCity) {
    return '';
  }

  const match = LOCATIONS.find((location) =>
    location.departments.some(
      (item) =>
        item.name.toLowerCase() === normalizedDepartment ||
        item.cities.some((candidate) => candidate.toLowerCase() === normalizedCity)
    )
  );

  return match?.country || '';
};
