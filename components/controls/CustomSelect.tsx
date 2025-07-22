import React, { useState, useMemo, useContext } from 'react';
import { useField, FormikContext, FormikContextType, FormikValues } from 'formik';
import { useSafeFormikContext  } from '@/hooks/useSafeFormikContext';
import './CustomSelect.css';

export interface CustomSelectProps {
  /**
    * caption to display
  */
  label: string;
  /**
    * value selected
  */  
  name?: string; // Nombre del campo en Formik
  /**
    * options
  */  
  options: { value: string | number ; label: string }[];
  /**
    * selected value without formik
  */  
  value?: string | string[]; // Puede ser string o array de strings si es múltiple es un array de los
  style?: React.CSSProperties;
  width?: string ; 
  onChange?: (value: string | string[]) => void; // Acepta string o array de strings

  placeholder?: string;
  required?: boolean;
  theme?: 'light' | 'dark';
  multiple?: boolean;
  captionPosition?: 'top' | 'left';
  id?: string;
  enabled?:boolean;
  // dependentValue?: any;//dato para select anidado
}


export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  name,
  options,
  value,
  style, 
  width='100%',
  onChange,
  placeholder = 'Seleccione una opción',
  required = false,
  theme = 'light',
  multiple = false,
  captionPosition = 'top',
  id,
  enabled=true,
  // dependentValue,
}) => {
  // Usamos el hook personalizado que siempre se ejecuta
  const formikContext = useContext(FormikContext as React.Context<FormikContextType<FormikValues> | null>);
  const isInsideFormik = !!formikContext && !!name;
  let field: any = { name: name || '', value: value ?? '', onChange: () => {}, onBlur: () => {} };
  let meta: any = { touched: false, error: undefined };
  
  if (isInsideFormik && name) {
    const [formikField, formikMeta] = useField(name);
    field = formikField;
    meta = formikMeta;
  }
  // const [formikField, formikMeta] = useField(name || '__dummy__');

  // const field = isInsideFormik
  // ? formikField
  // : { name: name || '', value: value, onChange: () => {}, onBlur: () => {} };

  // const meta = isInsideFormik
  // ? formikMeta
  // : { touched: false, error: undefined };
  // Estado local para el valor seleccionado
  const selectedValue = useMemo(() => {
    return isInsideFormik ? field.value : value ?? (multiple ? [] : '');
  }, [field.value, value, multiple, isInsideFormik]);

  const [selectedInside, setSelectedInside] = useState<string | string[]>(
    selectedValue || (multiple ? [] : '')
  );
    
  // Manejador para selección múltiple (checkboxes)
  const handleCheckboxChange = (checkedValue: string | number) => {
    let updatedValues: string[] = [];

    if (Array.isArray(selectedValue)) {
      if (selectedValue.includes(checkedValue)) {
        updatedValues = selectedValue.filter((val) => val !== checkedValue);
      } else {
        updatedValues = [...selectedValue, String(checkedValue)];
      }
    } else {
      updatedValues = [String(checkedValue)];
    }

    if (isInsideFormik && name) {
      formikContext?.setFieldValue(name, updatedValues);
    }
    onChange?.(updatedValues);
  };
  // Manejador de cambio para selección única
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedInside(newValue);
    if (isInsideFormik && name) {
      formikContext?.setFieldValue(name, newValue);
    }
    onChange?.(newValue);
  };
  return (
    <div className={`custom-select-container ${theme} ${captionPosition}`}>
      <label className={`custom-select-label ${captionPosition}`}>
        {label} {required && '*'}
      </label>
      {multiple ? (
        <div className="custom-multiple-select" style={{ ...style, width }}>
          {options.map((option) => (
            <label key={option.value} className="custom-option">
              <input
                type="checkbox"
                checked={Array.isArray(selectedValue) && selectedValue.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <select
          {...(name ? field : {})}
          id={id}
          name={name}
          value={selectedInside as string}
          onChange={handleSelectChange}
          className="custom-select"
          style={{ ...style, width }}
          disabled={!enabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {
          options.map((option) => {
            // console.log('en CustomSelect option',option,typeof (option.value));
           return(
            <option key={option.value} value={(typeof (option.value))==='number'? Number(option.value) : String(option.value)}>
              {option.label}
            </option>
           )
          })
          }
          
        </select>
      )}
      {/* {meta.error && <div className="error-message">{meta.error}</div>}  */}
      {/* Ahora lo maneja las props del FieldWrapper en FormikError */}
    </div>
  );
};
