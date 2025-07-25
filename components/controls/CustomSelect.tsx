import React, { useState, useMemo, useContext } from 'react';
import { useField, FormikContext, FormikContextType, FormikValues } from 'formik';
// import { useSafeFormikContext  } from '@/hooks/useSafeFormikContext';
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
  visible?:boolean;
  // dependentValue?: any;//dato para select anidado
}

export const CustomSelect: React.FC<CustomSelectProps> = (props) => {
  if (props.name) {
    return <CustomSelectWithFormik {...(props as Required<CustomSelectProps>)} />;
  } else {
    return <CustomSelectStandalone {...props} />;
  }
};

const CustomSelectWithFormik: React.FC<Required<CustomSelectProps>> = ({
  label, name, options, placeholder = 'Seleccione una opción', style,
  width = '100%', required = false, theme = 'light', multiple = false,
  captionPosition = 'top', id, enabled = true, visible = true
}) => {
  const [field, meta] = useField(name);
  const selectedValue = useMemo(() => field.value ?? (multiple ? [] : ''), [field.value, multiple]);
  const [selectedInside, setSelectedInside] = useState<string | string[]>(selectedValue);

  if (!visible) return null;

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

    field.onChange({ target: { name, value: updatedValues } });
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedInside(newValue);
    field.onChange({ target: { name, value: newValue } });
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
          {...field}
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
          {options.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {meta?.touched && meta?.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

const CustomSelectStandalone: React.FC<CustomSelectProps> = ({
  label, name, options, value, onChange, placeholder = 'Seleccione una opción',
  style, width = '100%', required = false, theme = 'light', multiple = false,
  captionPosition = 'top', id, enabled = true, visible = true
}) => {
  const selectedValue = useMemo(() => value ?? (multiple ? [] : ''), [value, multiple]);
  const [selectedInside, setSelectedInside] = useState<string | string[]>(selectedValue);

  if (!visible) return null;

  const handleCheckboxChange = (checkedValue: string | number) => {
    let updatedValues: string[] = [];

    if (Array.isArray(selectedValue)) {
      if (selectedValue.includes(String(checkedValue))) {
        updatedValues = selectedValue.filter((val) => val !== String(checkedValue));
      } else {
        updatedValues = [...selectedValue, String(checkedValue)];
      }
    } else {
      updatedValues = [String(checkedValue)];
    }

    onChange?.(updatedValues);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedInside(newValue);
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
                checked={
                  Array.isArray(selectedValue) &&
                  selectedValue.includes(String(option.value))
                }
                onChange={() => handleCheckboxChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <select
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
          {options.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};



/*

export const CustomSelectANT: React.FC<CustomSelectProps> = ({
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

    </div>
  );
};
*/