#include "DHT.h" //Importamos la libreria del DHT11

 

#define DHTPIN 2 //Definimos el pin 2 del Arduino como el pin al que llegara la informacion del DHT11

 

#define DHTTYPE DHT11 //Definimos el tipo de sensor que tenemos en este caso la version 11

 

DHT dht(DHTPIN , DHTTYPE); //Creamos el objeto asocidado a la libreria con los parametros antes definidos

 

#include <SoftwareSerial.h>

 

SoftwareSerial serialDHT11(2,3); //Puerto serial virtual para la lectura de los datos del DHT11
//RXv: PIN 2 TXv: PIN 3


//Variables extras
int temperatura = 15; 
int humedad = 68;

 

void setup() {
  
  //Definimos la velocidad de transmision de la comunicacion serial 
  Serial.begin(9600);
  serialDHT11.begin(9600);
  
  
  dht.begin(); //Iniciamos el objeto anteriormente creado usando el metodo begin 
  
}

 

void loop() {
//  getTempHum(); //Funcion oficial TempHum

  if (humedad < 88){
    humedad = humedad +1;
  }else{
    humedad = 70;
  }
  if (temperatura <35){
    temperatura ++;
  }else{
    temperatura = 20;
  }

  String datat = "TEMP:" + String(temperatura);
  String datah = "HUM:" + String(humedad);
  Serial.println(datat);//enviamos temperatura por serial 
  delay(1000);
  Serial.println(datah);// enviamos humedad por serial 
  delay(1000);
  Serial.println("TEMP-HUM");//enviamos comando para ejecutaar la petición POST en el ESP8266

  delay(5000);
  
}



 

//Definimos funcion asociada a la toma de los datos con el DHT11
void getTempHum(){
  //Esperamos dos segundos recomendados para el correcto funcionamiento de la libreria del DHT11
  delay(2000);

 

  float h = dht.readHumidity(); //Leemos el porcentaje de humedad 
  float t = dht.readTemperature(); //Leemos la temperatura en Cº

 

  //Verificamos que las lecturas se hayan realizado correctamente usando la funcion isnan()(Manda TRUE si hay error)
  //Si llega a haber algun error retornamos y volvemos a leer
  if (isnan(h) || isnan(t)){
      return;
  }

 

  //If you use F() you can move constant strings to the program memory instead of the ram.
  //Serial.print(F("Humidity: "));
  //Serial.print(h);

 

  String datat = "TEMP:" + String(t);
  String datah = "HUM:" + String(h);
  Serial.println(datat);//enviamos temperatura por serial 
  delay(1000);
  Serial.println(datah);// enviamos humedad por serial 
  delay(2000);
  Serial.println("TEMP-HUM");//enviamos comando para ejecutaar la petición POST en el ESP8266
  
 
}
