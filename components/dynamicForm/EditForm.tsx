
"use client";
import React, { useRef } from 'react';
// import Modal from 'react-modal';

import { useSession } from 'next-auth/react';
// import { useFormikContext } from 'formik';
import {  Form, Formik, useFormikContext} from 'formik';
// import * as Yup from "yup";
import bcrypt from 'bcryptjs';
import _ from 'lodash';
//import { EditFormProps, FormConfigType, FormValues, } from '@/types/interfaces';

import {  FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';

// import { CustomAlert, FormRow } from '../controls';
// import { saveFormData } from '@/utils/apiHelpers';
// import { formatRut } from '@/utils/formatRut';
import CustomModal from '../general/CustomModal';
import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { CustomButton } from '../controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FieldComponentDF } from '../dynamicForm/FieldComponentDF';
import { useEffect, useMemo, useState } from 'react';
import { buildInitialValues } from '@/utils/buildInitialValuesForDynamicForm';
import { normalizeStringValues } from '@/utils/normalizeStringValue';

interface EditFormProps { // formulario dynamic
  formConfig: FormConfigDFType;
  fields: FormFieldDFType[];
  isOpen: boolean;
  onClose: () => void;
  row: FormValuesDFType;
  columns:GridColumnDFType[];
  isAdding?:boolean;
  apiSaveForm?:string;
  theme?:string;
  requirePassword?:boolean;
  formId:Number;
  globalStyles?: {
    light?: React.CSSProperties;
    dark?: React.CSSProperties;
  };
  width?:string;
  height?:string;
}
interface Option {
  value: string | number;
  label: string;
}
// const typeValues= ['number','string','rut','sin','boolean','money'];
//form para editar los datos de la grilla de la tabla que administra el Dynamic Form
export const EditForm: React.FC<EditFormProps> = ({
  formConfig,
  fields,
  isOpen,
  onClose,
  row,
  columns,
  isAdding,
  apiSaveForm,
  requirePassword=false,  
  formId,
  width,
  height,
  ...props
}) => {
  // console.log('en EditForm fields',fields);
    const formRef = useRef<HTMLFormElement | null>(null);
    // console.log('en EditForm row',row,row.idClaseMovimiento);
 
  // const rowInitial = buildInitialValues(fields, row);
  const rowInitial = useMemo(() => buildInitialValues(fields, row), [fields, row]);
  // console.log('en EditForm rowInitial',rowInitial);
  const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
  // console.log('en EditForm editFormSize',editFormSize);
  // console.log('en EditForm globalStyles',globalStyles);
  const { data: session }                                      = useSession();
  // const [ alertMessage, setAlertMessage ]                      = useState<string | null>(null);
  // const [ alertDuration, setAlertDuration ]                    = useState<number | null>(null);
  // const [ alertType, setAlertType ]                            = useState<'success' | 'error' | 'info'>('info');
  // console.log('EditForm requirePassword',requirePassword);
  const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';
  // const esNumero = (valor: string): boolean => { //establece si un string puede ser un numero
  //   if (valor.length === 0) return false;
  //   return !isNaN(Number(valor));
  // };
  const [loadedFields, setLoadedFields] = useState<FormFieldDFType[]>([]);
  useEffect(() => {//carga los select del formulario
    const loadOptionsForSelects = async () => {
      const updatedFields = await Promise.all(
        fields.map(async (field) => {//fields son los campos del formulario
          if ((field.type === 'selectNumber' || field.type ==='select' || field.type ==='multiselect') && field.apiOptions) {//los que tiene select o multiselect y apiOptions
            try {
                const res = await fetch(`/api/${field.apiOptions}`);
              const data = await res.json(); 
              let options:Option[]=[];
              if (data && data.length>0){
                  options=data.map((option:any) =>{
                  return {
                    value:(field.type === 'selectNumber')? Number(option.value) : String(option.value),
                    label: option.label
                  };
                });
              }
              return {
                ...field,
                options: options || [], // Asegúrate que devuelva { options: [...] }
              };
            } catch (error) {
              console.error(`Error cargando options para ${field.name}:`, error);
              return { ...field, options: [] };
            }
          }
          return field;
        })
      );
      setLoadedFields(updatedFields);
    };
  
    loadOptionsForSelects();
  }, [fields]); // ⚠️ Solo depende de los fields originales

  //grabar
  const grabar = async( values:any) =>{

  // const requirePassword=fields.find(field => field.type === 'password')?.requirePassword;
  const password = requirePassword ? await bcrypt.hash('password123', 10) : undefined;
  //console.log('grabar',fields,requirePassword,password);    return;
  const withRutFields=fields.filter(field => field.type === 'RUT');//field que tienen field type='RUT' para formatearlo estándar
    let updateValues:any=values;
    if (withRutFields && withRutFields.length > 0) {
        //actualizar rut de los values[field.name] cuando es un rut para que se graben ###.###.###-# , se hace 2 veces porque formatRut lo repite
      withRutFields.forEach((field:any) => {
        const valueRut=values[field.name];
        updateValues[field.name]=valueRut;
      });
    }   
    const changedItem=_.isEqual(updateValues,row); //compara si los valores de updateValues son iguales a los de row
    if (changedItem) {
      console.log('en FormPage grabar no hay cambios');
      return;
    } 
    // console.log('en EditForm grabar updateValues',updateValues);return;   
    const apiSaveForms=`/api/${apiSaveForm}`;
    const body={...updateValues, formId:formId,  idUserModification:session?.user.id};//siempre agrega el idUserModification
    console.log('en EditForm grabar body, apiSaveForms',body);
     try {
      const response = await fetch(`${apiSaveForms}`, {
        method: 'POST',    
        body: JSON.stringify(body),
      });
      const result=await response.json();
      console.log('en EditForm grabar response',response.ok, result);
      if (response.ok) {
        alert("Grabado exitosamente");
    //     // setTimeout(handleClose, 3000);
    //     onClose();
      } else {
        if (response.status === 400) {
          alert(`${result.error}`);     
        }else{
          console.log('en FormPage grabar response',result.error);
          alert(`${result.error}, favor comuníquelo al administrador del sistema.`);    
        }
      }
    } catch (error) {
      alert(`${error}, favor comuníquelo al administrador del sistema.`);
    }
  };
  const groupedFields = loadedFields.reduce((acc, field, width) => {//agrupa los campos por row que obligatortio
    if (!acc[field.row]) {
       acc[field.row] = [];
     }
    acc[field.row].push(field);
    return acc;
  }, {} as { [key: number]: FormFieldDFType[] });
  if (!isOpen) return null;  
  if (!row) <></>; 
  // console.log('en EditForm fields',fields);
  // const validationSchema = getValidationSchemaDynamicForm(fields);

  //  console.log("🧾 groupedFields:", groupedFields);
  return (
    <>     
    {/* {(() => { console.log('en jsx page ', row); return null; })()}  */}
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        width={width} height={height}
        title={isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
        position={'center'}
       >
        <Formik
         initialValues={rowInitial}
         validateOnBlur={true} //ejecuta la validación Yup cuando el usuario sale del campo
         validateOnChange={true}//para que se ejecute la validación cuando el usuario cambia el valor del campo y borre el error
         validate={async (values) => {
          // console.log("🔎 validate ejecutado con:", values);
          const schema = getValidationSchemaDynamicForm(fields);
          try {
            await schema.validate(values, { abortEarly: false });
            console.log("✅ Validación pasada sin errores");
            return {}; // sin errores
          } catch (err: any) {
            const errors: Record<string, string> = {};
            err.inner?.forEach((e: any) => {
              if (e.path) errors[e.path] = e.message;
            });
            console.log("❌ Errores detectados:", errors);
            return errors;
          }
         }}

        onSubmit={async (values, { setSubmitting, validateForm }) => {
          // console.log("🚀 onSubmit ejecutado con:", values);
          const correctedValues = normalizeStringValues(values, fields);
          const errors = await validateForm(correctedValues);
          // console.log('Errores de validación:',errors);
          if (Object.keys(errors).length === 0) {
            const _id = row._id;
            await grabar({ ...correctedValues, _id });
          } else {
            console.log('Submit bloqueado por errores:', errors);
          }
          setSubmitting(false);
        }}

         >
        {({ errors={}, touched={},values, setFieldValue, isSubmitting, isValid  }) => {// console.log("Formik errors,touched,isValid:", errors,touched,isValid);
          //useEffect(()=>{ console.log('en EditForm useEffect',values);},[values])
        if (isSubmitting) return <div>Guardando...</div>;
        return (
          <Form ref={formRef}>
            <div> 
              { Object.keys(groupedFields).map( item => {
                if (!item) return null;
                return (
                  <div className={`flex flex-wrap -mx-2 mb-4 w-[100%]`} key={ item }           
                  >
                    {groupedFields[Number(item)].map(field => {// console.log('en EditForm field',field);
                      const fullField = loadedFields.find(f => f.name === field.name) || field;
                    return ( 
                      <div  key={`${item}-${field.name}`} className={`px-2`}  >
                        <FieldComponentDF field={fullField} errors={errors} touched={touched} values={values} setFieldValue={setFieldValue} theme={theme}/>
                      </div> 
                      )
                    })}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-4 space-x-4 mr-10">
                 <CustomButton label='Cancelar y salir' onClick={onClose} buttonStyle='secondary'
                    size='small'  icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />}
                    tooltipContent='Abandonar la página sin salvar los cambios' tooltipPosition='top' 
                  />
                  <CustomButton label= {isSubmitting ? "Enviando..." : "Salvar cambios"}  buttonStyle='primary' formRef={formRef}
                    size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} htmlType='submit'
                    tooltipContent='Salvar los cambios y volver a la página anterior' tooltipPosition='left' style={{ marginRight:25, marginBottom:30 }} 
                  />
                  {/* <button
                    type="button"
                    onClick={() => {
                      console.log("🔧 Forzando submit manual");
                      // submitForm();
                    }}
                  >
                    Forzar envío
                  </button>  */}
              </div>   
          </Form>
        )
        }}
        </Formik>
      </CustomModal>
    </>
  );
};
