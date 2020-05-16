//CODIGO 2: SOLUCION PARCIAL 2019-01 
//CODIGO PRINCIPAL MAQUINA INDUSTRIAL (LA ENCARGADA DEL CONTROL FINAL DIRECTO)
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
unsigned int leerADC(unsigned char canal);
void asignarPWM(unsigned int duty);

//Se crean variables globales necesarias para correcto funcionamiento 
int index = 0; //Esta encargada de llevar el index del buffer (recepcion serial)
int indexmax = 30; //Maximo de numeros de caracteres deseados en buffer/palabra
char buffer[100]; //Variable buffer que termina siendo vector de caracteres
int i = 0;
char palabra[100]; //Se encarga de crear el vector de caracteres recibido(en total)
int emergencia = 0; //Permite activar comunicado de emergencia y parar operaciones
int temperatura = 0; //Permite almacenar la temperatura actual obtenida de entrada (0-5V)
int duty_cycle = 0; //Permite cambiar el duty_cycle del PWM

void main(void) {
    //----------------CONFIGURACION OSCILADOR INTERNO DE 8MHz-----------------------------
    OSCCONbits.SCS = 0b11; //Se configura system clock como oscilador interno
    OSCCONbits.IRCF = 0b111; //Se asigna oscilador interno de 8MHz (sin postscaler)
    
    
    //------------------CONFIGURACION PIN EMERGENCIA (INTERRUPCION)-----------------------
    TRISBbits.RB0 = 1; //Pin B0 como input (para utilizarlo como interrupcion INT0)
    INTCONbits.INT0E = 1; //Se habilitan interrupciones externas para INT0
    INTCON2bits.INTEDG0 = 1; //Activar interrupcion por flanco de subida en INT0
    
    
    //------------------CONFIGURAMOS ADC (en este caso RA0/AN0)---------------------------
    TRISAbits.RA0 = 1; //Declaramos como input el pin AN0
    ADCON1bits.VCFG1 = 0; //Definimos Vref GND=Vss (defecto "0" es "0V")
    ADCON1bits.VCFG0 = 0; //Definimos Vref  5V=Vdd (defecto "0" es "5V")
    ADCON1bits.PCFG = 0b1110; //Pin AN0, de resto todos otros digitales
    ADCON0bits.CHS = 0; //Seleccionar canal AN0
    ADCON2bits.ADCS = 0b1; //Tiempo adquisicion (Fosc/8)-->(Tad = 1us)
    ADCON2bits.ADFM = 1; //Rigth justified (mas bits en ADRESH, ver datasheet )
    ADCON2bits.ACQT = 0b1; //Adquisiton time (2*Tad)... 2Tad = 2us > 1.75us
    ADCON0bits.ADON = 1; //Activamos A/D converter (enable)
    //En este caso NO activamos interrupciones, porque NO es necesario
    
    
    //-----------------------------CONFIGURACION DEL PWM----------------------------------
    //Realmente nos aprovecharemos del Timer2 para el PWM (ver datasheet)
    PR2 = 255;  //para especificar correctamente periodo del PWM
    asignarPWM(0);  //Se comienza PWM en duty cycle de 0
    TRISCbits.RC2 = 0; //RC2 como salida (que es pin asociado a CCP1, osea PWM)
    //A continuacion se utilizan registros del timer2 (Necesarios para PWM)
    T2CONbits.T2CKPS = 0b0; //Se configura Timer2 en prescaler 1 (no cambia)
    T2CONbits.TMR2ON = 1; //Encender el timer2
    CCP1CONbits.CCP1M = 0b1100; //CCP1 en modo PWM mode (ver datasheet)
    
    
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

    
    while(1){
        //--------------CONDICIONES DE FUNCIONAMIENTO PRINCIPAL---------------------------
        //En primer lugar, se debe garantizar que NO este activa la emergencia
        if (emergencia == 1){
            //Se debe parar el duty cycle del actuador a 0 (evitar accidentes)
            asignarPWM(0);
            //La unica forma de desactivar emergencia es si RX serial recibe "reanudar"
            if (strcmp (palabra,"reanudar") == 0 ){
                //Reseteamos palabra (ya cumplio el objetivo de identificarla)
                for(i=0 ; i<= indexmax ; ++i){
                    palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
                } 
                emergencia = 0; //Se quita la emergencia por comando principal
            }
            //En caso de recibir orden de algo EN EMERGENCIA, se debe ignorar
            if (strcmp (palabra,"leer_temp") == 0 || strncmp (palabra,"ctrl:",5) == 0){
                //Reseteamos palabra (ya cumplio el objetivo de identificarla)
                for(i=0 ; i<= indexmax ; ++i){
                    palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
                } 
                //En estado de emergencia, al recibir otros comandos, se debe enviar:
                printf( "emergencia\n" );
            }
        }
        
        //Si NO hay ninguna emergencia, se procede a funcionamiento normal
        if(emergencia == 0){
            //En caso de recibir orden de "leer_temp", se debe enviar "temp:x" por TX
            if (strcmp (palabra,"leer_temp") == 0 ){
                //Reseteamos palabra (ya cumplio el objetivo de identificarla)
                for(i=0 ; i<= indexmax ; ++i){
                    palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
                } 
                //Se lee A/D converter del pin AN0 (recordar que es de 10 bits)
                //... T = 41grados*(5V/1024)*VALOR_ADC - 55grados (expresion recta Temp)
                temperatura = 0.2001953*leerADC(0) - 55; //Recta correcta conversion
                printf( "temp:%d\n", temperatura);
            }
            
            //En caso de recibir orden de "ctrl:y", se debe cambiar duty cycle segun %
            if (strncmp (palabra,"ctrl:",5) == 0 ){                                
                //Se analiza cantidad de numeros de duty cycle (1,2 o 3)...
                //NOTA: al cambiar de STR a INT, se convierte en formato ASCII (cuidado)
                if (palabra[6] == '\0'){
                    //Si solamente es de un digito (convertir a INT y restar 48 por el...
                    //... formato del codigo ASCII, para que sea congruente)
                    duty_cycle = (int)( palabra[5]-48); 
                }
                else if (palabra[7] == '\0'){
                    //Si el duty es de dos digitos (no olvidar pasar de codigo ASCII)
                    duty_cycle =  (int)(palabra[5]-48)*10 + (int)(palabra[6]-48);
                }
                else if (palabra[8] == '\0'){
                    //Si el duty es de 3 digitos (no olvidar pasar de codigo ASCCI)
                    duty_cycle= (int)(palabra[5]-48)*100 + (int)(palabra[6]-48)*10 + (int)(palabra[7]-48);
                }
                //Se muestra porcentaje actual del duty cycle (en porcentaje)
                printf( "duty_cycle:%d\n",duty_cycle );
                
                //Se asigna valor al PWM segun el duty cycle recibido por serial...
                //Recordar que rango maximo es 4 veces valor asociado al PR2 (osea 255 +1)
                //... DUTY = (VALOR_EN_PORCENTAJE/100)*1023 -->Para generar correcto duty
                duty_cycle = duty_cycle*10.23; //Se obtiene valor congruente
                asignarPWM(  duty_cycle ); //Se asigna valor congruente del PWM
                
                //Reseteamos palabra (ya cumplio el objetivo de identificarla)
                for(i=0 ; i<= indexmax ; ++i){
                    palabra[i] = '\0';  //Se asigna nulo todo el vector palabra
                } 
            }
            __delay_ms(100); //Delay de funcionamiento SIN emergencia
        }
        
    }
    return;
}

