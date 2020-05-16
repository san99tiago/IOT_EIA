//Author: Santiago Garcia Arango
//CODIGO PARA VARIAR INTENSIDAD LED, A TRAVES DE A/D CONVERTER Y PWM

//Libreria compilador, header (config bits) y definimos frecuencia crystal
#include <xc.h>
#include "config.h"
#define _XTAL_FREQ 16000000

//Creacion de funciones  que definiremos al final para manejo de ADC y PWM
unsigned int leerADC(unsigned char canal);
unsigned int asignarPWM(unsigned int duty);

void main(void) {
    //------------CONFIGURAMOS ADC (en este caso RA0/AN0)-----------------
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
    
    //------------CONFIGURACION DEL PWM----------------
    //Realmente nos aprovecharemos del Timer2 para el PWM (ver datasheet)
    //PR2 = 255 y prescale =1, PWMfreq = 7.8
    PR2 = 255;  //para especificar correctamente periodo del PWM
    asignarPWM(0);  //Se comienza PWM en duty cycle de 0
    TRISCbits.RC2 = 0; //RC2 como salida (que es pin asociado a CCP1, osea PWM)
    //A continuacion se utilizan registros del timer2 (Necesarios para PWM)
    T2CONbits.T2CKPS = 0b0; //Se configura Timer2 en prescaler 1 (no cambia)
    T2CONbits.TMR2ON = 1; //Encender el timer2
    CCP1CONbits.CCP1M = 0b1100; //CCP1 en modo PWM mode (ver datasheet)
    
    while (1){
        //Se lee constantemente conversion A/D, y se asigna a PWM
        //Ver funciones de abajo para ver proceso riguroso
        //Nota: solamente se lee canal "AN0" de conversor A/D (definido arriba)
        asignarPWM( leerADC(0) );
    }
    return;
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
unsigned int asignarPWM(unsigned int duty){
    //Esto que sigue es complejo, es a traves de cambiar dos bits estrategicos
    //Estamos escribiendo en total 10 bits (8 en CCPR1L y 2 en CCP1CONbits.DC1B)
    //Como duty se guarda en 2 registros diferentes, se hace lo siguiente:
    CCPR1L = duty >>2; //8MSB con right shift 2 bits
    CCP1CONbits.DC1B = duty & 0b11; //2LSB (operacion AND entre bits (ultimos 2)
}
