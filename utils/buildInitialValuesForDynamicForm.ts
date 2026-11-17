//para construir los valores iniciales del formulario dinámico 
import { FormFieldDFType } from "@/types/interfaceDF";

export const buildInitialValues = (
  fields: FormFieldDFType[], //los campos editables que vienen de la row se definen en el json en editFields
  row: Record<string, any> = {}
): Record<string, any> => {
  const initial: Record<string, any> = {};
  initial['_id']=undefined;
  // console.log('en buildInitialValues row, fields', row, fields);
  fields.forEach(field => {
    const fieldName = field.name;

    // Usa el valor de `row` si existe (modo edición)
    if (row.hasOwnProperty(fieldName)) {
      initial[fieldName] = row[fieldName];//el valor viene en la row que se edita
    } else {
      // Si no, define un valor por defecto según tipo
      //primero reviso el caso de claseMovimiento con idClaseMovimiento de egresos que por error cambié el  fieldName
      if (row.tipoDocumento ==='GASTO' && fieldName ==='idClaseMovimiento' && row.hasOwnProperty('claseMovimiento') )
      {
        // console.log ('claseMovimiento', row);
        initial[fieldName] = row['claseMovimiento'];
        if (row['claseMovimiento'] !== 98 && row['claseMovimiento'] !== 99) row['descripcion']='';
      }
      else {
      
      switch (field.type) {
        case "number":
          // console.log('en buildInitialValues number',(!field.value || field.value === ''));
          initial[fieldName] = (!field.value || field.value === '') ? Number(0) : Number(field.value);
          // console.log('en buildInitialValues number',initial[fieldName]);
          break
        case "selectNumber":
          // console.log('********buildInitialValue field',field)
          initial[fieldName] = (field.value)?field.value:0;
          break;
        case "select":
        case "text":
        case "email":
        case "RUT":
        case "input":
        case "textarea":          
          initial[fieldName] = field.value;
          break;
        case "date":
          initial[fieldName] = null;
          break;
        // case "checkbox":
        //   initial[fieldName] = false;
        //   break;
        default:
          initial[fieldName] = "";
      }
    }
    }
  });
  // console.log('en buildInitialValues',initial);
  return initial;
};
