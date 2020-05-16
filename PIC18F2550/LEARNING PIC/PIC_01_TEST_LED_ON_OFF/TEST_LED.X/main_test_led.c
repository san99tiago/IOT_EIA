//CODIGO BASICO PARA PRUEBA DE ACTIVAR UN LED 1 SEGUNDO INTERMITENTEMENTE

//Se incluye libreria para compilar correctamente
#include <xc.h>
#include "config.h"
//Se define la frecuencia del oscilador interno (8MHz) para los delays en codigo
#define _XTAL_FREQ 8000000

//Ciclo principal de funcionamiento
void main(void) {
    //----------------CONFIGURACION OSCILADOR INTERNO DE 8MHz-----------------------------
    OSCCONbits.SCS = 0b11; //Se configura system clock como oscilador interno
    OSCCONbits.IRCF = 0b111; //Se asigna oscilador interno de 8MHz (sin postscaler)
    
    //Se configura pin RC1 como salida y se inicializa en 0;
    TRISCbits.RC1 = 0;
    LATCbits.LC1 = 0;
    
    //Ciclo principal de funcionamiento continuo
    while(1){        
        //Se cambia estado actual de pin RC1 ON/OFF/ON/OFF/ON/OFF...
        LATCbits.LC1 = !LATCbits.LC1;
        //Agregamos delay de un segundo entre cada accion
        __delay_ms(1000);
    }
    return;
}