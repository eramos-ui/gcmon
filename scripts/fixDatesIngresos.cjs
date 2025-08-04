// fixDatesIngresos.cjs
/*
ts-node instalado si usas TypeScript: npm install --save-dev ts-node typescript @types/node
en package.js:    "fix-dates": "ts-node scripts/fixDatesIngresos.cjs"
ejecutar en console: npm run fix-dates
*/
const mongoose = require('mongoose');
import dotenv from 'dotenv';
// import { CarteraIngreso } from './models/CarteraIngreso.ts';
const uri =  "mongodb+srv://jonnyheiss:qoynVk4Vn430yEd9@clustergc.4g4jumk.mongodb.net/GastosComunes?retryWrites=true&w=majority"; // ⚠️ Cambia por tu URI real
console.log('uri',uri)
// const uri="mongodb://localhost:27017/GastosComunes"; 
const carteraIngresoSchema = new mongoose.Schema({
  nroMovimiento: Number,
  fechaMovimiento: mongoose.Schema.Types.Mixed, // Mixed para que acepte string o date
  fechaDocumento: mongoose.Schema.Types.Mixed,
  tipoDocumento: String,
  nroDocumento: Number,
  tipoDocumentoRef: String,
  nroDocumentoRef: Number,
  idCasa: Number,
  mesPago: Number,
  claseMovimiento: Number,
  entradaSalida: String,
  monto: Number
});

 const CarteraIngreso = mongoose.model('CarteraIngreso', carteraIngresoSchema, 'carteraIngreso');

async function main() {
  await mongoose.connect(uri);
  console.log("✅ Conectado a MongoDB");

  const docs = await CarteraIngreso.find({
    $or: [
      { fechaMovimiento: { $type: "string" } },
      { fechaDocumento: { $type: "string" } }
    ]
  });

  console.log(`🔎 Documentos a actualizar: ${docs.length}`);

  for (const doc of docs) {
    let updated = false;

    if (typeof doc.fechaMovimiento === 'string') {
      const parsed = new Date(doc.fechaMovimiento);
      if (!isNaN(parsed.getTime())) {
        doc.fechaMovimiento = parsed;
        updated = true;
      }
    }

    if (typeof doc.fechaDocumento === 'string') {
      const parsed = new Date(doc.fechaDocumento);
      if (!isNaN(parsed.getTime())) {
        doc.fechaDocumento = parsed;
        updated = true;
      }
    }

    if (updated) {
      await doc.save();
    }
  }

  console.log("✅ Conversión completada.");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("❌ Error:", err);
});
