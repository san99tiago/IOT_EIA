/*
 * File:   main.c
 * Author: Elkin
 * PROYECTO FINAL INTERNET DE LAS COSAS CODIGO LESTURA SENSOR DE PH -> PIC18F2550
 */


//Importamos libreria generica
#include <xc.h>

//Importamos librerias importantes
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

//Importamos el archivo de C++ con los bits de configuracion 
#include "config.h"

//Definimos la frecuencia de reloj con la que se va a trabajar 
#define _XTAL_FREQ 8000000

//Definimos variables importantes a utilizar 
char buff[100];
unsigned int buffIndex = 0;
volatile unsigned int flag = 0;
int buf[10] , aux;
unsigned long avgValue = 0;

//Definimos funciones importantes a utilizar 
unsigned int leerADC(unsigned char canal);

//Funcion asociada al envio de los caracteres por serial con el printf
void putch(char data){
    while(!TXIF){} //Esperamos a que se pueda mandar informacion 
    TXREG = data; //Enviar caracter por serial
}

//Funcion principal del programa
void main(void) {
    
    //Configuramos el oscilador interno del PIC18F2550
    OSCCONbits.SCS = 0b10; //Configuramos oscilador interno
    OSCCONbits.IRCF = 0b111; //Definimos PLL para tener una frecuencia de reloj de 8Mhz
    
    //Configuramos serial 9600 baudios 
    //------------------------------------------------
    //Configuramos los pines de TX  y RX
    TRISCbits.RC6 = 0; //Definimos pin TX como salida
    TRISCbits.RC7 = 1; //Definimos pin RX como entrada

    //Configuramos baud rate 
    TXSTAbits.SYNC = 0;
    BAUDCONbits.BRG16 = 0;
    TXSTAbits.BRGH = 0;
    SPBRG = 12;

    //Configuramos transmision
    RCSTAbits.SPEN = 1; //Habilitamos puerto serial 
    TXSTAbits.TXEN = 1; //Habilitamos transmision 

    //Configuramos recepcion 
    RCSTAbits.CREN = 1; //Habilitamos recepcion 
    PIE1bits.RC1IE = 1; //Habilitamos interrupcion 
    
    //Configuramos el modulo ADC para las lecturas que se necesiten
    //--------------------------------------------------------------
    //Configuramos los pines que vamos a utilizar para las lecturas 
    TRISAbits.RA0 = 1; //Sensor de PH  
    ADCON1bits.VCFG1 = 0; //Definimos GND como voltaje de referencia negativo
    ADCON1bits.VCFG0 = 0; //Definimos 5V como voltaje de referencia positivo
    ADCON1bits.PCFG = 0b1101; //Definimos pines AN0 y AN1 como analogos 
    ADCON2bits.ADCS = 0b1; //Definimos reloj del ADC (Tad=0.5us)
    ADCON2bits.ADFM = 1; //Justificamos a la derecha
    ADCON2bits.ACQT = 0b1; //Definimos tiempo de adquisición (2Tad)
    ADCON0bits.ADON = 1; //Prendemos el ADC
    
    //Configuramos interrupciones generales
    INTCONbits.PEIE = 1; //Interrupciones por perifericos
    INTCONbits.GIE = 1; //Interrupciones globales
   
    //Iniciamos el ciclo infinito del programa 
    while(1){
        
        //OBTENEMOS EL VALOR DE PH 
        //Obtenemos una muestra de 10 valores del sensor de pH
        for (int i = 0 ; i < 10 ; i++){ 
            buf[i] = leerADC(0);
            __delay_ms(10);
        }
        
        //Ordenamos los datos de la muestra tomada de menor a mayor
        for (int i = 0 ; i < 9 ; i++){
            for (int j = i + 1 ; j < 10 ; j++){
                if (buf[i > buf[j]]){
                    aux = buf[i];
                    buf[i] = buf[j];
                    buf[i] = aux;
                }
            }
        }
        
        //Tomamos los 6 valores centrales de la muestra ordenada y los sumamos en una variable pra luego sacar el promedio y calcular el pH
        for (int i = 2 ; i < 8 ; i++){
            avgValue += buf[i];
        }
        
        //Encontramos el valor del pH
        float phValue = (float)(avgValue*5.0/1024/6);
        phValue = 3.5*phValue;
        
        //Mandamos el dato al ESP8266
        printf("pH: %.02f" , phValue);
        __delay_ms(4990);
    }
    
    return;
}

//Definimos funcion asociada a las interrupciones 
void __interrupt() isr(){
      
    //Interrupcion asociada al serial 
    if(PIR1bits.RCIF){
        //Se guarda info de lo recibido en character (desde otro pic)
        char recibido = RCREG;
        //Empezamos a concatenar la palabra
        if (buffIndex < 100){
            if (recibido == '\n'){
                buff[buffIndex] = '\0';
                flag = 1;
               
            }else{
                buff[buffIndex] = recibido;
                buffIndex++;
            }
        }    
       //Se baja bandera
        PIR1bits.RCIF = 0;
    }
}

//Iniciamos la función asociada a leer el valor de voltaje de los potenciómetros 
unsigned int leerADC(unsigned char canal){
    ADCON0bits.CHS = canal; //Asignamos el canal de lectura del PWM
    ADCON0bits.GO = 1; //Iniciamos la lectura
    while(ADCON0bits.GO){
        return ADRES;
    }
    
}
