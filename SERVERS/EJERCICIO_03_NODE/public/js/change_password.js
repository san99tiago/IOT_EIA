// ARCHIVO PARA PROCESAR EL CAMBIO DE CONSTRASENNA (UTILIZANDO JQUERY)

//------------------------EVENT: main login button---------------------------
var usuario = '0';
var password = '1';
var password_1 = '2';
var password_2 = '3';


//Archivo JSON para la info del usuario
var new_datos_usuario = {
    actual_usuario: usuario,
    actual_password: password,
    new_password_1: password_1,
    new_password_2: password_2
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
                alert("EXCELENTE SANTI.");
            }else{
                alert("Hubo un problema, verifique datos ingresados.");
            }    
        }
    });
});



