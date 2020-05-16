//CODIGO TRANSMISOR DE SERIAL PARA ENVIAR PALABRA A OTRO PIC18F2550
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

//Declaramos funciones que emplearemos en codigo (funcion al final)
void enviar_palabra (char palabra_a_enviar []);

//Ahora se crean las palabras a mandar a traves del serial
char palabra_1 [10] = "SANTIAGO\n";
char palabra_2 [10] = "MONICA\n";
int i = 0;  //Variable auxiliar para envio de palabras

void main(void) {
    //----------INICIALIZAMOS CLK EXTERNO Y PINES "AN" COMO DIGITALES-----------
    //Se indica CLK del sistema como "primary oscilator" (osea externo: Crystal)
    OSCCONbits.SCS = 0b00;   
    //Todos los registros de AN0,AN1,AN2...AN12 activados como digitales
    ADCON1 = 0b1111;
    
    //----------PINES PARA ENTRADAS DE BOTON (CAMBIAR PALABRA TX)---------------
    //Se indican pines A2, B3  como entradas (1 es input)
    TRISAbits.RA2 = 1; //Al activarse, se envia palabra_1 (osea "SANTIAGO")
    TRISBbits.RB3 = 1; //Al activarse, se envia palabra_2 (osea "MONICA")
    
    
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

    
    while (1) {
        //----------CODIGO PRINCIPAL ELECCION PALABRA A ENVIAR------------------

        //En caso de presionar pulsador asociado a RA2 (enviar palabra_1)
        if (PORTAbits.RA2){
            enviar_palabra( palabra_1 ); 
        }
        //En caso de presionar pulsador asociado a RA2 (enviar palabra_1)
        if (PORTBbits.RB3){
            enviar_palabra( palabra_2 ); 
        }
        __delay_ms(500);  //Espera de medio segundo entre cada transmision
        
    }
  return;
}

//FUNCION ENCARGADA DE ENVIAR PALABRA POR SERIAL (CARACTER POR CARACTER)
void enviar_palabra (char palabra_a_enviar []){
    //Se recorre caracter a caracter y se envian uno a uno
    //el ciclo recorre hasta 10, porque igual manda NULOS si NO hay caracter
    for (i=0 ; i< 10 ; i++){
        TXREG = palabra_a_enviar[i]; //Registro TXREG para cargar dato de transmision
        //Esperamos hasta que se vacie TSR, con ayuda de TRMT (indica estado TSR)
        while(TXSTAbits.TRMT == 0); //Se hace Polling, hasta que TSR este vacio
    }
}
