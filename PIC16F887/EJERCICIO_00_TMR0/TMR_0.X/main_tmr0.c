// CODIGO PARA ACTIVAR TIMER0 Y LOGRAR CAMBIAR ESTADO LED CADA 500ms (CON INTERRUPCIONES)
//Santiago Garcia Arango, 2020
//PIC16F887

//Importamos libreria compilador en C y bits de configuracion localizado en headers
#include <xc.h>
#include "config.h"

//Definimos variables globales para correcto funcionamiento
int contador_timer = 0; //Contador para lograr tiempo de 0.5s asociado a timer0


void main(void) {
    //---------------------CONFIGURACION DE OSCILADOR INTERNO DE 8MHz---------------------
    OSCCONbits.SCS = 1; //Seleccionamos oscilador interno como system clock
    OSCCONbits.IRCF = 0b111; //Elegimos frecuencia oscilador interno de 8MHz
    
    
    //--------------------CONFIGURACION DE PUERTOS DE SALIDA------------------------------
    ANSELH = 0; //Pines AN<13:8> Digitales I/O (evitar errores en pin RB0 que es AN12)
    TRISBbits.TRISB0 = 0; //pin 0 de puerto B como output
    PORTBbits.RB0 = 0; //Inicializamos pin RB0 como OFF
    
    
    //-------------------CONFIGURACION DE TIMER0------------------------------------------
    //... Configuramos timer0 para contar segun Fosc/4, prescaler 1:8.
    //... Tiempo total en contar es:  TIEMPO TOTAL =  (2^8 - 1)/(Fosc/4/8)  =  1.02ms
    OPTION_REGbits.T0CS = 0; //Clock source de internal instruction cycle (Fosc/4)
    OPTION_REGbits.PSA = 0; //Se asigna prescaler al timer0
    OPTION_REGbits.PS = 0b010; //Prescaler de 1:8
    //Como queremos llegar justo a 500ms, debemos tener contador capaz de lograr contar...
    //...este desbordamiento un total de 491 veces (1.02ms*491) = (500ms)
    //..esto lo haremos a traves de variable "contador_timer" y las interrupciones.
    TMR0 = 0; //Inicializamos valor de timer0 en 0;
    INTCONbits.T0IE = 1; //Habilitamos interrupcion timer0 por overflow
    INTCONbits.T0IF = 0; //Buena practica inicializar bandera interrupcion en 0
    
    
    //-----------------ACTIVAMOS INTERRUPCIONES GLOBALES Y PERIFERICAS--------------------
    INTCONbits.GIE = 1; //Habilitar interrupciones globales
    INTCONbits.PEIE =1; //Habilitar interrupciones perifericas
    
    
    while(1){
        
        //Ingresamos a condicional si se llega a 491 (osea equivalente a 500ms aprox)
        if (contador_timer == 491 ) {
            PORTBbits.RB0 = !PORTBbits.RB0; //Cambiamos estado actual de puerto RB0
            contador_timer = 0; //Reseteamos valor de contador para comenzar de nuevo
        }
          
    }
    return;
}

//FUNCION PARA PROCESAR INTERRUPCIONES
void __interrupt() isr() {
    //Validamos si interrupcion es generada por overflow del timer0
    if (INTCONbits.T0IF) {
        //Aumentamos contador que nos permite llegar justo a los 500ms
        contador_timer = contador_timer + 1;
        
        TMR0 = 0; //Reseteamos valor de timer0 para que comience a contar de nuevo
        
        INTCONbits.T0IF = 0; //Bajamos bandera de interrupcion de timer0 
    }
}
