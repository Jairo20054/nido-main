import React from 'react';
import { Filter, Search } from 'lucide-react';

const roommates = [
  { id: 1, name: "Camila R.", age: 22, budget: "$700k max", bio: "Estudiante de Diseño. Ordenada y tranquila.", lookingFor: "Habitación cerca a Javeriana", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 2, name: "David M.", age: 24, budget: "$900k max", bio: "Ingeniero Junior. Busco compartir apto grande.", lookingFor: "Roommate para Apto en Centro", avatar: "https://i.pravatar.cc/150?img=11" },
  { id: 3, name: "Laura y Sofi", age: "20-21", budget: "$1.5M total", bio: "Estudiantes de medicina. Buscamos 3ra persona.", lookingFor: "Apto 3 habitaciones", avatar: "https://i.pravatar.cc/150?img=9" },
];

const Roommates = () => (
  <div className="container mx-auto px-4 py-8 animate-fade-in bg-gray-50 min-h-screen">
    <div className="flex flex-col md:flex-row justify-between items-end mb-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Encuentra tu Roommate</h2>
        <p className="text-gray-600 mt-2">Conecta con estudiantes compatibles para compartir gastos.</p>
      </div>
      <div className="flex gap-3 mt-4 md:mt-0">
        <button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={18} /> Filtros
        </button>
        <button className="bg-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-600 shadow-sm shadow-rose-200">
          Crear mi perfil
        </button>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {roommates.map(user => (
        <div key={user.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-rose-100 to-purple-100"></div>
          <div className="relative flex flex-col items-center text-center">
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-3" />
            <h3 className="font-bold text-lg text-gray-800">{user.name}, {user.age}</h3>
            <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-1 rounded-md mb-4">
              Presupuesto: {user.budget}
            </span>
            <p className="text-sm text-gray-500 mb-4 italic">"{user.bio}"</p>
            
            <div className="w-full bg-gray-50 p-3 rounded-xl mb-4 text-left">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Busca:</span>
              <p className="text-sm text-gray-700 font-medium flex items-start gap-1 mt-1">
                <Search size={14} className="mt-0.5 shrink-0" /> {user.lookingFor}
              </p>
            </div>

            <button className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors">
              Ver Perfil Completo
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Roommates;
