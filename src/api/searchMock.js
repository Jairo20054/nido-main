// Archivo para simular llamadas a API de búsqueda
export const searchProperties = async (query, page = 1) => {
  // Simula delay y resultados
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = 30;
      const perPage = 10;
      const start = (page - 1) * perPage;
      const end = Math.min(start + perPage, total);
      const results = [];
      for (let i = start; i < end; i++) {
        results.push({
          id: i + 1,
          title: `Propiedad ${i + 1} - ${query}`,
          category: ['Casa', 'Departamento', 'Villa'][i % 3],
          image: `https://picsum.photos/seed/${i + 1}/300/200`,
          url: `/property/${i + 1}`
        });
      }
      resolve({ results, total });
    }, 700);
  });
};
