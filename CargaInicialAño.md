Se carga desde un excel (Csv) en Compass
El formato es el de carteraIngresos, esto es :

nroMovimiento:1
tipoDocumento:CUOTAMES
nroDocumento:2022
tipoDocumentoRef:CUOTAMES
nroDocumentoRef:2022
fechaDocumento:2022-01-01
fechaMovimiento:2022-05-11
idCasa:1
mesPago:202201
claseMovimiento:1000
entradaSalida:E
monto:59001
tzFixed:true
tzFixedAt:2025-08-08

nroMovimiento es el último +1 de la colección
nroDocumento y nroDocumentoRef es el año de la apertura
Asegurar el formato y que sea date en el excel para fechaDocumento, fechaMovimiento y tzFixedAt
tzFixed y tzFixedAt no creo que se usen fue empleado para actualizar en toda la tabla un date
mesPago es un int con AAAAMM de cada pago
claseMovimiento es 1000 para normal y 1001 para emergencia
Deben ir por cada casa (menos la que no paga) 12 meses* 2 claseMovimiento * nroCasas = 384
Monto es el que se devenga y todos son Entradas