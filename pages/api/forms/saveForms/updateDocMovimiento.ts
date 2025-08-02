// /pages/api/forms/saveForms/updateDocMovimiento.ts
/*
Aquí se graba el formulario dinámico de la coleción DocGasto y DocIngreso de la BD 
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { DocGasto } from '@/models/DocGasto';
import { DocIngreso } from '@/models/DocIngreso';
import { getSaldoCasaFondo } from '@/lib/movimientos/getSaldoCasaFondo';
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { getIngresosNoOcupados } from '@/lib/movimientos/getIngresosNoOcupados';
import { getSaldoGasto } from '@/lib/movimientos/getSaldoGasto';
import { CarteraGasto } from '@/models/CarteraGasto';
import { ClaseMovimiento } from '@/models/ClaseMovimiento';
import { User } from '@/models/User';
import { Familia } from '@/models/Familia';
// import { Casa } from '@/models/Casa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const año = hoy.getFullYear();
  const añoMesActual = año * 100 + mes;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  const { tipoDocumento, fechaDocumento, nroDocumento, idCasa, idUserModification, idClaseMovimiento, monto, comentario, idFamilia } = JSON.parse(req.body);
  const d=fechaDocumento.split('-')[0];
  const m=fechaDocumento.split('-')[1];
  const y=fechaDocumento.split('-')[2]; 
  const fechaDocumentoDate=new Date(y,m-1,d);
  const fechaDocumentoString=fechaDocumentoDate.toISOString();
  console.log('fechaDocumento',fechaDocumento, typeof fechaDocumento,fechaDocumentoDate,fechaDocumentoString)
  // return res.status(405).json({ message: 'Probando' });
  const familias = await Familia.find({ //devuelve un array? y findOne no anda
      mesInicio: { $lte: añoMesActual },
      mesTermino: { $gte: añoMesActual }
      }).lean();

  const familia=familias.find(familia => familia.idFamilia === idFamilia);
  // console.log('en updateDocMovimiento familia',familia);
  if (!tipoDocumento || (tipoDocumento !=="INGRESO" && tipoDocumento !=="GASTO") ) {
    return res.status(400).json({ error: "tipoDocumento debe ser 'GASTO' o 'INGRESO'" });
  }
  const docUsuario=await User.findOne({_id:idUserModification, vigente:true});
  const idUsuario=docUsuario?.idUser;
  // Seleccionar el modelo adecuado
  const Model = tipoDocumento === "GASTO" ? DocGasto : DocIngreso;
  // Buscar el nroDocumento más alto
  const ultimo = await Model.findOne({ tipoDocumento })
  .sort({ nroDocumento: -1 })
  .select("nroDocumento")
  .lean() as { nroDocumento?: number } | null;
  let nuevoNro = 1;

  if (ultimo && typeof ultimo.nroDocumento === "number") {
    nuevoNro = ultimo.nroDocumento + 1;
  }
  let nuevoNroCarteraGasto=1;
  const ultimoNroCarteraGasto = await CarteraGasto.findOne()
  .sort({nroMovimiento: -1})
  .select("nroMovimiento")
  .lean() as {nroMovimiento?: number} | null;
  if (ultimoNroCarteraGasto && typeof ultimoNroCarteraGasto.nroMovimiento === "number") {
    nuevoNroCarteraGasto = ultimoNroCarteraGasto.nroMovimiento + 1;
  }    
  let nuevoNroCarteraIngreso=1;
  const ultimoNroCarteraIngreso = await CarteraIngreso.findOne()
  .sort({nroMovimiento: -1})
  .select("nroMovimiento")
  .lean() as {nroMovimiento?: number} | null;
  if (ultimoNroCarteraIngreso && typeof ultimoNroCarteraIngreso.nroMovimiento === "number") {
    nuevoNroCarteraIngreso = ultimoNroCarteraIngreso.nroMovimiento + 1;
  }
  // console.log('nuevoNroCarteraIngreso',nuevoNroCarteraIngreso);

  const clases = await ClaseMovimiento.find({ idOrganizacion: 1 }); 
  // console.log('en updateDocMovimiento ultimo',ultimo,nuevoNro);



  let abono = Number(monto);
  // const fechaDocumento = nuevoDoc.createdAt;
  let nuevoDoc:any;
   
  if ( tipoDocumento === "INGRESO"){//en los documentos las fechas creteAt y updatedAt son string y en las carteras fechaMovimiento y fechaDocumento son Date
      if (!idFamilia ) {
        return res.status(400).json({ error: "idFamilia debe ser obligatorio para 'INGRESO'" });
      }
      const idFamiliaNumber=Number(idFamilia);
      const familia=familias.find(familia => familia.idFamilia === idFamiliaNumber);
      const idCasa=familia?familia.idCasa:0;
      
      const hoyString=hoy.toISOString();
      nuevoDoc = new Model({
        tipoDocumento,
        nroDocumento: nuevoNro,
        idCasa:familia?idCasa:0,
        idUsuario,
        monto:Number(monto),
        comentario:comentario||'',//es para los gastos
        claseMovimiento:0,//es para los gastos
        createAt:fechaDocumentoString,//fecha de movimiennto en Doc es string
        updatedAt:  hoyString,//fechaDocumento en Doc es string
      });
      await nuevoDoc.save();
      const docIngreso=await DocIngreso.findOne({ tipoDocumento: "INGRESO"})
      .sort({ nroDocumento: -1 })      
      .lean() as { nroDocumento?: number } | null;

      const claseMov:number=(idClaseMovimiento === 0)? undefined: idClaseMovimiento;
      const deudas = await getSaldoCasaFondo(idCasa, claseMov);
      for (const deuda of deudas) {
        const {
          tipoDocumentoRef,
          nroDocumentoRef,
          claseMovimiento: claseMovimientoDeuda,
          mesPago,
          saldo: montoDeuda,
        } = deuda;
  
        if (abono <= 0) break;
  
        const aPagar = abono >= montoDeuda ? montoDeuda : abono;
        abono -= aPagar;
        const newCarteraIngreso = {
          nroMovimiento: nuevoNroCarteraIngreso,
          tipoDocumento,
          nroDocumento: nuevoNro,
          tipoDocumentoRef,
          nroDocumentoRef,
          fechaDocumento:fechaDocumentoDate,//en cartera es Date
          fechaMovimiento: hoy,//en cartera es Date
          idCasa, 
          mesPago,
          claseMovimiento: claseMovimientoDeuda,
          entradaSalida: 'S',
          monto: aPagar,
         }
         nuevoNroCarteraIngreso=nuevoNroCarteraIngreso+1;
         await CarteraIngreso.create(newCarteraIngreso);
       }
    }

    if ( tipoDocumento === "GASTO"){
      const hoyString=hoy.toISOString();
      // // Paso 1: Insertar el documento GASTO
      nuevoDoc =new Model({
        createAt: fechaDocumentoString,// en Doc es string
        updatedAt: hoyString,// en Doc es string
        tipoDocumento,
        nroDocumento:nuevoNro,
        idCasa:0,
        idUsuario,
        claseMovimiento:Number(idClaseMovimiento),
        monto:Number(monto),
        comentario: comentario||'',
      });
      console.log('en updateDocMovimiento Egreso nuevoDoc',nuevoDoc);
      await nuevoDoc.save();
      // return res.status(200).json({ message: 'Documento creado e imputado correctamente'});
      // return;   

      const newCarteraGasto = {
        nroMovimiento: nuevoNroCarteraGasto,
        tipoDocumento,
        nroDocumento:nuevoNro,
        tipoDocumentoRef: tipoDocumento,
        nroDocumentoRef: nuevoNro,
        fechaDocumento: fechaDocumentoDate,//en cartera es Date
        fechaMovimiento: hoy,//en cartera es Date
        idCasa:0,
        claseMovimiento:Number(idClaseMovimiento),
        entradaSalida: 'E',
        monto:Number(monto),
      }
      console.log('newCarteraGasto registra Egreso',newCarteraGasto)
      // Insertar en CarteraGasto como ENTRADA
      await CarteraGasto.create(newCarteraGasto);
      nuevoNroCarteraGasto=nuevoNroCarteraGasto+1;
      // Paso 2: Obtener ingresos no ocupados
      let ingresos = await getIngresosNoOcupados(1); // idUsuario para obtener idOrganizacion
      // console.log('ingresos',ingresos.length);
      // console.log('ingresos[0]',ingresos[0]); 
      // console.log('ingresos[1]',ingresos[1]);
      // Paso 3: Obtener gastos pendientes (SaldoGasto) para compesar
      let gastosConSaldo = await getSaldoGasto(1); //los gastos que tienen saldo por pagar
      console.log('gastosConSaldo',gastosConSaldo.length,gastosConSaldo)
// return res.status(200).json({ message: 'Documento creado e imputado correctamente', nuevoDoc});

      // Paso 4: Compensación cruzada
       for (const ingreso of ingresos) {
        //  console.log('ingreso',ingreso);
         let saldoIngreso = ingreso.monto;
         const claseIngreso = ingreso.claseMovimiento;
         for (let i = 0; i < gastosConSaldo.length && saldoIngreso > 0; ) {
          const gasto = gastosConSaldo[i];
          const claseIngresoSalda=clases.find( (c:any )=> c.idClaseMovimiento===gasto.claseMovimiento);
          // console.log('claseIngresoSalda',claseIngresoSalda.ingresoSalda,claseIngreso)
          if (claseIngresoSalda.ingresoSalda !== claseIngreso) {
            i++;
            continue;
          }
          // console.log('gasto',gasto)
          const montoGasto = gasto.saldo;
          const abona = Math.min(saldoIngreso, montoGasto);
          if (abona > 0){
            const newCarteraGasto = {//se registra en la cartera si hay abono
              nroMovimiento: nuevoNroCarteraGasto,
              tipoDocumento:ingreso.tipoDocumento,
              nroDocumento:ingreso.nroDocumento,
              tipoDocumentoRef:tipoDocumento,
              nroDocumentoRef: nuevoNro,
              fechaDocumento: fechaDocumentoDate, //en cartera es Date
              fechaMovimiento: hoy,//en cartera es Date
              claseMovimiento: gasto.claseMovimiento,
              entradaSalida: 'S',
              idCasa:0,
              monto: abona,
            }
            console.log('newCarteraGasto compensa Gasto con Ingreso',newCarteraGasto, abona)
            await CarteraGasto.create(newCarteraGasto);
            saldoIngreso -= abona;
            gasto.saldo -= abona;
            nuevoNroCarteraGasto=nuevoNroCarteraGasto+1;
          }
          if (gasto.saldo <= 0) {
            gastosConSaldo.splice(i, 1);
          } else {
            i++;
          }
          //console.log('newCarteraGasto',i,saldoIngreso,gasto.saldo)
        }
      } //fin del for de ingresos
    }
    return res.status(200).json({ message: 'Documento creado e imputado correctamente', nuevoDoc});

}