import { FormFieldDFType } from "@/types/interfaceDF"; 
import {   FormikErrors, FormikTouched  } from "formik";

import { CustomFileInput,  CustomInput, CustomSelect, CustomDate } from "@/components/controls";
      
import { useState } from "react";
import { LoadingIndicator } from "../general/LoadingIndicator";
import { FieldWrapper } from "./FieldWrapper";


interface Option {
  value: string | number;
  label: string;
}
interface FieldComponentDFProps {
  field: FormFieldDFType;
  values: any;//una fila de la grilla
  //handleChangeRow: (values: any | any[], fieldName: string, options: { value: string | number; label: string }[] | undefined) => void;
  setFieldValue: (fieldName: string, value: any) => void;
  touched: FormikTouched<any>;
  errors: FormikErrors<any>;
  theme: string;
}
/*Este componente distribuye, para cada columna de la grilla, los diferentes custom control del formulario dinámico 
y aplica lógica condicional a través de requiredIf
*/
export const FieldComponentDF: React.FC<FieldComponentDFProps> = ({ field, values, setFieldValue, errors, touched, theme }) => {
  //if (field.name === 'monto') console.log('en FieldComponentDF field',field);  
  const [ datosSelect, setDatosSelect ]         = useState<Option[]>(); // Estado local para las opciones
  const [ loading, setLoading ]                 = useState(false);

  const { type, label, name, visible, autoComplete, options, width,  apiOptions,  rows,
     dependentValue,requiredIf,...props} = field;
  // 👇 Visibilidad condicional   
  let isVisible = field.visible ?? true;
  let isRequired = field.validations?.some(v => v.type === "required");
  
  if (requiredIf && requiredIf.field) {//
    // console.log('en FieldComponentDF requiredIf',requiredIf.equal);
    const dependeDeValor = values[requiredIf.field];
    const coincide = String(dependeDeValor) === String(requiredIf.equal);
    isVisible = coincide;       // Si no coincide, oculta
    isRequired = coincide;      // Si coincide, lo hace requerido
  }
  if (!isVisible) return null;
  const commonProps = {
    label: field.label,
    name: field.name,
    value: values[field.name],
    autoComplete: field.autoComplete,
    onChange: (e: any) => {
      let x=e.target?.value ?? e;
      if (field.type === 'selectNumber')  x=Number(x); //convierte a number si es selectNumber
      setFieldValue(field.name, x);
    },
    error: touched[field.name] && errors[field.name] ,
    theme: 'light' as const,
    required: isRequired,
    placeholder: field.placeholder,
    style: { width: field.width ?? '100%' },
    width: field.width ?? '100%',
    formatNumber: field.formatNumber,
  };
  
   const errorMessage = errors[name] ? String(errors[name]) : undefined;// función para Obtener error de este campo
  //  const errorMessage = touched[field.name] && errors[field.name];// función para Obtener error de este campo
   const isTouched    = touched[name]; // función para Verificar si el campo ha sido tocado   

  const fieldName=field.name;
//   if (fieldName.includes('rut'))  console.log('en FieldComponentDF field',type,fieldName,errorMessage, isTouched );

    let staticOptions: { value: string | number; label: string }[] = options || [];
    // console.log('en FieldComponentDF staticOptions',staticOptions,field.apiOptions);
    if (field.apiOptions && field.apiOptions.length>0 && type  ==='selectNumber'){//resuelve las options cuando es sp 
  }
  if (loading) <LoadingIndicator />
 //if (field.name === 'rut') { console.log('en FieldComponentDF field',type,field,fieldName,errors?.rut, touched?.rut )};
  // console.log('en FieldComponentDF field',field,isVisible);
  //'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'color' | 'file' | 'RUT'
  // console.log('en FieldComponentDF field',field.type,field.name,field.label);
  switch (field.type) {//Eliminado <Field> para menor abstracción, el <Field es un wrapper de Formik que conecta AUTOMATICAMENTE: values, errors, touched...
    case 'input':
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="text" />
        </FieldWrapper>
      )
      // return <CustomInput {...commonProps} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="text" width={width}/>;
    case 'password':
        // return <CustomInput {...commonProps} type="password" width={width}/>;
        return(
          <FieldWrapper name={name}>
            <CustomInput {...commonProps} type="password" width={width}/>
          </FieldWrapper>
        )
    case 'select':
      return(
        <FieldWrapper name={name}>
          <CustomSelect {...commonProps} options={field.options || []} />
        </FieldWrapper>
      )
    case 'selectNumber':
      // return <CustomSelect {...commonProps} options={field.options || []} />;
      return(
        <FieldWrapper name={name}>
          <CustomSelect {...commonProps} options={field.options || []} />
        </FieldWrapper>
      )
    case 'text':
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="text" />
        </FieldWrapper>
      )
    case 'email':
      // return <CustomInput {...commonProps} type="email" />;
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} type="email" />
        </FieldWrapper>
      )
    case 'number':
      //  console.log('en FieldComponentDF number',commonProps,values[field.name]);
      //return <CustomInput {...commonProps}  type="number" />;
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps}  type="number" />
        </FieldWrapper>
      )
    case 'RUT':
      // return <CustomInput {...commonProps} type="RUT" />;
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} type="RUT" />
        </FieldWrapper>
      )
    case 'date':
      // return <CustomDate {...commonProps} />;
      return(
        <FieldWrapper name={name}>
          <CustomDate {...commonProps} />
        </FieldWrapper>
      )
    case 'file'://falta probar
       return <CustomFileInput {...commonProps} accept={".img, .jpg, .png, .pdf"} />;
    default:
      // return <CustomInput {...commonProps} type="text" />;
  }
};
/*
  switch (type) {
      case 'input':
      case 'text':
      case 'password':
      case 'email':
       // if (type==='email') console.log('en FieldComponentDF field',type,field,fieldName,errors[fieldName], touched[fieldName] );
        return (
            <div>
                <Field as={CustomInput}  type={(type ==='text' || type ==='input')?'text':type} width={width}
                  name={name}
                  label={label}
                  required={field.validations?.some(v => v.type === "required")}
                  error={isTouched && errorMessage ? errorMessage : undefined} // 🔹 Muestra el error solo si touched.rut === true (si se ingresó un valor)
                />
             </div> 
        )
      case 'select'://OJO no usa <Field>
        const dataSelect=(options && options.length>0 )?staticOptions : datosSelect;
        // console.log('en FieldComponentDF dataSelect',dataSelect); 
        return (
          dataSelect &&
          <CustomSelect label={label}  width= {field.width } options={dataSelect} name={name}
            value={values[fieldName]}
            onChange={(value)=>setFieldValue(fieldName,value)}
          />
        )
       case 'multiselect'://falta probar
        return (
            staticOptions &&
            <CustomSelect label={label}  width= {field.width } options={staticOptions} multiple={true} name={name}
                value={String(field?.value)} //es un array de string
                onChange={(values)=>setFieldValue(fieldName,values)}
            />)

      case 'number':
        return <CustomInput label={label}  width={width} type='number' visible={visible} 
        value={values[fieldName]}
        onChange={(e)=>setFieldValue(fieldName,e.target.value)}
        />
      case 'RUT':
        console.log('en FieldComponentDF field',type,errorMessage, isTouched );
        // return <CustomInput {...commonProps} type="RUT" />;
         return (
            <Field as={CustomInput} type='RUT' width={width} visible={visible}
              name={name}
              label={label}
              //required={field.validations?.some(v => v.type === "required")}
              required={isRequired}
              error={isTouched && errorMessage ? errorMessage : undefined} // 🔹 Muestra el error solo si touched.rut === true (si se ingresó un valor)
            />
         )
      case 'file'://probar OJO no usa <Field>
        return <CustomFileInput label={label} name={name}  width={width}  accept={".img, .jpg, .png"}  />;
      default:
        throw new Error(`El type: ${type} no es soportado`);
    }
    */
  //};