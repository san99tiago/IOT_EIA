//CODIGO 1: SOLUCION PARCIAL 2019-01 
//CODIGO PARA CONTROL EXTERNO DE MAQUINA (DE FORMA REMOTA DESDE CENTRAL)
//Author: Santiago Garcia Arango , Abril 2020, PIC18F2550

//Libreria para compilar en "C" y traer header de bits de configuracion
#include <xc.h>
#include "config.h"  //No olvidar incluir estos (en otro archivo header)

//Librerias para la comunicacion serial correcta
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

//Definimos frecuencia de interna de 8MHz (para aplicar delays)
#define _XTAL_FREQ 8000000

//Funciones requeridas en el codigo principal
void putch(char data); //Permite enviar correctamente info por serial (ver abajo)
void resetear_palabra(); //Permite resetear palabra recibida por serial

//Se crean variables necesarias para correcto funcionamiento 
int index =0;  //Esta encargada de llevar el index del buffer (recepcion serial)
int indexmax=30;  //Maximo de numeros de caracteres deseados en buffer/palabra
char buffer[100];  //Variable buffer que termina siendo vector de caracteres
int i =0;
char palabra[100];  //Se encarga de crear el vector de caracteres recibido(en total)
int duty_cycle = 50; //Porcentaje de duty cycle de actuador final (para enviar a PWM)

void main(void) {
    //----------------CONFIGURACION OSCILADOR INTERNO DE 8MHz-----------------------------
    OSCCONbits.SCS = 0b11; //Se configura system clock como oscilador interno
    OSCCONbits.IRCF = 0b111; //Se asigna oscilador interno de 8MHz (sin postscaler)
    
    
    //----------------CONFIGURACION DE PINES AN1,AN2,AN3...,AN12--------------------------
    ADCON1bits.PCFG = 0b1111; //Se asignan todos los pines AN como digitales
    ADCON1bits.VCFG0 = 0b0; //Referencia de voltaje positiva como Vdd
    ADCON1bits.VCFG1 = 0b0; //Referencia de voltaje negativa como Vss
    
    
    //---------------CONFIGURACION DE SERIAL PARA TRANSMICION/RECEPCION-------------------
    TRISCbits.RC6 = 1; //Para configurar correctamente serial TX 
    TRISCbits.RC7 = 1; //Para configurar correctamente serial RX
    
    //Configuraciones para el BAUD RATE (en este caso aprox 9600)
    BAUDCONbits.BRG16 =0; //8 bit Baud rate generator
    TXSTAbits.BRGH = 0; //Modo asincrono de baja velocidad de baud rate
    SPBRG = 12;  //Valor de "n" para activar Baud Rate de aprox 9600 --> (9615)

    //Activamos el modo Asincrono de  transmision serial
    TXSTAbits.SYNC = 0; //Elegimios EUSART tipo Asincrono
    RCSTAbits.SPEN  = 1; //Activamos puerto serial

    //Habilitamos bit de transmision (ver datasheet)
    TXSTAbits.TXEN = 1; //Se activa transmision serial
    //NO activamos interrupciones por serial (con funcion "putch" y TRMT es suficiente)

    //Configuramos la recepcion correcta (con interrupciones)
    RCSTAbits.CREN = 1;//Habilitamos recepción por el puerto RX
    PIE1bits.RCIE = 1;//Habilitamos interrupcion asociada al serial (RCIE)
    
    //Como usaremos interrupciones, se deben habilitar globales y perifericas
    INTCONbits.PEIE = 1; //Habilito interrupcion periferica
    INTCONbits.GIE = 1;//Habilito interrupcion global

    //---------------------FINALIZACION DE COMUNICACION SERIAL----------------------------
    //Luego de efectuar configuraciones, se activan TX y RX segun su funcion
    TRISCbits.RC6 = 0; //Puerto TX como output
    TRISCbits.RC7 = 1; //Puerto RX como input
    
    
    //--------------------CONFIGURACION PINES DE ENTRADA Y SALIDA-------------------------
    TRISCbits.RC0 = 1; //Pin C0 como entrada 
    TRISCbits.RC1 = 1; //Pin C1 como entrada
    TRISCbits.RC2 = 1; //Pin C2 como entrada
    UCONbits.USBEN = 0; //Para desactivar modulo USB y obtener pines RC4 y RC5 como inputs
    //NOTA: el comando de arriba activa a RC4 y RC5 como entradas ambos (ver datasheet)
    //Abajo en codigo se ve funcionalidad de cada uno de estos 5 inputs

    
    while(1){
        //--------------CONDICIONES DE FUNCIONAMIENTO SEGUN BOTONES-----------------------
        //Con puerto RC0 se logra enviar comando de reanudar trabajo de maquina
        if (PORTCbits.RC0){
            printf("reanudar\n");
        }
        //Con puerto RC1 se logra enviar comando de leer temperatura en maquina
        if (PORTCbits.RC1){
            printf("leer_temp\n");
        }
        //Con puerto RC2 se logra enviar comando de cambiar duty cycle de PWM en maquina
        if (PORTCbits.RC2){
            printf( "ctrl:%d\n", duty_cycle);
        }
        //Con puerto RC4 se logra aumentar duty cycle en 1
        if (PORTCbits.RC4){
            if (duty_cycle < 100){
                duty_cycle = duty_cycle + 10;
            }
        }
        //Con puerto RC5 se logra disminuir duty cycle en 1
        if (PORTCbits.RC5){
            if (duty_cycle > 0){
                duty_cycle = duty_cycle - 10;
            }
        }
        __delay_ms(100);
        
    }
    return;
}

//FUNCION ENCARGADA DE ENVIAR CARACTERES UNO A UNO A TRAVES DE SERIAL (ver online)
void putch(char data){
    //En primer lugar, se verifica que NO se este mandando info (esperar a terminar)
    while(TXSTAbits.TRMT == 0); //Se hace Polling, hasta que TSR este vacio
    TXREG = data; //Se utiliza registro encargado de enviar caracteres por serial
}

//FUNCION ENCARGADA DE RECEPCION SERIAL DESDE MAQUINA INDUSTRIAL
void __interrupt() isr(){
    //si se levanta bandera de interrupcion asociada a Serial receptor
    if(PIR1bits.RCIF){
      //Se leen los 8bits recibidos (estan en registro RCREG, ver datasheet)
      char recibido = RCREG;

      //Se verfica que NO sean caracteres indeseados/finales como '\n' o '\0'
      if(recibido != '\n' && recibido != '\0'){
          buffer[index]= recibido;  //Se asigna lo recibido al buffer[index]
          index = index + 1;  //Se aumenta el index del buffer (avanza)

          //Se resetea index si hay error y es muy grande (mayor a indexmax)
          if(index >= indexmax){
              index = 0;  //Esto es preventivo (en caso de que )
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
 
//FUNCION ENCARGADA DE RESETEAR PALABRA RECIBIDA POR SERIAL (VOLVERLA TODA NULA)
void resetear_palabra( ){
    //Reseteamos palabra (ya cumplio el objetivo de identificarla)
    for(i=0 ; i<= indexmax ; ++i){
        palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
    }       
}
