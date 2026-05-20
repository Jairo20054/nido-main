export const LOCATIONS = [
  {
    country: 'Colombia',
    departments: [
      {
        name: 'Antioquia',
        cities: ['Medellín', 'Envigado', 'Bello', 'Itagüí', 'Rionegro', 'Sabaneta', 'La Estrella'],
      },
      {
        name: 'Atlántico',
        cities: ['Barranquilla', 'Soledad', 'Puerto Colombia', 'Malambo', 'Galapa'],
      },
      {
        name: 'Bogotá D.C.',
        cities: ['Bogotá'],
      },
      {
        name: 'Bolívar',
        cities: ['Cartagena', 'Turbaco', 'Arjona', 'Magangue'],
      },
      {
        name: 'Cundinamarca',
        cities: ['Chía', 'Cajicá', 'Zipaquirá', 'Soacha', 'Facatativá', 'Mosquera', 'Funza'],
      },
      {
        name: 'Risaralda',
        cities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
      },
      {
        name: 'Santander',
        cities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta'],
      },
      {
        name: 'Valle del Cauca',
        cities: ['Cali', 'Palmira', 'Jamundí', 'Yumbo', 'Buga', 'Tuluá', 'Cartago'],
      },
    ],
  },
  {
    country: 'México',
    departments: [
      {
        name: 'Ciudad de México',
        cities: ['Benito Juárez', 'Cuauhtémoc', 'Miguel Hidalgo', 'Coyoacán', 'Álvaro Obregón'],
      },
      {
        name: 'Jalisco',
        cities: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tlajomulco de Zúñiga'],
      },
      {
        name: 'Nuevo León',
        cities: ['Monterrey', 'San Pedro Garza García', 'San Nicolás de los Garza', 'Guadalupe'],
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

const normalizeLocationValue = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const findCountry = (country) => LOCATIONS.find((item) => normalizeLocationValue(item.country) === normalizeLocationValue(country));

export const getDepartmentsForCountry = (country) =>
  findCountry(country)?.departments || [];

export const getCitiesForDepartment = (country, department) =>
  getDepartmentsForCountry(country).find((item) => normalizeLocationValue(item.name) === normalizeLocationValue(department))?.cities ||
  [];

export const hasKnownCountry = (country) => Boolean(findCountry(country));

export const hasKnownDepartment = (country, department) =>
  getDepartmentsForCountry(country).some((item) => normalizeLocationValue(item.name) === normalizeLocationValue(department));

export const hasKnownCity = (country, department, city) =>
  getCitiesForDepartment(country, department).some((item) => normalizeLocationValue(item) === normalizeLocationValue(city));

export const resolveLocationValues = ({ country, department, city }) => {
  const explicitCountry = findCountry(country);
  const inferredCountry =
    explicitCountry ||
    LOCATIONS.find((location) =>
      location.departments.some(
        (item) =>
          normalizeLocationValue(item.name) === normalizeLocationValue(department) ||
          item.cities.some((candidate) => normalizeLocationValue(candidate) === normalizeLocationValue(city))
      )
    );

  if (!inferredCountry) {
    return { country: '', department: '', city: '' };
  }

  const matchedDepartment =
    inferredCountry.departments.find((item) => normalizeLocationValue(item.name) === normalizeLocationValue(department)) ||
    inferredCountry.departments.find((item) =>
      item.cities.some((candidate) => normalizeLocationValue(candidate) === normalizeLocationValue(city))
    );

  if (!matchedDepartment) {
    return { country: inferredCountry.country, department: '', city: '' };
  }

  const matchedCity = matchedDepartment.cities.find((candidate) => normalizeLocationValue(candidate) === normalizeLocationValue(city));

  return {
    country: inferredCountry.country,
    department: matchedDepartment.name,
    city: matchedCity || '',
  };
};

export const inferCountryFromLocation = (department, city) => {
  return resolveLocationValues({ department, city }).country;
};
