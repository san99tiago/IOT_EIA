int pin = 7; // definimos pin de input digital ( sensor digital fotosensible graduable , 1 --> iluminación suficiente para establecer que hay luz solar, 0 --> iluminación insuficiente)
int value = 0; // variable para guardar el estado del pin y luego realizar los condicionales 
 
void setup() {
  Serial.begin(9600);   //iniciamos puerto serie
  pinMode(pin, INPUT);  //definimos pin como entrada
  
}
 
void loop(){


  value = digitalRead(pin);  //lectura digital del pin
 
  //mandar mensaje a puerto serie en función al valor leido
  if (value == HIGH) {
      Serial.println("NOCHE");
  }
  else {
      Serial.println("DIA");
  }
  delay(1000); //enviamos información cada 5 min(día o de noche dependiendo las condiciones de iluminación)
}
