//SANTIAGO GARCIA ARANGO, ABRIL 2020
// ARCHIVO JS PARA CONECTAR CORRECTAMENTE EL HTML Y PROCESAR RESPUESTAS.
//Es importante crear este archivo para analizar las opciones del usuario y...
//...crear la tabla de realimentacion con el resultado final de su examen.

//--------------------------------DEFINIMOS VARIABLES------------------------------
//Las que se usan para obtener y procesar nombre usuario...
var nombre_usuario="";
var apellido_usuario="";
var edad_usuario="";
//Las que se usan para procesar puntaje...
var respuesta_1="";
var respuesta_2="";
var respuesta_3="";
var respuesta_4="";
var total=0;
var porcentaje=0;
//La usamos como conexion entre letra elegida en seleccion multiple y funcion respectiva
var elegida;
//La usamos para verifiar que usuario esta seguro de su respuesta y mostrar puntajes
var seguro=0;



//------------------------------DEFINIMOS FUNCIONES---------------------------------

//Funcion que corre al seleccionar uno de los radiobuttons de "pregunta_1"
function funcion_respuesta_1(elegida){
    respuesta_1 = elegida;
}

//Funcion que corre al seleccionar uno de los radiobuttons de "pregunta_2"
function funcion_respuesta_2(elegida){
    respuesta_2 = elegida;
}

//Funcion que corre al seleccionar uno de los radiobuttons de "pregunta_3"
function funcion_respuesta_3(elegida){
    respuesta_3 = elegida;
}

//Funcion que corre al seleccionar uno de los radiobuttons de "pregunta_4"
function funcion_respuesta_4(elegida){
    respuesta_4 = elegida;
}


function procesar_datos(){
    //Mostramos "alerta" preguntando si usuario esta seguro
    seguro = confirm("¿ESTÁ SEGURO QUE DESEA FINALIZAR EL CUESTIONARIO?");

    //En caso de que SI quiera continuar despues de la alerta...
    if (seguro){
        //Obtenemos informacion de los inputs asociados a datos del usuario
        nombre_usuario = document.getElementById("nombre").value;
        apellido_usuario = document.getElementById("apellido").value;
        edad_usuario = document.getElementById("edad").value;

        //Procesamos puntaje del quiz
        total=0; //Reseteamos total para que no se acumulen viejos quices
        if (respuesta_1=="B") {
            total= total +1;
        }
        if (respuesta_2=="D") {
            total= total +1;
        }
        if (respuesta_3=="D") {
            total= total +1;
        }
        if (respuesta_4=="A") {
            total= total +1;
        }

        porcentaje=total*100/4;

        //Cambiamos los "li" asociados a la tabla con los datos obtenidos
        document.getElementById("li1").innerHTML = nombre_usuario;
        document.getElementById("li2").innerHTML = apellido_usuario;
        document.getElementById("li3").innerHTML = edad_usuario;
        document.getElementById("li4").innerHTML = total;
        document.getElementById("li5").innerHTML = porcentaje +"%";

        //Ahora cambiamos elemento asociado al nombre que mostramos en saludo al final tipo alerta (segun nombre usuario)
        document.getElementById("NOMBRE_FINAL").innerHTML = "¡" + nombre_usuario + "!... ¡Gracias por participar, espero que te haya gustado!";
        
        //Ademas, modificamos propiedades de visibilidad y clase de la ultima seccion (habilitamos que SI SE VEA!)
        document.getElementById("ESCONDER").style.visibility = "visible";
        document.getElementById("ESCONDER").classList = "animated rotateInUpLeft agregar-delay-1";
    }


}

