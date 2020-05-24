// ARCHIVO PARA PROCESAR EL LOGIN (UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//---------------------------------------------------------------------------------------


//------------------------EVENT: main login button---------------------------

//Archivo JSON para la info del usuario
var datos_usuario = {
    usuario: "0",
    password: "0",
};


//Agregamos "EventListener" para procesar click en boton
document.getElementById('login_button').addEventListener('click', function() {
    datos_usuario.usuario = document.getElementById("login_usuario").value;
    datos_usuario.password = document.getElementById("login_password").value;

    //De esta manera utilizamos JQUERY para realizar el POST
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/login",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(datos_usuario),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {

            //En caso de que se logre conexion y usuario sea valido, se redirecciona url
            //nota: esta validacion se hace desde el "index.js"
            if(datosEntrada === "server_ok") {
                //Unica forma de lograr conectarse al /cuestionario
                window.location.replace("/main");
            }else{
                // alert("Nombre de usuario y/o contraseña incorrectos");
                jAlert("Nombre de usuario y/o contraseña incorrectos","ALERTA");
            }    
        }
    });
});
//Agregamos "EventListener" para procesar click en boton
document.getElementById('crear_new_user').addEventListener('click', function() {
    window.location.replace("/crear_usuario");
});


