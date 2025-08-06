// pages/api/movimientos/ingresosPeriodo.ts
/*
Para leer el aporte a los distintos fondos según mesPago (que no tienen los gastos)
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { getIngresosCasaPeriodo } from '@/lib/movimientos/getIngresosCasaPeriodo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { email, fechaInicio, fechaFin, tipoFondo, idCasa  } = req.query;
  console.log('en api/movimientos/ingresosCasaPeriodo',email, fechaInicio, fechaFin, tipoFondo,idCasa);
  if (!email || !fechaInicio  || !fechaFin || !tipoFondo || !idCasa) {
    return res.status(400).json({ error: 'Faltan parámetros: email, fechaInicio, fechaFin o tipoFondo' });
  }
  const idCasaNumber=Number(idCasa);
  try {
    const movimientos = await getIngresosCasaPeriodo(
      email.toString(),
      new Date(fechaInicio.toString()),
      new Date(fechaFin.toString()),
      tipoFondo.toString().toUpperCase(),
      idCasaNumber,
    );
  
    // console.log('movimientos en ingresosPeriodo',movimientos)
    res.status(200).json(movimientos);
  } catch (error) {
    //console.error('Error al obtener movimientos periodo:', error);
    res.status(500).json({ error:    'Error al obtener movimientos periodo' });
  }
}