// pages/api/forms/loadGrid/getUltimosGastos.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { DocGasto } from '@/models/DocGasto';
// import { ClaseMovimiento } from '@/models/ClaseMovimiento';

const  formatDateToDDMMYYYY =(date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // los meses empiezan en 0
  const year = date.getFullYear();
  // console.log('en formatDateToDDMMYYYY', `${day}-${month}-${year}`)
  return `${day}-${month}-${year}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const docs = await DocGasto.aggregate([
      { $sort: { nroDocumento: -1 } },
      { $limit: 20 },
      {
        $addFields: {//grabado como string
          fechaDate: { $toDate: "$createAt" 
            
          }
        }
      },
      {
        $addFields: {
          nroGasto: { $toString: "$nroDocumento" }
        }
      },
    
      {
        $lookup: {
          from: 'claseMovimiento',
          localField: 'claseMovimiento',
          foreignField: 'idClaseMovimiento',
          as: 'clase'
        }
      },
      { $unwind: '$clase' }, // para obtener solo un objeto en vez de array
      {
        $project: {
          _id: 0,
          //key: 1,
          tipoDocumento: 1,
          nroGasto: 1,
          idCasa: 1,
          idUsuario: 1,
          mesPago: 1,
          monto: 1,
          comentario: 1, 
          fechaDate: 1,
          descripcion: "$clase.descripcion",
          claseMovimiento:1,
        }
      }
    ]);
    // console.log('en API getUltimosGasttos docs',docs)
    const formattedDocs = docs.map(doc => {
      const dateObj = new Date(doc.fechaDate); // 👈 Conversión necesaria
      // const descripcion=(doc.claseMovimiento ===98 && doc.comentario.trim().length >0  )?doc.comentario  :doc.descripcion;
      //const descripcion=doc.comentario;
      // console.log('en API getUltimosGastos doc',doc);
      // if(doc.nroGasto === '622') {console.log('el 622 ',doc); console.log('descripcion',descripcion)}
      return {
        ...doc,
        comentario:doc.comentario,
        nroDocumento: doc.nroGasto,
        fechaDocumento: formatDateToDDMMYYYY(dateObj),
      };
    });
   // console.log('en API getUltimosGastos formattedDocs',formattedDocs)
    // console.log( 'formattedDocs',formattedDocs)
    res.status(200).json(formattedDocs);
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
}
