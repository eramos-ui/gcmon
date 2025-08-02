//api/movimientos/getMovimientosPeriodo
/* Se utiliza en el zoom de consulta de movimientos entre fechas*/
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { CarteraGasto } from '@/models/CarteraGasto';
import { User } from '@/models/User';
import {monthFullMap} from '@/utils/monthMap';  

const claseMovimientoMap = {
    GASTO_EMERGENCIA: [99],
    GASTO_NORMAL: Array.from({ length: 98 }, (_, i) => i + 1), // 1 al 98
    GASTO_TODOS: Array.from({ length: 99 }, (_, i) => i + 1),
  };


  export async function getMovimientosPeriodo(
    email: string,
    fechaInicio: Date,
    fechaFin: Date,
    tipoFondo: string,  
    // idCasa:string  
  ) 
  {  
    console.log('en getMovimientosPeriodo',email, fechaInicio, fechaFin, tipoFondo);
    const claseMovimiento =  'GASTO_'+tipoFondo;
    const clasesGastoPermitidas = claseMovimientoMap[claseMovimiento as keyof typeof claseMovimientoMap] || [];
    // Paso 1: obtener organización del usuario
    const usuario = await User.findOne({ email,vigente: true });
    const idOrganizacion = usuario?.idOrganizacion;
    const clasesIngresoPermitidas= tipoFondo === 'NORMAL' ? [1000] : [1001];
    const fechaInicioDate = new Date(fechaInicio?.toString() || '');
    const fechaFinDate = new Date(fechaFin?.toString() || '');
    const ingresos = await CarteraIngreso.aggregate([
    {
      $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" },
        // mesPago: "$mesPago"
      }
    },
    {
      $match: {
        tipoDocumento: 'INGRESO',
        entradaSalida: 'S',
        claseMovimiento: { $in: clasesIngresoPermitidas },
        fechaDate: { $gte: fechaInicio, $lte: fechaFin },      
      }
    },
    {
      $lookup: {
        from: "familia",
        let: { idCasa: "$idCasa", mesPago: "$mesPago" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$idCasa", "$$idCasa"] },
                  { $lte: ["$mesInicio", "$$mesPago"] },
                  { $gte: ["$mesTermino", "$$mesPago"] }
                ]
              }
            }
          }
        ],
        as: "familia"
      }
    },
    { $unwind: "$familia" },
    {
      $lookup: {
        from: "casa",
        localField: "idCasa",
        foreignField: "idCasa",
        as: "casa"
      }
    },
    { $unwind: "$casa" },
    {
      $group: {
        _id: {
          fechaDocumento: "$fechaDocumento",
          idCasa: "$idCasa",
          mesPago:"$mesPago",
        },
        comentario: { $first: { $concat: ["Casa ", { $toString: "$casa.codigoCasa" }, ", ", "$familia.familia"] } },
        fechaDocumento: { $first: "$fechaDocumento" },
        ingreso: { $sum: "$monto" },    
        salida: { $sum: 0 },
        
      }
    },  
    { $sort: { "_id.fechaDocumento": 1 } }
  ]);
  const ing= ingresos.map((r) => {
    const fecha=r.fechaDocumento.split('T')[0];
    const [year, month,day] =fecha.split("-") || [];  
    const mes=monthFullMap[Number(month)];
    const mesAñoPago=r._id.mesPago;
    const añoPagoX=Math.floor(mesAñoPago/100);
    const mesPagoX=Math.floor(mesAñoPago-añoPagoX*100);
  
    const mesQuePaga= monthFullMap[mesPagoX]+' '+ String(añoPagoX);
    // console.log( Math.floor(mesAñoPago/100) ,mesPagoX)
    // const mesPagox=Math.floor(mesAñoPago);
    // const añoPagox=mesAñoPago+mesPagox*100
    // console.log('r',mesPagox,añoPagox)
    return {
      fechaDocumento:fecha,
      comentario: r.comentario,
      mesPago:mesQuePaga,
      ingreso:r.ingreso,
      salida:0,
      tipoFondo:'Ingreso '+ tipoFondo,
      idCasa:r._id.idCasa
    }
    }
  );
// console.log('ingreso',ingresos.length,ing);
// return {ing}
  const gastos = await CarteraGasto.aggregate([
    {
      $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
      }
    },
    {
      $match: {
        claseMovimiento: { $in: clasesGastoPermitidas },
        tipoDocumento: 'GASTO',
        entradaSalida: 'E',
        fechaDate: { $gte: fechaInicio, $lte: fechaFin }
      }
    },
    {
      $lookup: {
        from: "docGasto",
        let: { tipo: "$tipoDocumento", nro: "$nroDocumento" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$tipoDocumento", "$$tipo"] },
                  { $eq: ["$nroDocumento", "$$nro"] }
                ]
              }
            }
          }
        ],
        as: "doc"
      }
    },
    { $unwind: "$doc" },
    {
      $lookup: {
        from: "claseMovimiento",
        localField: "claseMovimiento",
        foreignField: "idClaseMovimiento",
        as: "clase"
      }
    },
    { $unwind: "$clase" },
    {
      $addFields: {
        descripcion: {
          $cond: [
            { $in: ["$claseMovimiento", [99]] },
            "$doc.comentario",
            "$clase.descripcion"
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          fechaDocumento: "$fechaDocumento",
          comentario: "$descripcion"
        },
        comentario: { $first: "$descripcion" },
        fechaDocumento: { $first: "$fechaDocumento" },
        ingreso: { $sum: 0 },
        salida: { $sum: "$monto" }
      }
    },
    { $sort: { "_id.fechaDocumento": 1 } }
  ]);
  // console.log('gastos',gastos.length,gastos[0],gastos[1]);
  
  const gast= gastos.map((r) => {
    console.log('r.fechaDocumento',r.fechaDocumento,typeof r.fechaDocumento,r)
    const fecha=r.fechaDocumento.split('T')[0];
    const [year, month,day] =fecha.split("-") || [];  
    const mes=monthFullMap[Number(month)];;
    //console.log('r.fechaDocumento',r.fechaDocumento,typeof(r.fechaDocumento),fecha,year,month, day, mes)
    return {
      fechaDocumento:fecha,
      comentario: r.comentario,
      mesPago: day + ' de '+ mes,
      ingreso:0,
      salida:r.salida,
      tipoFondo:'Gasto' + tipoFondo,
      idCasa:0
    }
    }
  );
    return { ingresos: ing, gastos:gast};
}
