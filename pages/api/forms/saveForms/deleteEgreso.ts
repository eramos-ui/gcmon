import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { DocGasto } from '@/models/DocGasto';
import { CarteraGasto } from '@/models/CarteraGasto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  console.log('en deleteForm ',req.method);
  if (req.method !== 'DELETE' && req.method !='POST') {
      return res.status(405).json({ message: 'Método no permitido' });
    }
    console.log('body',req.body);
    const {row, idUserModification, actions } = JSON.parse(req.body);
    console.log('row, idUserModification, actions',row, idUserModification, actions);

    // const Model = row.tipoDocumento === "GASTO" ? DocGasto : DocIngreso;
    const tipoDocumento=row.tipoDocumento;
    const nroDocumento=row.nroDocumento;
    if (!nroDocumento ){
        return res.status(400).json({ error: "El nroDocumento es obligatorio" });
    }

    const docExistente=await Model.findOne({ tipoDocumento, nroDocumento:row.nroDocumento });
    if (!docExistente ){
        return res.status(400).json({ error: "El tipo nrodDocumento no fue encontrado" });
    }
    console.log('docExistente',docExistente);
    
    if (docExistente){
    await DocGasto.deleteOne({ tipoDocumento, nroDocumento });

    const carterasGastosExistentes=await CarteraGasto.find({ tipoDocumentoRef:tipoDocumento,nroDocumentoRef: nroDocumento });
    // console.log('carterasGastosExistentes a eliminar',carterasGastosExistentes);
    for (const cartera of carterasGastosExistentes){
        console.log('eliminando cartera gasto',cartera);
         await CarteraGasto.deleteOne({ nroMovimiento: cartera.nroMovimiento  });
    }
    } 


    // return res.status(400).json({ message: 'Aquí voy'});
    return res.status(200).json({ message: 'Documento eliminado correctamente', docExistente});

}