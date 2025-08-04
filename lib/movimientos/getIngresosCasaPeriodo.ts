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
    console.log('en lib/movimientos/getIngresoCasaPeriodo',email, fechaInicio, fechaFin, tipoFondo, idCasa);
    // const claseMovimiento =  'GASTO_'+tipoFondo;
    // const clasesGastoPermitidas = claseMovimientoMap[claseMovimiento as keyof typeof claseMovimientoMap] || [];
    // Paso 1: obtener organización del usuario
    const usuario = await User.findOne({ email,vigente: true });
    const idOrganizacion = usuario?.idOrganizacion;
    // const clasesIngresoPermitidas= tipoFondo === 'NORMAL' ? [1000] : [1001];
    // console.log('clasesIngresoPermitidas',clasesIngresoPermitidas)
    // const fechaInicioDate = new Date(fechaInicio?.toString() || '');
    // const fechaFinDate = new Date(fechaFin?.toString() || '');
     console.log('fechaInicio,fechaFin',fechaInicio,fechaFin)
    const matchStage: any = {
      tipoDocumento: 'INGRESO',      
      entradaSalida: 'S',
      // fechaDate: { $gte: fechaInicio, $lte: fechaFin },
      fechaDocumento: { $gte: fechaInicio, $lte: fechaFin }
    };
    if (idCasa && idCasa !== 0) {
      matchStage.idCasa = idCasa; // puede ser ObjectId o string, como lo tengas
    }
    console.log('antes de la query');
    // const query: any = {
    //   tipoDocumento: 'INGRESO',
    //   entradaSalida: 'S',
    //   fechaDocumento: { $gte: fechaInicio, $lte: fechaFin }
    // };
    // if (idCasa !== 0) {
    //   query.idCasa = idCasa;
    // }
  
    // const ingresos= await CarteraIngreso.find(query).sort({ fechaDocumento: 1 });
    const ingresos = await CarteraIngreso.aggregate([
    //{
      // $addFields: {
      //   fechaDate: {
      //     $dateToString: {
      //       format: "%Y-%m-%d",
      //       date: "$fechaDocumento"
      //     }
      //   }
        // fechaDate: {
        //   $dateFromString: {
        //     dateString: "$fechaDocumento",
        //     timezone: "America/Santiago"  // Usa la zona horaria correcta
        //   }
        // }
    //   }
    // },
    {
      $match: matchStage
    },
    {
      $lookup: {//join con docIngreso
        from: "docIngreso",
        localField: "nroDocumento",
        foreignField: "nroDocumento",
        as: "docInfo"
      }
    },
    { $unwind: { path: '$docInfo', preserveNullAndEmptyArrays: true } },
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
                },
                
    },
    { $unwind: { path: '$familia', preserveNullAndEmptyArrays: true } },
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
          idCasa: "$idCasa",
          mesPago: "$mesPago",
          claseMovimiento: "$claseMovimiento",
          nroDocumento: "$nroDocumento"
        },
        
        ingreso: { $sum: "$monto" },
        fechaDocumento: { $first: "$fechaDocumento" },
        //comentario: { $first: "$docInfo.comentario" },//sólo gastos tienen comentario
        comentario: { $first: { $concat: ["Casa ", { $toString: "$casa.codigoCasa" }, ", ", "$familia.familia"] } },
        familia: { $first: "$familia.familia" },
        montoPagado:{  $first: "$docInfo.monto"  }
      }
    },
     {
        $project: {
          _id: 0,
          idCasa: "$_id.idCasa",
          mesPago: "$_id.mesPago",
          claseMovimiento: "$_id.claseMovimiento",
          nroDocumento: "$_id.nroDocumento",
          fechaDocumento: 1,
          ingreso: 1,
          comentario: 1,
          familia: 1,
          montoPagado:1,
          
        }
      },
              // {
                //   $lookup: {
                  //     from: "casa",
                  //     localField: "idCasa",
                  //     foreignField: "idCasa",
                  //     as: "casa"
                  //   }
                  // },
                  // { $unwind: "$casa" },                 
                 
                  // {
                    //   $group: {
                      //     _id: {
                        //       fechaDocumento: "$fechaDate",
                        //       idCasa: "$idCasa",
                        //       mesPago:"$mesPago",
                        //       claseMovimiento:"$claseMovimiento",
                        //       nroDocumento:"$nroDocumento",
                        
                        //     },
                        //     comentario: { $first: { $concat: ["Casa ", { $toString: "$casa.codigoCasa" }, ", ", "$familia.familia"] } },
                        //     fechaDocumento: { $first: "$fechaDocumento" },
                        //     // fechaDocumento: {$first: "$fechaDate" },
                        //     ingreso: { $sum: "$monto" },    
                        //     salida: { $sum: 0 },
                        //     docIngreso: { $first: "$docIngreso" } 
                        //   }
                        // },  
                        //{ $sort: { fechaDocumento: 1 } }
                        { $sort: { fechaDocumento: 1 } }
                        
                      ]);
                          
    // if (ingresos.length <6) console.log('ingresos',ingresos);
    // console.log('ingresos en getIngresosPeriodo',ingresos.length)
      
      
      // const docIngreso=await DocIngreso.find({idCasa:`${idCasa}`});  console.log('docIngresos de la casa',docIngreso.length)
    const ing= ingresos.map((r) => {
      //  console.log('r',r)
      const fecha=r.fechaDocumento.toISOString().split('T')[0];
      const [year, month,day] =fecha.split("-") || [];  
      const mes=monthFullMap[Number(month)];
      const mesAñoPago=r.mesPago;
      const añoPagoX=Math.floor(mesAñoPago/100);
      const mesPagoX=Math.floor(mesAñoPago-añoPagoX*100);
      
      const mesQuePaga= monthFullMap[mesPagoX]+' '+ String(añoPagoX);
      const claseMov=(Number(r.claseMovimiento) === 1000)?'Ingreso normal':'Ingreso emergencia';
      console.log('claseMov',claseMov)
         return {
           fechaDocumento:fecha,
           comentario: r.comentario,
           numMesPago:r.mesPago,
           mesPago:mesQuePaga,
           montoPagado:r.montoPagado,   
           ingreso:r.ingreso,
           salida:0,
           tipoFondo:'Ingreso '+ tipoFondo,
  //         idCasa:r._id.idCasa,
           asignado: claseMov
         }
    }
  );
  // console.log('ing',ing)
  const ordenado = ing.sort((a, b) => 
    //new Date(a.fechaDocumento).getTime() - new Date(b.fechaDocumento).getTime() ||
    a.numMesPago - b.numMesPago
  );
  //  console.log('ingreso',ordenado)
 return { ingresos: ordenado};
// return {ingresos:ing}
}
