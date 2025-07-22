"use client";
import {  useState,useContext } from 'react';
import { FormikContextType, useField, useFormikContext, FormikContext } from 'formik';
import DatePicker from 'react-datepicker';
import { format as formatDate, parse as parseDate } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale'; 
import 'react-datepicker/dist/react-datepicker.css';
import './CustomInput.css';

interface Props {
  label: string;
  captionPosition?: 'left' | 'top';
  name?: string;//viene sólo si es Formik
  onChange?: (date: string | null) => void;
  placeholder?: string;
  value?: string | Date | null; 
  textAlign?: 'left' | 'center' | 'right';  
  maxLength?: number;  
  id?: string; 
  theme: string;
  className?: string;
  format?: string;
  width:string; 
  disabled?:boolean;
  required?: boolean;
  visible?:boolean;
}
type Locales = 'es' | 'en' | 'fr';
const localeMapping = {  es,  en:enUS,  fr,};
const localeEnv = process.env.NEXT_PUBLIC_LOCALE as Locales || 'es';
const locale = localeMapping[localeEnv];

/**
 * 📌 Función que intenta parsear la fecha en ambos formatos: `dd/MM/yyyy` y `dd-MM-yyyy`
 */
const parseFlexibleDate = (value: string): Date | null => {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.trim();
  for (const fmt of ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd']) {
    const parsed = parseDate(cleaned, fmt, new Date());
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

// Componente principal que redirige según esté o no en Formik
export const CustomDate: React.FC<Props> = (props) => {
  if (props.name) {
    return <CustomDateWithFormik {...(props as Required<Props>)} />;
  } else {
    return <CustomDateStandalone {...props} />;
  }
};
// ✅ Con Formik
const CustomDateWithFormik: React.FC<Required<Props>> = ({
  name, label, theme, className = '', format = 'dd-MM-yyyy', disabled = false,
  captionPosition = 'top', required = false, visible = true, ...props
}) => {
  const [field, meta] = useField(name);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseFlexibleDate(field.value as string)
  );

  if (!visible) return null;

  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    const formatted = date ? formatDate(date, format) : '';
    field.onChange({ target: { name, value: formatted } });
  };

  return (
    <>
      <label
        htmlFor={props.id || name}
        style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}
        className={`custom-input-container ${theme} ${captionPosition} font-normal`}
      >
        {label} {required && '*'}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd-MM-yyyy"
        id={props.id || name}
        locale={locale}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 ${className}`}
        placeholderText={props.placeholder}
        autoComplete="off"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      {meta?.touched && meta?.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </>
  );
};

// ✅ Sin Formik
const CustomDateStandalone: React.FC<Props> = ({
  label, format = 'dd-MM-yyyy', theme, className = '', disabled = false,
  captionPosition = 'top', required = false, value, visible = true, onChange, name, ...props
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseFlexibleDate(value as string)
  );

  if (!visible) return null;

  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    const formatted = date ? formatDate(date, format) : null;
    onChange?.(formatted);
  };

  return (
    <>
      <label
        htmlFor={props.id || name}
        style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}
        className={`custom-input-container ${theme} ${captionPosition} font-normal`}
      >
        {label} {required && '*'}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd-MM-yyyy"
        id={props.id || name}
        locale={locale}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 ${className}`}
        placeholderText={props.placeholder}
        autoComplete="off"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </>
  );
};
