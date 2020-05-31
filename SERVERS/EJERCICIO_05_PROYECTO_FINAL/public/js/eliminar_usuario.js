//ARCHIVO PARA ELIMINAR UN USUARIO EXISTENTE DE BASE DE DATOS MYSQL (UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//------------------------------------------------------------------------------------------------


//----------------------FUNCION AL RECARGAR PAGINA, PARA OBTENER USUARIO-------------------------
//El objetivo es correrla al cargar pagina y que nos llene automaticamente el usuario segun la sesion
function funcion_cargar_pagina(){
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/eliminar_usuario",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(delete_user_info),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
                        
            if(datosEntrada.split(":")[0] === "usuario") {
                document.getElementById("usuario_eliminar").value = datosEntrada.split(":")[1];
            }
        }   
    });
};



//---------------------PROCESAR CHECKBOX PARA VERIFICAR CONFIRMAR ELIMINAR------------------------
var confirmar_eliminar = 0;

function funcion_confirmar(){
    confirmar_eliminar = !confirmar_eliminar;
    // jAlert( confirmar_eliminar.toString() ); //(verificamos que este sirviendo confirmar_eliminar)
};


//--------------------------------BOTON PARA PROCESAR ELIMINAR-------------------------------------
//Archivo JSON para la info del usuario
var delete_user_info = {
    usuario_eliminar: '0',
    password_eliminar: '0',
    first_access: "yes"
};

//Agregamos "EventListener" para procesar click en boton
document.getElementById('ejecutar_eliminar_usuario').addEventListener('click', function() 
{

    delete_user_info.usuario_eliminar = document.getElementById("usuario_eliminar").value;
    delete_user_info.password_eliminar = document.getElementById("password_eliminar").value;
    delete_user_info.first_access = "no";

    //Solamente procedemos a hacer el POST, si el usuario confirma que desea elimnar su cuenta
    if (confirmar_eliminar){
        //De esta manera utilizamos JQUERY para realizar el POST
        $.post({
            //Redirigimos el path para acceder al login(esta vez con post)
            url: "/eliminar_usuario",
            
            //Convertimos objeto de datos de usuario a formato JSON
            data: JSON.stringify(delete_user_info),
            //Indicamos Header para enviar info de tipo JSON
            contentType: "application/json",
            
            //En caso de lograr correcto POST
            //nota: (datos_Entrada es la respuesta enviada desde el index.js)
            success: function(datosEntrada,status) {
                //En caso de que se logre conexion y usuario sea valido, se redirecciona url
                //nota: esta validacion se hace desde el "index.js"
                if(datosEntrada === "usuario_eliminado") {
    
                    jConfirm("Usuario eliminado correctamente, te perdiste de una gran aplicación de IOT... Adiós." , delete_user_info.usuario_eliminar+" :( ", function(r) {
                        window.location.replace("/");
                    });
                }
                else if (datosEntrada === "datos_error_auth"){
                    jAlert("Su usuario y/o contraseña actuales están incorrectos.","WARNING");
                } 
                else if (datosEntrada === "error_vuelva_luego"){
                    jAlert("Su solicitud no pudo ser realizada, vuelva en 1 hora.","LO SENTIMOS");
                } 

            }
        });
    }else{
        jAlert("Debe confirmar para validar el proceso de eliminar su cuenta.","OJO");
    }
});

//-------------------------------BOTON PARA VOLVER----------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('volver_app').addEventListener('click', function() 
{
    window.location.replace("/main");

});



