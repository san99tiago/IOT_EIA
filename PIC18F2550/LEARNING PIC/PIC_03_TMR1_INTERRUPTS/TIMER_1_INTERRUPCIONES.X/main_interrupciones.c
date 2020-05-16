//Author: Santiago Garcia Arango
//CODIGO PARA VERIFICAR FUNCIONAMIENTO DE TIMER1 Y ACTIVAR SUS INTERRUPCIONES

//Incluimos libreria para compilar correctamente
#include <xc.h>
//Incluimos Bits de Configuracion (estan en otro archivo Header)
#include "config.h"
//Definimos frecuencia del crystal externo de oscilacion (16MHz)
#define _XTAL_FREQ 16000000

//Contador para multiplicar timer por valor mayor (N veces tiempo total timer)
int cont = 0;

void main(void) {
    //Se indica oscilador externo (primary oscillator, en este caso Crystal)
    OSCCONbits.SCS = 0b00;
    
    //Registro de configuracion de puertos Analogos/Digitales (ver datasheet)
    //Se garantizan bits de todos los pines "AN_" en digital asi:
    ADCON1 = 0b1111; //(AN0,AN1,AN2, ... , AN12) como pines I/O DIGITALES
    
    //Se indica que pin RB3 sera utilizado como salida digital
    // 0 --> Output, 1 --> Input
    TRISBbits.RB3 = 0;
    //Se inicializa valor nulo al pin asociado a RB3
    LATBbits.LB3 = 0;
    
    
    //----------CONFIGURACION TIMER 1-------- (Ver datasheet para claridad))
    T1CONbits.TMR1ON = 0; //Se apaga timer (OFF)
    T1CONbits.TMR1CS = 0; //Timer1 como timer de reloj interno ( Fosc/4 )
    T1CONbits.T1OSCEN = 0; //NO se configura oscilador propio de timer1, sino...
                           //... que se utiliza el oscilador externo (crystal))
    T1CONbits.T1CKPS = 0b010; //1:8 prescale (hacer timer mas "largo")
    T1CONbits.RD16 = 1; //Lectura/escritura de 16bits (Activar DOS timers)
    TMR1 = 0; //Reset timer
    PIE1bits.TMR1IE = 1; //Se activan interrupciones por timer1
    PIR1bits.TMR1IF = 0; //Se limpia bandera de interrupcion (buena practica)
    //Nota: estas interrupciones se usan con "PIR1bits.TMR1IF" (ver datasheet)
    
    
    //NO hay prioridad en interrupciones (IPEN = 0 por defecto, ver datasheet)
    //Pero se activan interrupciones globales y perifericas
    INTCONbits.PEIE = 1; //Perpherical interrupt enable (ver datasheet)
    INTCONbits.GIE = 1;  //Global interrupt enable (ver datasheet)
    
    //ENCENDER TIMERS AL FINAL (luego de activar interrupciones)
    T1CONbits.TMR1ON = 1; //Se enciende (ON) timer 1 declarado arriba
    
    while (1){
        //Cuando cont sea 10, implica 10 interrupciones de banderas...
        //...es para "alargar" el timer a nuestro favor
        if (cont ==10){
            //Cambiamos estado del pin RB3 por su complemento y reseteo cont
            LATBbits.LB3 = !LATBbits.LB3;
            cont = 0;
        }
    }
    return;
}

//FUNCION ASOCIADA A INTERRUPCIONES(no cambiar "void __interrupt")
//se decide llamar la funcion "isr" y no recibe parametros directos
void __interrupt() isr(){
    //Se debe validar o verificar cual interrupcion fue llamada...
    //esto se logra con ayuda de las banderas activas, en este...
    //caso verficamos la asociada al timer 1 (verificar datasheet)
    if (PIR1bits.TMR1IF) {
        //Se aumenta cont, para llevar conteo de interrupciones por overflow
        cont = cont +1;
        
        //Se debe resetear el valor como tal del "timer1" a 0.
        TMR1 = 0;
        
        //Bajamos la bandera asociada al evento
        PIR1bits.TMR1IF = 0;
    }
}
