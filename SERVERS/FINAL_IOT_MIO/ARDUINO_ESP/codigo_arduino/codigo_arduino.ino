//FINAL IOT
//SANTIAGO GARCIA ARANGO

//Pines para lecturas analogas y atencion paciente (pin digital)
int pin_atencion = 10;
int pin_temperatura = 1;
int pin_oxigeno = 2;
int pin_medicina = 3;

//Variables importantes problema
int oxigeno = 0;
int temperatura = 0;
int medicina = 0;
int atencion = 0;
String nombre = "santi";


void setup() {
  Serial.begin(9600); //Inicializamos comunicacion serial principal (pines:0-1) a 9600 baud rate
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Native USB only
  }

  Serial.println("INIT");

}


void loop() {

  //Pin paciente
  atencion = digitalRead(pin_atencion); 

  
  //Lecturas analogas
  oxigeno = analogRead(pin_oxigeno); 
  temperatura = analogRead(pin_temperatura); 
  medicina = analogRead(pin_medicina); 


  
  //AQUI HACER CONTROL RESPECTIVO CON  PWM1 y PWM2
  //...SE INDICO EN EXAMEN QUE NO EJERCIERAMOS CONTROL (SOLO LECTURAS)


  //Convertimos variables en rangos adecuados para enviar por serial
  oxigeno = map(oxigeno, 0, 1023, 0, 100);
  temperatura = map(temperatura, 0, 1023, -55, 105);  
  medicina = map(medicina, 0, 1023, 0, 100);

  
  //Enviamos por serial a ESP8266
  if (Serial.available()) {
    
    Serial.print("nombre:");
    Serial.print(nombre);
    Serial.print("\n");

    delay(50);
    
    Serial.print("atencion:");
    Serial.print( atencion ); 
    Serial.print("\n");

    delay(50);

    Serial.print("oxigeno:");
    Serial.print( oxigeno );
    Serial.print("\n");

    delay(50);

    Serial.print("medicina:");
    Serial.print( medicina );
    Serial.print("\n");

    delay(50);

    Serial.print("temperatura:");
    Serial.print( temperatura );
    Serial.print("\n"); 

    delay(50);

    Serial.println("POST");
       
  }  

  delay(10000); //Esperar 10 segundos entre cada info enviada al ESP


  
}
