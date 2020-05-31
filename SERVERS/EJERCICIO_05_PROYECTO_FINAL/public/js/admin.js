// ARCHIVO PARA PROCESAR LA PARTE PRINCIPAL DE LOS ADMIN DE LA APLICACION(UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//-------------------------------------------------------------------------------------------
//Archivo JSON para procesar diferentes eventos segun los botones indicados (first_access nos ayuda a llenar tabla)
var info_principal = {
    first_access: "yes",
    admin_que_hacer: "0",
    admin_usuario_elegido: "0",
    admin_dato_cambiar: "0",
    admin_nuevo_dato: "0",
};


//-----------------------------BOTON DE SALIRSE-----------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('salir_admin').addEventListener('click', function() {
    window.location.replace("/");//Redirigimos el usuario al login principal (y se cierra sesion)
});




//------------------------------MOSTRAR TABLA DINAMICA------------------------------------------
var vector_usuarios = {}; //Nos permite recorrer vector de usuarios que nos llegue desde servidor principal

function mostrar_tabla_segun_usuarios() {
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/admin",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //Vector donde almacenamos la info que nos llega en el vector de usuarios enviado desde index.js
            vector_usuarios = datosEntrada;

            for (i = 0; i < vector_usuarios.length; i++) {
                //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla de usuarios
                $('#tabla_usuarios_dinamica > tbody:last-child').append(
                    '<tr><td>' + vector_usuarios[i].id + 
                    '</td><td>' + vector_usuarios[i].nombre + 
                    '</td><td>' + vector_usuarios[i].apellido + 
                    '</td><td>' + vector_usuarios[i].usuario + 
                    '</td><td>' + vector_usuarios[i].password + 
                    '</td><td>' + vector_usuarios[i].edad + 
                    '</td><td>' + vector_usuarios[i].sexo + 
                    '</td><td>' + vector_usuarios[i].pais + 
                    '</td><td>' + vector_usuarios[i].perfil + 
                    '</td></tr>');
            }   
        }
    });
}






//-----------------------BOTON PARA PROCESAR NUEVO CAMBIO DE ADMIN------------------------

//Agregamos "EventListener" para procesar click en boton
document.getElementById('admin_actualizar_boton').addEventListener('click', function() {
    info_principal.first_access = "no";
    info_principal.admin_que_hacer = document.getElementById("opciones_1").value;
    info_principal.admin_usuario_elegido = document.getElementById("usuario_elegido").value;
    info_principal.admin_dato_cambiar = document.getElementById("opciones_2").value;
    info_principal.admin_nuevo_dato = document.getElementById("nuevo_dato").value;


    //De esta manera utilizamos JQUERY para realizar el POST
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/admin",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {

            //En caso de que se logre conexion y usuario sea valido, se redirecciona url
            //nota: esta validacion se hace desde el "index.js"
            if(datosEntrada === "datos_actualizados_ok") {
                jConfirm("Datos actualizados correctamente!", "OPERACIÓN EXITOSA", function(r) {
                    window.location.replace("/admin");
                });            
            }
            else if (datosEntrada === "no_existe_usuario"){
                jAlert("Usuario indicado NO existe","ATENCION");
            }
            else if (datosEntrada === "error_datos_usuario"){
                jAlert("Error con datos ingresados","ERROR");
            }

        }
    });
});





