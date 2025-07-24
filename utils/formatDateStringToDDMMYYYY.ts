// utils/formatDateStringToDDMMYYYY.ts
/* transforma una fecha en formato string tipo 2025-07-04T00:00:00.000Z a formato dd/mm/yyyy, si no se le pasa el separador, se usa / */
export const formatStringDateToDDMMYYYY = (dateString:string, separador:string): string => {
    if (dateString === undefined || separador === undefined ) {
      return ''; // Valor por defecto en caso de valores inválidos
    }
    if (separador === undefined ) {
        separador='/';
    }
    const fecha=dateString.split("T")[0]; //le saca la hora
    const [year, month,day] =fecha.split("-") || [];
    return day+separador+month+separador+year;
  };