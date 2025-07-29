//api/movimientos/getIngresosPeriodo
/* Se utiliza en el zoom de consulta de movimientos entre fechas de los ingresos*/
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { User } from '@/models/User';
import {monthFullMap} from '@/utils/monthMap';  

const claseMovimientoMap = {
    GASTO_EMERGENCIA: [99],
    GASTO_NORMAL: Array.from({ length: 98 }, (_, i) => i + 1), // 1 al 98
    GASTO_TODOS: Array.from({ length: 99 }, (_, i) => i + 1),
  };


  export async function getIngresosCasaPeriodo(
    email: string,
    fechaInicio: Date,
    fechaFin: Date,
    tipoFondo: string,  
    idCasa:number  
  ) 
  {  
    console.log('en getIngresoCasaPeriodo',email, fechaInicio, fechaFin, tipoFondo, idCasa);
    // const claseMovimiento =  'GASTO_'+tipoFondo;
    // const clasesGastoPermitidas = claseMovimientoMap[claseMovimiento as keyof typeof claseMovimientoMap] || [];
    // Paso 1: obtener organización del usuario
    const usuario = await User.findOne({ email,vigente: true });
    const idOrganizacion = usuario?.idOrganizacion;
    // const clasesIngresoPermitidas= tipoFondo === 'NORMAL' ? [1000] : [1001];
    // console.log('clasesIngresoPermitidas',clasesIngresoPermitidas)
    const fechaInicioDate = new Date(fechaInicio?.toString() || '');
    const fechaFinDate = new Date(fechaFin?.toString() || '');

    const matchStage: any = {
      tipoDocumento: 'INGRESO',
      entradaSalida: 'S',
      fechaDate: { $gte: fechaInicio, $lte: fechaFin },
    };
    
    if (idCasa && idCasa !== 0) {
      matchStage.idCasa = idCasa; // puede ser ObjectId o string, como lo tengas
    }

    const ingresos = await CarteraIngreso.aggregate([
    {
      $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" },
      }
    },
    {
      $match: matchStage
      // $match: {
      //   tipoDocumento: 'INGRESO',
      //   entradaSalida: 'S',
      //   fechaDate: { $gte: fechaInicio, $lte: fechaFin }, 
        // idCasa:idCasa,
       //}
       
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
          claseMovimiento:"$claseMovimiento"
        },
        comentario: { $first: { $concat: ["Casa ", { $toString: "$casa.codigoCasa" }, ", ", "$familia.familia"] } },
        fechaDocumento: { $first: "$fechaDocumento" },
        ingreso: { $sum: "$monto" },    
        salida: { $sum: 0 },
        
      }
    },  
    { $sort: { "_id.fechaDocumento": 1 } }
  ]);
  // console.log('ingresos en getIngresosPeriodo',ingresos)
  const ing= ingresos.map((r) => {
    const fecha=r.fechaDocumento.split('T')[0];
    const [year, month,day] =fecha.split("-") || [];  
    const mes=monthFullMap[Number(month)];
    const mesAñoPago=r._id.mesPago;
    const añoPagoX=Math.floor(mesAñoPago/100);
    const mesPagoX=Math.floor(mesAñoPago-añoPagoX*100);
  
    const mesQuePaga= monthFullMap[mesPagoX]+' '+ String(añoPagoX);
    const claseMov=(r._id.claseMovimiento === 1000)?'Ingreso normal':'Ingreso emergencia';
    return {
      fechaDocumento:fecha,
      comentario: r.comentario,
      mesPago:mesQuePaga,
      ingreso:r.ingreso,
      salida:0,
      tipoFondo:'Ingreso '+ tipoFondo,
      idCasa:r._id.idCasa,
      asignado: claseMov
    }
    }
  );
//  console.log('ingreso',ing)
 return { ingresos: ing};
}
