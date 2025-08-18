import React, { useEffect, useState } from 'react';
import { GridColumnDFType } from '@/types/interfaceDF';

interface GridHeaderProps {
  columns: GridColumnDFType[];
  columnWidths?: string[];
  actions: ('add' | 'edit' | 'delete' | 'zoom')[];
  label: string;
}

const FormGridHeader: React.FC<GridHeaderProps> = ({ columns, columnWidths = [], actions, label }) => {
  // console.log('en GridHeader', actions,label )
  const [ vaActions, setVaAction ]  = useState(false);
  useEffect(()=>{
    if (actions.length <=1 && actions[0]==='add') setVaAction(false) //el add no requiere columna
  },[])
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str; // Retorna el string tal cual si está vacío o es undefined
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  return (
    <thead>
      <tr>
        {columns?.map((column: GridColumnDFType, index: number) =>
          column.visible ? (
            <th
              key={index}
              className={`px-4 py-2 ${columnWidths ? columnWidths[index] || 'w-auto' : 'w-auto'} text-${column.textAlign || 'left'} border-b`}
            >
              {capitalizeFirstLetter((column.label)?column.label:column.name) }
            </th>
          ) : null
        )}
        {vaActions  && <th>Acciones</th>}
      </tr>
    </thead>
  );
};
export default FormGridHeader;