//FUNCION ENCARGADA DE ENVIAR CARACTERES UNO A UNO A TRAVES DE SERIAL (buscar online)
void putch(char data){
    //En primer lugar, se verifica que NO se este mandando info (esperar a terminar)
    while(TXSTAbits.TRMT == 0); //Se hace Polling, hasta que TSR este vacio
    TXREG = data; //Se utiliza registro encargado de enviar caracteres por serial
}

//FUNCION ENCARGADA DE RECEPCION SERIAL VIA REMOTA POR CONTROL EXTERNO
void __interrupt() isr(){
    //Si se levanta bandera de interrupcion externa por boton emergencia
    if (INTCONbits.INT0F){
        emergencia = 1; //Se activa variable emergencia para codigo principal
        INTCONbits.INT0F = 0; //Se baja bandera asociada al boton de emergencia
        printf("emergencia");
    }
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
    ADCON0bits.CHS = canal;  //Seleccionar canal conversion (ej: 0 es AN0)
    ADCON0bits.GO = 1;  //Empezamos  conversion A/D
    while(ADCON0bits.GO);  //Esperamos a terminar ADC (polling, ver datasheet)
    return ADRES;  //Devolvemos INTEGER de resultado conversion A/D
}

//FUNCION PARA ASIGNAR VALOR PWM A REGISTRO CCP1, asociado a salida de PWM
void asignarPWM(unsigned int duty){
    //Esto que sigue es complejo, es a traves de cambiar dos bits estrategicos
    //Estamos escribiendo en total 10 bits (8 en CCPR1L y 2 en CCP1CONbits.DC1B)
    //Como duty se guarda en 2 registros diferentes, se hace lo siguiente:
    CCPR1L = duty >>2; //8MSB con right shift 2 bits
    CCP1CONbits.DC1B = duty & 0b11; //2LSB (operacion AND entre bits (ultimos 2)
}
