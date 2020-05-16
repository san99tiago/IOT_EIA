//CODIGO MAQUINA MONITOREO EXTERNO (LA QUE CONTROLA REMOTAMENTE AL PACIENTE)
//SANTIAGO GARCIA ARANGO , ABRIL 2020, PIC18F2550, PARCIAL IOT

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
unsigned int leerADC(unsigned char canal); //Leer ADC general (segun canal)

//Se crean variables necesarias para correcto funcionamiento 
int index =0;  //Esta encargada de llevar el index del buffer (recepcion serial)
int indexmax=30;  //Maximo de numeros de caracteres deseados en buffer/palabra
char buffer[100];  //Variable buffer que termina siendo vector de caracteres
int i =0;
char palabra[100];  //Se encarga de crear el vector de caracteres recibido(en total)
int duty_cycle = 50; //Porcentaje de duty cycle de actuadores finales (para enviar a PWM)
int tiempo = 1; //Tiempo asociado a aplicacion medicina (para enviar en conjunto con PWM)

void main(void) {
    //----------------CONFIGURACION OSCILADOR INTERNO DE 8MHz-----------------------------
    OSCCONbits.SCS = 0b11; //Se configura system clock como oscilador interno
    OSCCONbits.IRCF = 0b111; //Se asigna oscilador interno de 8MHz (sin postscaler)
    
    
    //------------------CONFIGURAMOS ADC (en este caso AN0 y AN1)-------------------------
    TRISAbits.RA0 = 1; //Declaramos como input el pin AN0
    TRISAbits.RA1 = 1; //Declaramos como input el pin AN1
    ADCON1bits.VCFG1 = 0; //Definimos Vref GND=Vss (defecto "0" es "0V")
    ADCON1bits.VCFG0 = 0; //Definimos Vref  5V=Vdd (defecto "0" es "5V")
    ADCON1bits.PCFG = 0b1101; //Pin AN0 y AN1 analogos, de resto todos otros digitales
    ADCON0bits.CHS = 0; //Seleccionar canal AN0 (sin embargo abajo cambia segun funcion)
    ADCON2bits.ADCS = 0b1; //Tiempo adquisicion (Fosc/8)
    ADCON2bits.ADFM = 1; //Rigth justified (mas bits en ADRESH, ver datasheet )
    ADCON2bits.ACQT = 0b1; //Adquisiton time (2*Tad)
    ADCON0bits.ADON = 1; //Activamos A/D converter (enable)
    //En este caso NO activamos interrupciones, porque NO es necesario
    
    
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
    RCSTAbits.CREN = 1;//Habilitamos recepci�n por el puerto RX
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
            printf("Leer_Ox\n");
        }
        //Con puerto RC1 se logra enviar comando de leer temperatura en maquina
        if (PORTCbits.RC1){
            printf("Leer_Temp\n");
        }
        //Con puerto RC2 se debe enviar %duty_cycle y tiempo aplicacion bomba medicamento
        if (PORTCbits.RC2){
            //Se lee A/D converter tanto de pin AN0, como de AN1 (%duty y Tiempo)
            //... %duty = (20%/V)*(5V/1023)*VALOR_ADC_AN0 (expresion recta %duty) (0-100%)
            //... tiempo = (5V/1023)*VALOR_ADC_AN1 (expresion recta tiempo) (0-5segs)
            duty_cycle = 0.09775171065*leerADC(0); //Recta correcta conversion &dutycycle
            tiempo = 0.004882812*leerADC(1) + 1; //Recta correcta conversion tiempo
            printf( "Nivel_Med:%d%%&Tiempo:%d\n", duty_cycle , tiempo);
        }
        //Con puerto RC4 se debe enviar nuevo %de nivel de oxigeno (lo haremos con %duty)
        if (PORTCbits.RC4){
            //Se lee A/D converter de pin AN0 (%duty) para activar %de oxigeno a paciente
            //... %duty = (20%/V)*(5V/1023)*VALOR_ADC_AN0 (expresion recta %duty) (0-100%)
            duty_cycle = 0.09775171065*leerADC(0); //Recta correcta conversion &dutycycle
            printf( "Nivel_Ox:%d%%\n", duty_cycle);
        }
        __delay_ms(50);        
        
    }
    return;
}

//FUNCION ENCARGADA DE ENVIAR CARACTERES UNO A UNO A TRAVES DE SERIAL (ver online)
void putch(char data){
    //En primer lugar, se verifica que NO se este mandando info (esperar a terminar)
    while(TXSTAbits.TRMT == 0); //Se hace Polling, hasta que TSR este vacio
    TXREG = data; //Se utiliza registro encargado de enviar caracteres por serial
}

//FUNCION ENCARGADA DE INTERRUPCIONES POR RECEPCION SERIAL DESDE MAQUINA DEL PACIENTE
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

//FUNCION A/D CONVERTER (GENERICA), el canal es parametro desde main
//OJO: canal debe ser asociado a los pines AN0,AN1,AN2...,etc del PIC18F2550
//Por lo tanto se debe ser congruente con datasheet y pines activos analogos
unsigned int leerADC(unsigned char canal){
    ADCON0bits.CHS = canal;  //Seleccionar canal conversion (ej: 0 es AN0, 1 es AN1)
    ADCON0bits.GO = 1;  //Empezamos  conversion A/D
    while(ADCON0bits.GO);  //Esperamos a terminar ADC (polling, ver datasheet)
    return ADRES;  //Devolvemos INTEGER de resultado conversion A/D
}