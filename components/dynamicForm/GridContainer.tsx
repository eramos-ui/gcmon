import React, { useState } from 'react';
import FormGridHeader from './FormGridHeader';

import GridRowComponent from './GridRowComponent';
import { FormConfigDFType, FormFieldDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';
import { TitleOverGridAndAddButton } from './TitleOverGridAndAddButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomButton } from "../controls/CustomButton";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface GridContainerProps {
  columns: GridColumnDFType[];
  rows: GridRowDFType[];
  rowToShow?: number;
  actions: ('add' | 'edit' | 'delete')[];
  onEdit: (index: number, editFormConfig?: FormConfigDFType) => void; // Pasamos el editFormConfig aquí
  onDelete: (index: number) => void;
  columnWidths?: string[];
  editFormConfig?: FormConfigDFType; // Agregar editFormConfig como prop
  label: string; //para los tooltips
  objectGrid?:string;//para el tooltips de los botones de actions
  handleAdd:() => void;//botón de agregar
  table:FormFieldDFType;
  // currentPage?: number;
}

const GridContainer: React.FC<GridContainerProps> = ({ columns, rows, rowToShow=5, actions, onEdit, 
    onDelete, columnWidths, editFormConfig, label, objectGrid, handleAdd, table }) => {
    const [ page, setPage ]     = useState(0);
    // console.log('en GridContainer editFormConfig', editFormConfig)
    const totalPages = Math.ceil(rows.length / rowToShow);
    const start = page * rowToShow;
    const end = start + rowToShow;
    const visibleRows = rows.slice(start, end);

    const handlePrev = () => {
      if (page > 0) setPage((prev) => prev - 1);
    };
  
    const handleNext = () => {
      if (page < totalPages - 1) setPage((prev) => prev + 1);
    };
    return (
     <>
      <TitleOverGridAndAddButton table={table} actions={actions} handleAdd={handleAdd} />
      <table className="min-w-full border-collapse">
        <FormGridHeader 
        columns={columns} columnWidths={columnWidths} actions={actions} label={label} 
        />
        <tbody>
        {visibleRows.map((row: GridRowDFType, rowIndex: number) => {
          // console.log('en GridContainer row', row)
          // console.log('en GridContainer columns', columns)
          return (
            <GridRowComponent
              key={start + rowIndex}
              row={row}
              columns={columns}
              columnWidths={columnWidths}
              actions={actions}
              onEdit={() => onEdit(start + rowIndex, editFormConfig)}
              onDelete={() => onDelete(start + rowIndex)}
              label={label}
              objectGrid={objectGrid}
            />
            // <GridRowComponent
            //   key={rowIndex}
            //   row={row}
            //   columns={columns}
            //   columnWidths={columnWidths}
            //   actions={actions}
            //   onEdit={() => onEdit(rowIndex, editFormConfig)} // Pasamos el editFormConfig en el evento de edición
            //   onDelete={() => onDelete(rowIndex)}
            //   label={label}
            //   objectGrid={objectGrid}//para el tooltips de los botones de actions
            // />
          )
        })}
        </tbody>
      </table> 
      <div className="flex justify-between items-center mt-2 px-4 text-sm text-gray-600">
        {/* <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button> */}
        <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Anterior"
                  onClick={handlePrev}
                  disabled={page === 0}
                  icon={<FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />} iconPosition='left'
        />
        <span>
          Página {page + 1} de {totalPages}
        </span>
        <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Siguiente"
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                icon={<FontAwesomeIcon icon={faArrowRight} size="lg" color="white" />} iconPosition='right'
              />
        {/* <button
          onClick={handleNext}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button> */}
      </div>


     </> 
  );
};

export default GridContainer;
