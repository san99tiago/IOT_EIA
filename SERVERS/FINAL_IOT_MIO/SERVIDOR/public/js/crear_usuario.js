//ARCHIVO PARA CREAR UN NUEVO USUARIO CORRECTAMENTE (UTILIZANDO JQUERY)
//FINAL IOT
//SANTIAGO GARCIA ARANGO
//------------------------------------------------------------------------------------------------


//--------------------------BOTON PARA PROCESAR CREACION DE USUARIO NUEVO-------------------------
//Archivo JSON para la info del usuario
var new_datos_usuario = {
    nuevo_nombre: "0",
    nuevo_correo: "0",
    nuevo_usuario: "0",
    nuevo_password_1: '0',
    nuevo_password_2: '1'
};

//Agregamos "EventListener" para procesar click en boton
document.getElementById('crear_usuario').addEventListener('click', function() 
{

    new_datos_usuario.nuevo_nombre = document.getElementById("new_nombre").value;
    new_datos_usuario.nuevo_correo = document.getElementById("new_correo").value;
    new_datos_usuario.nuevo_usuario = document.getElementById("new_usuario").value;
    new_datos_usuario.nuevo_password_1 = document.getElementById("password_1").value;
    new_datos_usuario.nuevo_password_2 = document.getElementById("password_2").value;

    //De esta manera utilizamos JQUERY para realizar el POST
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/crear_usuario",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(new_datos_usuario),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //En caso de que se logre conexion y usuario sea valido, se redirecciona url
            //nota: esta validacion se hace desde el "index.js"
            if(datosEntrada === "crear_usuario_ok") {

                jConfirm("Usuario registrado y creado correctamente, felicitaciones!", new_datos_usuario.nuevo_nombre + "!", function(r) {
                    window.location.replace("/");
                });
                // alert("Contraseña actualizada correctamente, felicitaciones!");
            }
            
            else if (datosEntrada === "error_falta_datos"){
                jAlert("Te falta ingresar todos los datos, no dejes ninguno en blanco.","TEN CUIDADO");
            }    
            else if (datosEntrada === "datos_error"){
                jAlert("Hubo un problema, sus contraseñas NO coinciden.","CUIDADO");
            }    
            else if (datosEntrada === "usuario_existente_ojo"){
                jAlert("Este usuario ya existe, por favor elija otro nombre de usuario!","ERROR");
            }    
        }
    });
});

//-------------------------------BOTON PARA VOLVER----------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('volver_login').addEventListener('click', function() 
{
    window.location.replace("/");

});

