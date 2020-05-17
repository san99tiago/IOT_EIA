//CONTADOR ASCENDENTE/DESCENDENTE SEGUN BOTONES EXTERNOS Y LEDS INDICADORES
//Se agrega ademas antirrebota por TMR0 vis software (aprox 65ms)
//Santiago Garcia Arango, 2020
//PIC16F887

//Importamos libreria compilador en C y bits de configuracion localizado en headers
#include <xc.h>
#include "config.h"

//Definimos variables globales para correcto funcionamiento
int contador_timer = 0; //Contador para lograr tiempo de 0.5s asociado a timer0
int contador = 0; //Variable para estado actual del contador ascendente descendente
int correcto_antirrebote = 0; //Variable para validar cumplimiento antirrebote


void main(void) {
    //---------------------CONFIGURACION DE OSCILADOR INTERNO DE 8MHz---------------------
    OSCCONbits.SCS = 1; //Seleccionamos oscilador interno como system clock
    OSCCONbits.IRCF = 0b111; //Elegimos frecuencia oscilador interno de 8MHz
    
    
    //-----------------CONFIGURACION DE PUERTOS DE ENTRADA Y SALIDA------------------------
    ANSEL = 0; //Pines AN<7:0> Digitales I/O (evitar errores de pines como ADC)
    ANSELH = 0; //Pines AN<13:8> Digitales I/O (evitar errores de pines como ADC
    TRISAbits.TRISA0 = 1; //Pin RA0 como entrada
    TRISAbits.TRISA1 = 1; //Pin RA1 como entrada
    TRISB = 0; //puerto B como output
    PORTB = 0; //Inicializamos puerto B como OFF
    
    
    
    //-------------------CONFIGURACION DE TIMER0------------------------------------------
    //... Configuramos timer0 para contar segun Fosc/4, prescaler 1:8.
    //... Tiempo total en contar es:  TIEMPO TOTAL =  (2^8 - 1)/(Fosc/4/8)  =  1.02ms
    OPTION_REGbits.T0CS = 0; //Clock source de internal instruction cycle (Fosc/4)
    OPTION_REGbits.PSA = 0; //Se asigna prescaler al timer0
    OPTION_REGbits.PS = 0b010; //Prescaler de 1:8
    TMR0 = 0; //Inicializamos valor de timer0 en 0;
    INTCONbits.T0IE = 1; //Habilitamos interrupcion timer0 por overflow
    INTCONbits.T0IF = 0; //Buena practica inicializar bandera interrupcion en 0
    
    
    //-----------------ACTIVAMOS INTERRUPCIONES GLOBALES Y PERIFERICAS--------------------
    INTCONbits.GIE = 1; //Habilitar interrupciones globales
    INTCONbits.PEIE =1; //Habilitar interrupciones perifericas
    
    
    while(1){
        
        //Reseteamos constantemente contador_timer para evitar grandes numeros y error
        contador_timer = 0; //Resteamos constantemente contador timer
        
        //En caso de detectar boton del RA0 (osea para aumentar contador)
        if ( PORTAbits.RA0 ) {
            //Justo al presionar RA0, comenzamos timer para verificar Antirrebote
            TMR0 = 0; //Reseteamos timer0
            contador_timer = 0; //Reseteamos contador_timer (para los 65ms)
            //Polling hasta terminar de presionar RA0 (aumentando contador cada 1ms)
            while( PORTAbits.RA0 ){
                //Hacemos polling, validando antirrebote con ayuda de contador_timer
                if (contador_timer > 65){
                    //Variable que indica que se cumplio tiempo para antirrebote
                    correcto_antirrebote = 1;
                }    
            }
            //En caso de que se haya cumplido tiempo antirrebote:
            if (correcto_antirrebote == 1 && contador<8) {
                contador = contador + 1;
            }
            
            correcto_antirrebote = 0; //Luego de aumentar contador, reseteamos indicador   
        }

        //En caso de detectar boton del RA1 (osea para disminuit contador)
        if ( PORTAbits.RA1 ) {
            //Justo al presionar RA1, comenzamos timer para verificar Antirrebote
            TMR0 = 0; //Reseteamos timer0
            contador_timer = 0; //Reseteamos contador_timer (para los 65ms)
            //Polling hasta terminar de presionar RA1 (aumentando contador cada 1ms)
            while( PORTAbits.RA1 ){
                //Hacemos polling, validando antirrebote con ayuda de contador_timer
                if (contador_timer > 65){
                    //Variable que indica que se cumplio tiempo para antirrebote
                    correcto_antirrebote = 1;
                }    
            }
            //En caso de que se haya cumplido tiempo antirrebote:
            if (correcto_antirrebote == 1  && contador>0) {
                contador = contador - 1;
            }
            
            correcto_antirrebote = 0; //Luego de aumentar contador, reseteamos indicador   
        }

        
        //Proceso para mostrar el respectivo numero del contador segun LEDs puerto B
        if (contador == 0 ){
            PORTB = 0; //Todos OFF si contador es nulo
        }
        if (contador == 1 ){
            PORTB = 0b00000001; //LED respectivo segun numero
        }
        if (contador == 2 ){
            PORTB = 0b00000010; //LED respectivo segun numero
        }
        if (contador == 3 ){
            PORTB = 0b00000100; //LED respectivo segun numero
        }
        if (contador == 4 ){
            PORTB = 0b00001000; //LED respectivo segun numero
        }
        if (contador == 5 ){
            PORTB = 0b00010000; //LED respectivo segun numero
        }
        if (contador == 6 ){
            PORTB = 0b00100000; //LED respectivo segun numero
        }        
        if (contador == 7 ){
            PORTB = 0b01000000; //LED respectivo segun numero
        }                
        if (contador == 8 ){
            PORTB = 0b10000000; //LED respectivo segun numero
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
