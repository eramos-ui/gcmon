"use client";

import { useEffect, useState } from "react";
import { useSession } from 'next-auth/react'; 
import { CustomButton, CustomDate, CustomSelect } from "@/components/controls";
import { CustomGrid } from "@/components/controls/CustomGrid";
import { ColumnConfigType, GridRowType } from "@/types/interfaces";
import { faFileCirclePlus, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';


  const columnsIngresos:ColumnConfigType<GridRowType>[] = [
    { key: "idCasa", label: "idCasa", captionPosition: "top",visible: false, editable: false, width: '50px', type: "number", options: undefined },
    { key: "fechaDocumento", label: "Fecha" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "Date", options: undefined}, 
    { key: "comentario", label: "Casa/Familia" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "string", options: undefined, sortable: true  }, 
    { key: "montoPagado", label: "Total ingreso" , captionPosition: "top", visible: true, editable: false, width: '120px', type: "number", options: undefined }, 
    { key: "asignado", label: "Asignado a" , captionPosition: "top", visible: true, editable: false, width: '180px', type: "string", options: undefined, sortable: true  }, 
    { key: "ingreso", label: "Monto asignado" , captionPosition: "top", visible: true, editable: false, width: '120px', type: "number", options: undefined }, 
    { key: "mesPago", label: "Mes paga" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "string", options: undefined, sortable: true}, 
    { key: "saldo", label: "Saldo" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined, hideOnSort: true, }, 

  ]
  const hoy = new Date();
  const formato = 'dd-MM-yyyy';
  const fechaFinDefault = format(hoy, formato);
  const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fechaInicioDefault = format(primerDiaMesAnterior, formato);
const IngresosPeriodoPage = () => {
    const router = useRouter();
    const [ loading, setLoading             ]                       = useState<boolean>(true);
    const [ rows, setRows ]                                         = useState<GridRowType[]>([]);
    const [ gridColumns, setGridColumns ]                           = useState<ColumnConfigType<GridRowType>[]>(columnsIngresos);
    const [ currentPage, setCurrentPage ]                           = useState<number>(0);
    const [ gridKey, setGridKey ]                                   = useState<number>(0);
    const [ familia, setFamilia ]                                   = useState<string>();
    const [ isModalOpen, setIsModalOpen ]                           = useState<boolean>(false);
    // const [ movs, setMovs ]                                         = useState<GridRowType[]>([]);
    const [ fechaInicio, setFechaInicio ]                           = useState<string | null>(fechaInicioDefault);
    const [ fechaFin, setFechaFin ]                                 = useState<string | null>(fechaFinDefault);
    const { data: session, status }                                 = useSession();
    const [ familias, setFamilias ]                                 = useState<{value:number;label:string}[]>();
    const [ familiasFull, setFamiliasFull ]                         = useState<{value:number;label:string;idCasa:number}[]>([]);

    const email=session?.user.email;
    const userName=session?.user.name;
    const fetchFamilias=async () =>{
      setLoading(true);
      const response = await fetch(`/api/forms/loadOptions/getFamiliasCasas`);
      const data = await response.json()
      if (!data) return;
      let familiaOptions=data.map( (x:any) => {return {value:x.value,label:x.label } })
      familiaOptions.push({value:0 ,label:'  TODAS LAS FAMILIAS'});
      setFamilias(familiaOptions);
      setFamiliasFull(data);
      setLoading(false);
    }
    useEffect(()=>{
       fetchFamilias();
    },[])
    const handleChangeFamilia= (value: string) => {
        setFamilia(value);
      }
    const fetchRows = async () => {

        if (!fechaInicio || !fechaFin || !familia) return
        setLoading(true);
        const [day, month, year] = fechaInicio?.split("-") || [];
        let mes=month.toString();
        let dia=day.toString();
        const fechaInicioFormatted = `${year}-${mes}-${dia}`;//dd-mm-yyyy
        const [day2, month2, year2] = fechaFin?.split("-") || [];
        let fechaFinFormatted = `${year2}-${month2}-${day2}`;//dd-mm-yyyy
        let movs:any[]=[];
        const informe='INGRESO';//sólo ingresos
        const familiaFull=familiasFull.find( fa => fa.value === Number(familia));
        const idCasa=familiaFull?.idCasa || 0;
        const response = await fetch(`/api/movimientos/ingresosCasaPeriodo?fechaInicio=${fechaInicioFormatted}&fechaFin=${fechaFinFormatted}&tipoFondo=${informe}&email=${email}&idCasa=${idCasa}`);
        const data = await response.json();
        //  console.log('data',data);
        movs=data.ingresos;
        const movimientos=movs.map((mov:any) => ({
            ...mov,
            fechaDocumento: new Date(mov.fechaDocumento).toLocaleDateString('es-ES')
        }));
        let saldo = 0;
        const movimientosConSaldo = movimientos.map((mov:any) => {
            let idCasa = 0;
            if (mov.ingreso > 0 && mov.salida === 0) idCasa =mov.idCasa; //para hacer un zoom en la grilla si idCasa>0  y es ingreso
            saldo += (mov.ingreso || 0) - (mov.salida || 0);
            return {
                idCasa,
                ...mov,
                saldo
            };
        });
        // console.log('en Movimiento por casa perido',movimientosConSaldo)
        setRows(movimientosConSaldo);
        setLoading(false);
        setIsModalOpen(true);
    }
    const handleGenerateInforme = () => {
      fetchRows();
    }
    if (loading) {
    < LoadingIndicator/>
    return;
    }
    // console.log('columnsIngresos',columnsIngresos)
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold">Ingresos entre fechas por Casa</h1>
        <div className="mb-1 flex items-start space-x-3">
          <div className="w-1/5" >
            <CustomDate width='300px' theme="light"  label='Fecha de Inicio' placeholder="Ingresa la fecha de inicio" captionPosition='top' 
                format="dd-MM-yyyy" required={true}  onChange={setFechaInicio} value={fechaInicio}
            />
          </div>
          <div className="w-1/5" >
            <CustomDate width='300px' theme="light"  label='Fecha de Término' captionPosition='top'
                format="dd-MM-yyyy"  required={true} value={fechaFin} onChange={setFechaFin} //  onChange={(e:any) =>{ handleChangeFechaFin(e)}} 
            />
          </div>
          <div className="w-1/5" >
            <CustomSelect width='300px' theme="light"  label='Familia' captionPosition='top'
                                  onChange={(e:any) =>{ handleChangeFamilia(e)}}
                                  options={familias || []} required={true} value={familia}
                                  placeholder="Seleccione familia"            />
          </div>
          <div className="w-1/5" >
           {familia &&  
           <CustomButton
              buttonStyle="primary" size="small" htmlType="button" label="Generar informe" style={{ marginLeft:15, marginTop:50 }}
              icon={<FontAwesomeIcon icon={faFileCirclePlus} size="lg" color="white" />} onClick={() => {handleGenerateInforme()}} 
            > 
          </CustomButton>
          }
          </div>
        
         </div>
        {rows.length>0 && (
           <div className="flex justify-center items-center w-full">
              <CustomGrid rowsToShow={100} rowHeight='25px' fontSize='14px' exportable={true} labelButtomActions={['','','','']} // actions={['zoom']} 
                borderVertical={true}  columns={gridColumns} data={rows} currentPage={currentPage} key={gridKey}
              />
           </div>
        )}
        <CustomButton
            buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:3, marginTop:15 }}
            icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
        > 
       </CustomButton>
      </div> 
    )
}
export default IngresosPeriodoPage;
