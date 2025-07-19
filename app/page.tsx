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
};

export default function HomePage() { 
  const { data: session, status }                   = useSession();
  const [ cards, setCards ]                         = useState<Card[]>([]);
  // useEffect(()=>{
  //   console.log('HomePage cards',cards);
  // },[cards]);
  useEffect(() => {
    const fetchCards = async () => {
      const res = await fetch('/api/catalogs/cards');
      setCards( await res.json());      
    };
    fetchCards();
  }, []);

  const userName=session?.user.name;
  // const menuOptions = [
  //   { title: "Proyectos", description: "Gestión y seguimiento de proyectos solares fotovoltáicos.", icon: <FaProjectDiagram /> },
  //   { title: "Proveedores", description: "Explora y contacta proveedores de productos y servicios, .", icon: <FaIndustry /> },
  //   { title: "Cronogramas", description: "Planifica y organiza cada tareas asignando responsables y plazos.", icon: <FaCalendarAlt /> },
  //   { title: "Costos y presupuestos", description: "Herramientas para controlar costos de cada actividad.", icon: <FaCalculator /> },
  //   { title: "Validación de entregables", description: "Verifica y certifica el cumplimiento de los requisitos, tanto de los proveedores como de los ejecutores internos.", icon: <FaCheckCircle /> },
  //   { title: "Métricas y reportes", description: "Generación de reportes de desempeño y cumplimiento.", icon: <FaChartLine /> },
  //   { title: "Alertas", description: "Envía alertas a los usuarios y proveedores para que sepan lo que tiene pendiente.", icon: <FaUsers /> },
  //   { title: "Perfil y configuración", description: "Gestiona tu cuenta y preferencias definiendo usuarios, roles y permisos, así como definir a tus proveedores.", icon: <FaUserCog /> }
  // ];
  //console.log('FormPage themeClass',session?.user);
  //className={`relative p-6 rounded-lg shadow-lg max-w-full mx-auto mt-8 ${themeClass}`}
  return (
    <div className={`p-6 dark`}>
    <h1 className="text-4xl font-bold mb-4">Bienvenido a la Plataforma</h1>
    <p className="text-lg mb-6">
      Hola <strong>{userName}</strong>.     
    </p>
   <p className="text-lm mt-1 mb-3">Estas son las herramientas para que puedas gestionar tu condominio: </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      {cards.map((option, index) => {
        const Icon = Fa[option.icon as keyof typeof Fa];
         return (
          <div key={index} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition">
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