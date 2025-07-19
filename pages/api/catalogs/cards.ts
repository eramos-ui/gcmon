import type { NextApiRequest, NextApiResponse } from 'next';
import { Card } from '@/models/Card';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const menuCards = await Card.find({});
    res.status(200).json(menuCards);
  } catch (error) {
    console.error('❌ Error en API /cards:', error);
    res.status(500).json({ error: 'Error interno al cargar cards' });
  }
}