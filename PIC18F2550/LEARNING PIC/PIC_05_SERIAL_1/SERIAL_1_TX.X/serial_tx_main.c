//CODIGO TRANSMISOR DE SERIAL PARA ENVIAR LETRA 'A' y 'B' A OTRO PIC18F2550
//Author: Santiago Garcia Arango , Marzo 2020, PIC18F2550

//Libreria para compilar en "C" y traer header de bits de configuracion
#include <xc.h>
#include "config.h"  //No olvidar incluir estos

//Librerias para la comunicacion serial correcta
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

//Definimos frecuencia de crystal externo como 16 MHz
#define _XTAL_FREQ 16000000

void main(void) {
    //----------INICIALIZAMOS CLK EXTERNO Y PINES "AN" COMO DIGITALES-----------
    //Se indica CLK del sistema como "primary oscilator" (osea externo: Crystal)
    OSCCONbits.SCS = 0b00;   
    //Todos los registros de AN0,AN1,AN2...AN12 activados como digitales
    ADCON1 = 0b1111;
    
    //-----------CONFIGURACION PARA COMUNICACION SERIAL UART--------------------
    //Primero se activan RC6 y RC7 en "1" (ver instrucciones datasheet)
    TRISCbits.RC6 = 1; //Puerto TX como input para configuraciones
    TRISCbits.RC7 = 1; //Puerto RX como input para configuraciones

    //Configuraciones para el BAUD RATE
    BAUDCONbits.BRG16 =0; //8 bit Baud rate generator
    TXSTAbits.BRGH = 0; //Modo asincrono de baja velocidad de baud rate
    SPBRG = 24;  //Valor de "n" para activar Baud Rate de aprox 9600

    //Activamos el modo Asincrono de  transmision serial
    TXSTAbits.SYNC = 0; //Elegimios EUSART tipo Asincrono
    RCSTAbits.SPEN  = 1; //Activamos puerto serial

    //Habilitamos bit de transmision (ver datasheet)
    TXSTAbits.TXEN = 1; //Se actvia transmision (y por ende bandera TXIF)

    //Configuramos la recepcion correcta (con interrupciones)
    RCSTAbits.CREN = 1;//Habilitamos recepción por el puerto RX
    PIE1bits.RCIE = 1;//Habilitamos interrupcion asociada al serial (RCIE)
    
    //Como usaremos interrupciones, se deben habilitar globales y perifericas
    INTCONbits.PEIE = 1; //Habilito interrupcion periferica
    INTCONbits.GIE = 1;//Habilito interrupcion global

    //---------------FINALIZACION DE COMUNICACION SERIAL------------------------
    //Luego de efectuar configuraciones, se activan TX y RX segun su funcion
    TRISCbits.RC6 = 0; //Puerto TX como output
    TRISCbits.RC7 = 1; //Puerto RX como input
    //TRISCbits.RC6 =1; //Puerto TX
    //TRISCbits.RC7 =1; //Puerto RX
 
    while (1) {
        //Ahora transmitimos el caracter 'A' y el 'B' intercalados cada 1 seg
        TXREG = 'A';  //Registro TXREG para cargar dato de transmision
        __delay_ms(1000);
        TXREG = 'B';  //Registro TXREG para cargar dato de transmision
        __delay_ms(1000);
    }
  return;
}