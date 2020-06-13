//CODIGO ESP EXAMEN FINAL IOT
//SANTIAGO GARCIA ARANGO


#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>

//Variables basicas para funcionamiento correcto en Red Wifi
const char* ssid = "GARCIAWIFI"; 
const char* password = "1037670792"; 
String host = "http://192.168.1.15";
String port = ":3000";


//Variables auxiliares para correcto funcionamiento con Arduino
String DEVICE_ID;
String palabra_recibida;
int ERROR_GET = 1; //Permite ver si hay errores en GET
int INIT = 0; //Para comenzar proceso desde serial del Arduino


//Variables importantes problema
String nombre = "";
String temperatura = "";
String medicina = "";
String oxigeno = "";
String atencion = "0";


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
  

      //Al recibir el INIT desde el Arduino, se comienza correcta recepcion (de lo contrario, NO hacer nada)
      if (palabra_recibida == "INIT"){
        INIT = 1; //Levantamos bandera para indicar correcta inicializacion del Ardunio
        Serial.println("INIT_OK");
      }


  
      //En caso de que ya se haya inicializado el ARDUNIO correctamente
      if (INIT == 1){

        //Palabra clave para hacer peticion POST al servidor
        if (palabra_recibida == "POST") {
          HACER_POST("esp_post" , concatenar_json( String(nombre) , String(medicina) , String(oxigeno), String(temperatura), String(atencion) ));          
        }


        if (palabra_recibida.startsWith("nombre:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 7;
          nombre = "";
          while ( index < tamanno_total){
            nombre = nombre + palabra_recibida.charAt( index );
            index = index + 1;
          }

        }

        else if (palabra_recibida.startsWith("atencion:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 9;
          atencion = "";
          while ( index < tamanno_total){
            atencion = atencion + palabra_recibida.charAt( index );
            index = index + 1;
          }            
        }



        if (palabra_recibida.startsWith("oxigeno:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 8;
          oxigeno = "";
          while ( index < tamanno_total){
            oxigeno = oxigeno + palabra_recibida.charAt( index );
            index = index + 1;
          }

        }

        else if (palabra_recibida.startsWith("medicina:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 9;
          medicina = "";
          while ( index < tamanno_total){
            medicina = medicina + palabra_recibida.charAt( index );
            index = index + 1;
          }            
        }

        else if (palabra_recibida.startsWith("temperatura:") ){
          int tamanno_total = palabra_recibida.length();
          int index = 9;
          temperatura = "";
          while ( index < tamanno_total){
            temperatura = temperatura + palabra_recibida.charAt( index );
            index = index + 1;
          }            
        }
        


      }    

      
    }

  }else{
    Serial.println("NO_WIFI");
  }

  
  delay(100); //NOTA: el delay principal esta en el codigo del ARDUNIO

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
String concatenar_json( String nombre , String medicina , String oxigeno, String temperatura , String atencion ) {
  //Creamos el correcto archivo JSON desde cero para enviar el POST
  //Recordar que para agregar comillas se debe agregar con <\"> (de lo contrario cierra string)
  String JSON = "{\"nombre\":\"" + nombre + "\",\"nivel_medicina\":\"" + medicina + "\",\"nivel_oxigenacion\":\""+ oxigeno + "\",\"temp_habitacion\":\""+ temperatura + "\",\"estado_atencion\":\""+ atencion +"\"}";
                
  return JSON;
}
