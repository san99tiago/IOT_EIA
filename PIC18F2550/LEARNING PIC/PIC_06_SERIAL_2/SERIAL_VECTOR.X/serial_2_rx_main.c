//CODIGO PARA RECIBIR PALABRA COMPLETA POR COMUNICACION SERIAL DESDE OTRO PIC
//Author: Santiago Garcia Arango , Marzo 2020, PIC18F2550

//Se incluye libreria de "C" y archivo header con bits de configuracion
#include <xc.h>
#include "config.h"

//Librerias utiles para la correcta comunicacion serial
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

//Se define la frecuencia del crystal externo (en este caso 16MHz)
#define _XTAL_FREQ 16000000

//Se crean variables necesarias para correcto funcionamiento 
int index =0;  //Esta encargada de llevar el index del buffer (recepcion serial)
int indexmax=30;  //Maximo de numeros de caracteres deseados
char buffer[100];  //Variable buffer que termina siendo vector de caracteres
int i =0;
char palabra[100];  //Se encarga de crear el vector de caracteres recibido(en total)

void main(void) {
    //----------INICIALIZAMOS CLK EXTERNO Y PINES "AN" COMO DIGITALES-----------
    //Se indica CLK del sistema como "primary oscilator" (osea externo: Crystal)
    OSCCONbits.SCS = 0b00;   
    //Todos los registros de AN0,AN1,AN2...AN12 activados como digitales
    ADCON1 = 0b1111;
  
    //------=--------PINES PARA SALIDAS INDICADORES DE LEDs----------------
    //Se indican pines A2, B3 y C2 como salidas (0 es output)
    TRISAbits.RA2 = 0;  //Sirve como Indicador de recepcion palabra "SANTIAGO"
    TRISBbits.RB3 = 0;  //Sirve como Indicador de recepcion palabra "MONICA"
    TRISCbits.RC2 = 0;  //Sirve como Indicador de recepcion caracter '\n'
    
    //Se inicializan pines A2, B3 y C2 en ON y OFF (respectivamente) al inicio
    LATAbits.LA2 = 0;
    LATBbits.LB3 = 0;
    LATCbits.LC2 = 0;

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
  
    while (1){

        //-----CICLO PRINCIPAL DE RECEPCION DE PALABRAS RESPECTIVAS-------------
        //En caso de que palabra sea "SANTIAGO", se cambia estado de pin A2
        if (strcmp (palabra,"SANTIAGO") == 0 ){
            //Cambiamos estado de los LEDs de salida para ver recepcion
            LATAbits.LA2 = !LATAbits.LA2;
            __delay_ms(50);
            
            //Reseteamos palabra (ya cumplio el objetivo de identificarla)
            for(i=0 ; i<= indexmax ; ++i){
                palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
            } 
        }
        //En caso de que palabra sea "MONICA", se cambia estado de pin C2
        else if (strcmp (palabra,"MONICA") == 0){
            //Cambiamos estado de los LEDs de salida para ver recepcion
            LATCbits.LC2 = !LATCbits.LC2;
            __delay_ms(50);
            
            //Reseteamos palabra (ya cumplio el objetivo de identificarla)
            for(i=0 ; i<= indexmax ; ++i){
                palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
            }          
        }
    
    } 
  return;
}

//DEFINIMOS LA FUNCION ASOCIADA A LAS INTERRUPCIONES (Recepcion Serial)
  void __interrupt() isr(){
      //si se levanta bandera de interrupcion asociada a Serial receptor
      if(PIR1bits.RCIF){
        //Se leen los 8bits recibidos (estan en registro RCREG, ver datasheet)
        char recibido = RCREG;
        
        //Se verfica que NO sean caracteres indeseados como '\n' o '\0'
        if(recibido != '\n' && recibido != '\0'){
            buffer[index]= recibido;  //Se asigna lo recibido al buffer[index]
            index = index + 1;  //Se aumenta el index del buffer (avanza)
            
            //Se resetea index si hay error y es muy grande (mayor a indexmax)
            if(index>=indexmax){
                index=0;  //Esto es preventivo (en caso de que )
            }   
        }
            
        //En caso de que se lea '\n', indica que se termino palabra total
        else if(recibido=='\n') {
            //Se indica con salida B3 que se ha llegado a caracter '\n'(final)
            LATBbits.LB3 = !LATBbits.LB3; //Indicador recepcion de '\n'
            
            //En buffer se asigna ultimo caracter como nulo (terminand palabra)
            buffer[index]='\0';  //Se asigna ultimo caracter nulo a buffer

            //Se asigna a "palabra" la concatenacion de todos los buffers...
            //...hasta que llegue al index actual (creamos vector "palabra")
            for (i=0;i<=index; ++i){
                palabra[i] = buffer[i];  //Se crea vector "palabra"
            }
            
            //Luego de guardar palabra, se resetea buffer completamente
            for(i=0;i<=index; ++i){
                buffer[i] = '\0';  //Se asigna nulo todo el vector buffer
            }
            
            index = 0;  //Finalmente, se resetea el index nuevamente
        }
            
        //Se baja bandera asociada a la interrupcion por recepcion serial RX
        PIR1bits.RCIF = 0;
      
    }
}
