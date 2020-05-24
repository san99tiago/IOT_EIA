//ARCHIVO PARA PROCESAR EL CAMBIO DE CONSTRASENNA (UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//------------------------------------------------------------------------------------------------


//--------------------------------BOTON PARA PROCESAR CAMBIO CONTRASEÑA----------------------------
//Archivo JSON para la info del usuario
var new_datos_usuario = {
    actual_usuario: '0',
    actual_password: '0',
    new_password_1: '0',
    new_password_2: '1'
};

//Agregamos "EventListener" para procesar click en boton
document.getElementById('new_password_button').addEventListener('click', function() 
{

    new_datos_usuario.actual_usuario = document.getElementById("actual_usuario").value;
    new_datos_usuario.actual_password = document.getElementById("actual_password").value;
    new_datos_usuario.new_password_1 = document.getElementById("new_password_1").value;
    new_datos_usuario.new_password_2 = document.getElementById("new_password_2").value;

    //De esta manera utilizamos JQUERY para realizar el POST
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/change_password",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(new_datos_usuario),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //En caso de que se logre conexion y usuario sea valido, se redirecciona url
            //nota: esta validacion se hace desde el "index.js"
            if(datosEntrada === "datos_ok") {

                jConfirm("Contraseña actualizada correctamente, felicitaciones!", new_datos_usuario.actual_usuario+"!!!", function(r) {
                    window.location.replace("/");
                });
                // alert("Contraseña actualizada correctamente, felicitaciones!");
            }
            else if (datosEntrada === "datos_error"){
                // alert("Hubo un problema, sus contraseñas NO coinciden.");
                jAlert("Hubo un problema, sus contraseñas NO coinciden.","CUIDADO");
            }    
            else if (datosEntrada === "datos_error_auth"){
                // alert("Cuidado, su usuario y/o contraseña actuales están incorrectos.");
                jAlert("Su usuario y/o contraseña actuales están incorrectos.","WARNING");
            }    
        }
    });
});

//-------------------------------BOTON PARA VOLVER----------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('volver').addEventListener('click', function() 
{
    window.location.replace("/");

});

