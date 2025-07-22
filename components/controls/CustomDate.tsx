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


export const CustomDate: React.FC<Props> = ({ label, format = 'dd-MM-yyyy', theme, 
    className='',disabled=false,captionPosition='top', required=false, value, visible=true, name, onChange,  ...props }) => {
      // const formik: FormikContextType<any> | null = useFormikContext?.() || null;
      // let formik: FormikContextType<any> | undefined;
      // if ( name && typeof name === 'string' && name.length > 0) {
      //   try {
      //     formik = useFormikContext();
      //   } catch {
      //     formik = undefined;
      //   }
      // }
      //const hasFormik = formik && name;


      const formikContext = useContext(FormikContext as React.Context<FormikContextType<any> | null>);
      const isInsideFormik = !!formikContext && !!name;
      let field: any = { name: name || "", value: value };
      let meta: any = { touched: false, error: "" };
      
      if (isInsideFormik && name) {
        const [formikField, formikMeta] = useField(name);
        field = formikField;
        meta = formikMeta;
      }
      // const [formikField, formikMeta] = useField(name || "__dummy__");

      // const field = isInsideFormik
      // ? formikField
      // : { name: name || "", value: value };

      // const meta = isInsideFormik
      // ? formikMeta
      // : { touched: false, error: "" };

      // const [ field, meta ]                   = hasFormik ? useField(name!) : [{ name: name || '', value: value }, { touched: false, error: '' }];
      const [ selectedDate, setSelectedDate ] = useState<Date | null>(
        parseFlexibleDate((isInsideFormik ? field.value : value) as string)
      );

    if (!visible) return <></>;

    const handleChange = (date: Date | null) => {
      setSelectedDate(date);
      const formatted = date ? formatDate(date, format) : null;
      if (isInsideFormik && name) {
        formikContext?.setFieldValue(name, formatted || "");
      } else {
        onChange?.(formatted);
      }
    };

  return (//ojo que viene en el className el del date y no es adecuado para el label
    <>
      <label 
        htmlFor={props.id || name}
        style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}      
        className={`custom-input-container ${theme} ${captionPosition} font-normal`}
       >{label}  {required && '*'}</label>
      <DatePicker
        selected={selectedDate}
        required={required}
        onChange={handleChange}
        //dateFormat={format.toLowerCase().replace(/d/g, 'd').replace(/m/g, 'M').replace(/y/g, 'y')}
        dateFormat="dd-MM-yyyy" // 📌 Siempre muestra `dd-MM-yyyy`
        className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 ${className}`}
        placeholderText={props.placeholder}
        id={props.id || name}
        locale={locale}
        autoComplete="off" 
        showMonthDropdown
        showYearDropdown 
        dropdownMode="select"  
        disabled={disabled}
      />
      {isInsideFormik  && meta?.touched && meta?.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </>
  );
};