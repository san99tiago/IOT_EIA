
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>

//Variables basicas para funcionamiento correcto en Red Wifi
const char* ssid = "HOME-7DDB"; 
const char* password = "91B2345E2D52FAA6"; 
String host = "http://192.168.1.63";
String port = ":3000";

//Variables auxiliares para correcto funcionamiento con PIC
String DEVICE_ID;
String palabra_recibida;
int INIT_PIC = 1;  //Permite ver si se inicializa PIC correctamente
int ERROR_GET = 1; //Permite ver si hay errores en GET

String temp = "";
String hum = "";

String payload = "";


void setup() {
  //Inicializamos comunicacion serial de 9600 baud rate
  Serial.begin(9600);

  //Nos conectamos al wifi nuestro (especificado arriba)
  WiFi.begin(ssid, password);

  Serial.println("CONECTANDO...");

  //Simplemente esperamos a correcta conexion (WL_CONNECTED)
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  //Indicamos al PIC que inicializamos correctamente
  Serial.println( "ESP_INIT" );

  //Al superar conexion, lo mostramos, junto con el IP respectivo
  Serial.print("RUTA_IP_ESP:");
  Serial.println( WiFi.localIP() );

  //Obtenemos MAC del dispositivo ESP y enviamos por serial
  DEVICE_ID = WiFi.macAddress();
  Serial.print("MAC_ESP:");
  Serial.println( WiFi.macAddress() );

}




void loop() {
  //Declaramos un cliente para correcta comunicacion
  WiFiClient client;
  
  //Verificamos conexion a internet primero
  if (WiFi.status() == WL_CONNECTED) { 

    //Verificamos disponibilidad del Serial
    while(Serial.available() ) {
  
      //Se almacena STRING leida en el serial hasta caracter finalizacion
      palabra_recibida = Serial.readStringUntil('\n'); //Permite leer hasta caracter '\n'
  

      //Al recibir el INIT desde el PIC, se comienza correcta recepcion (de lo contrario, NO hacer nada)
      if (palabra_recibida == "INIT"){
        INIT_PIC = 1; //Levantamos bandera para indicar correcta inicializacion del PIC
        Serial.println("INIT_OK");
      }


  
      //En caso de que ya se haya inicializado el PIC correctamente
      if (INIT_PIC == 1){


        if (palabra_recibida == "TEMP-HUM") {
          HACER_POST("TEM-HUM" , concatenar_json( DEVICE_ID , String(temp) , String(hum) ));          
        }


        if (palabra_recibida.startsWith("TEMP:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 5;
          temp = "";
          while ( index < tamanno_total){
            temp = temp + palabra_recibida.charAt( index );
            index = index + 1;
          }

        }

        else if (palabra_recibida.startsWith("HUM:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 4;
          hum = "";
          while ( index < tamanno_total){
            hum = hum + palabra_recibida.charAt( index );
            index = index + 1;
          }            
        }


      }    

      
    }

  }else{
    Serial.println("NO_WIFI");
  }

  
  delay(1000);

}


//FUNCION PARA PODER HACER "POST" AL SERVIDOR RESPECTIVO
void HACER_POST(String path , String value) {
  //NOTA: path es por ejemplo "ESP_IOT" o la ruta respectiva del "dominio"
  //Creamos cliente HTTP para poder inicializar correctamente
  HTTPClient http; //Declare an object of class HTTPClient
  String url = host + port + "/" + path;

  Serial.println("STARTING_POST....");
  //Comenzamos la conexion correcta
  //Specify request destination (comenzar conexion HTTP desde ESP a SERVIDOR)
  if (http.begin( url )  )
  {
    //Es importante indicar los "encabezados"(headers) para el POST
    //De esta forma indicamos que es un vector de objetos JSON...
    http.addHeader("Content-Type" , "application/json");

    //Ahora hacemos la peticion POST como tal (en este caso general <value>)
    int httpCode = http.POST( value );


    //Verificamos existencia de codigo obtenido al realizar el POST
    if (httpCode > 0) {

      //En caso de que codigo sea 200 o todo correcto
      if ( httpCode == HTTP_CODE_OK || HTTP_CODE_MOVED_PERMANENTLY){
        
        //Mostramos por serial lo recibido directamente desde el servidor 
        Serial.print("SERVER_POST_OK:");
        Serial.println( http.getString() );

      
      }else{
        //En caso de no lograr correcta conexion a url, devolver error y el codigo recibido
        Serial.print("SERVER_POST_BAD_HTTP_CODE:");
        Serial.println( httpCode );
      }
       
    }else{
      //En caso de que no se logra conexion por un HTTP<0
      Serial.println("SERVER_NOT_CONNECTED");     
    }

    //Siempre finalizamos conexion con servidor (buena practica)
    http.end();

  //En caso de NO lograr correcto http.begin() , es errror al conectarse al servidor
  }else{
    //En caso de que no se logra conexion inicial
    Serial.println("SERVER_NOT_CONNECTED");
  }

}

//Funcion para crear correcto formato JSON para enviar al hacer POST
String concatenar_json(String ID , String temp, String hum) {
  //Creamos el correcto archivo JSON desde cero para enviar el POST
  //Recordar que para agregar comillas se debe agregar con <\"> (de lo contrario cierra string)
  String JSON = "{\"device_id\":\"" + ID + "\",\"temp\":\"" + temp + "\",\"hum\":\""+ hum + "\"}";
                
  return JSON;
}
