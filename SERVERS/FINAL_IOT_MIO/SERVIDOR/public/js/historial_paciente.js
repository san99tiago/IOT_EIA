// ARCHIVO PARA HISTORIAL PACIENTE(UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//Archivo JSON para procesar diferentes eventos segun los criterios indicados (first_access nos ayuda a llenar tabla)
var info_principal = {
    first_access: "yes",
};

//-----------------------------BOTON DE VOLVER-----------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('volver').addEventListener('click', function() {
    window.location.replace("/home");//Redirigimos el usuario al login principal (y se cierra sesion)

});


//------------------------------MOSTRAR TABLA HISTORIAL ------------------------------------------
var vector_datos = {}; //Nos permite recorrer vector de usuarios que nos llegue desde servidor principal

function mostrar_tabla_datos() {

    info_principal.first_access = "yes";


    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/historial_paciente",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //Vector donde almacenamos la info que nos llega en el vector de usuarios enviado desde index.js
            vector_datos = datosEntrada;

            if (vector_datos.length > 0){

                for (i = 0; i < vector_datos.length; i++) {
                    //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla de usuarios
                    $('#tabla_datos_dinamica > tbody:last-child').append(
                        '<tr><td>' + vector_datos[i].nombre + 
                        '</td><td>' + vector_datos[i].nivel_medicina + 
                        '</td><td>' + vector_datos[i].nivel_oxigenacion+ 
                        '</td><td>' + vector_datos[i].temp_habitacion +  
                        '</td><td id="atencion_color">' + vector_datos[i].estado_atencion +   
                        '</td></tr>');
                }   
            }

        }
    });
}


