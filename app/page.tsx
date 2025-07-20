//Página de inicio de la aplicación
"use client";  

import { useSession } from 'next-auth/react';   
import { useEffect } from 'react';
// import { FaProjectDiagram, FaIndustry, FaDollarSign, FaCalendarAlt, FaFileAlt, FaGavel, FaCalculator, FaCheckCircle, FaCogs, FaChartLine, 
//           FaUsers, FaAward, FaGraduationCap, FaLifeRing, FaUserCog } from "react-icons/fa";
import { useState } from 'react';
import * as Fa from 'react-icons/fa';
interface Card {
  _id: string;
  title: string;
  description: string;
  icon: string;
  orden?:number;
};

export default function HomePage() { 
  const { data: session, status }                   = useSession();
  const [ cards, setCards ]                         = useState<Card[]>([]);
  useEffect(() => {
    const fetchCards = async () => {
      const res = await fetch('/api/catalogs/cards');
      const data = await res.json();
      const cards=data.sort((a:Card, b:Card) => (a.orden ?? 0) - (b.orden ?? 0));
      // console.log('HomePage cards',cards);
      setCards(cards);      
    };
    fetchCards();
  }, []);

  const userName=session?.user.name;
  return (
    <div className={`p-6 dark`}>
    <h1 className="text-4xl font-bold mb-4">Bienvenido a la Plataforma</h1>
    <p className="text-lg mb-6">
      Hola <strong>{userName}</strong>.     
    </p>
   <p className="text-lm mt-1 mb-3">Estas son las herramientas para que puedas gestionar tu condominio: </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      {cards.map((option, orden) => {
        const Icon = Fa[option.icon as keyof typeof Fa];
        // console.log('HomePage option',option,orden);
         return (
          <div key={orden} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition">
             {/* <div className="text-3xl text-blue-600"><Icon /></div> */}
             <div className="text-3xl text-blue-600"> {Icon && <Icon /> }</div>
             <div className="text-2xl text-blue-600">  {option.title}</div>
            <p className="text-gray-700">{option.description}</p>
          </div>
         )
      })}
    </div>
  </div>
  );
}