// suma4horasGastos.cjs
/*
instaslar ts-node con TypeScript: npm install --save-dev ts-node typescript @types/node
en package.json poner  "fix-dates": "ts-node scripts/suma4horasGastos.cjs"
en consola: npm run fix-dates 
*/
const mongoose = require('mongoose');

// import { CarteraIngreso } from './models/CarteraIngreso.ts';


(async () => {
    const uri =  "mongodb+srv://jonnyheiss:qoynVk4Vn430yEd9@clustergc.4g4jumk.mongodb.net/GastosComunes?retryWrites=true&w=majority"; // ⚠️ Cambia por tu URI real
    if (!uri) {
      console.error('Falta MONGODB_URI');
      process.exit(1);
    }
await mongoose.connect(uri);

const carteraGasto = mongoose.connection.collection('carteraGasto');
  // 4 horas en milisegundos
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

 // Solo corrige documentos que aún no han sido marcados como arreglados
const filter = { tzFixed: { $ne: true } }; 

  // Vista previa (cuántos serían afectados)
  const toFix = await carteraGasto.countDocuments(filter);
  console.log(`Documentos a corregir: ${toFix}`);
  if (toFix === 0) {
    console.log('No hay documentos pendientes. Saliendo.');
    process.exit(0);
  }

  // Migración: sumar 4 horas a ambas fechas
  const result = await carteraGasto.updateMany(
    filter,
    [
      {
        $set: {
          fechaMovimiento: { $add: ['$fechaMovimiento', FOUR_HOURS_MS] },
          fechaDocumento:  { $add: ['$fechaDocumento',  FOUR_HOURS_MS] },
          tzFixed: true,
          tzFixedAt: new Date()
        }
      }
    ]
  );

  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  await mongoose.disconnect();
  process.exit(0);
})();
