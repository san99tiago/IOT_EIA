//ARCHIVO PRINCIPAL PARA "DIRECCION" DE RUTAS DEL SERVIDOR (ROUTER)
//SANTIAGO GARCIA ARANGO, MAYO 2020, IOT
//---------------------------------------------------------------------------------

//De esta forma vamos a ser mucho mas organizados con las rutas procesadas en servidor.js
//(Recordar que se debe exportar e importar correctamente este "modulo")

//Vamos a utilizar "express" como el intermediario para ser "router"...
//(Decidi llamar esta funcionalidad como "my_router", pero cualquier nombre sirve correctamente)
const express = require('express');
//Inicializamos la funcionalidad "Router" de "express" que nos permite la "re-direccion"
const my_router = express.Router();


//Nos permite obtener "parent directories" para re-dirigir mejor las rutas y archivos html
var path = require("path");


//----------------------------------MYSQL---------------------------------------
//Forma de conectarnos a Base de Datos de MySQL (ya creada en MySQL workbench)
//Creamos variable para menejar mysql a traves de dependencia ya instalada de mysql
var mysql = require('mysql');

//Creamos variable para "conectarnos" con mysql a la base de datos y tabla especifica
var con = mysql.createConnection({
    //Info necesaria para acceder a la base de datos respectiva
    host: "localhost", 
    user: "root",
    password: "coco", 
    database: "iot_taller_final" //Base de datos
});


//--------------------------------PROCESAMIENTO DE RUTAS----------------------------------
//-----------------------------------------------------------------------------------------


//----------------------------------LOGIN---------------------------------------------------
//Variables importantes para saber usuario actual y verificar si ya ingreso correctamente
var usuario_actual = "";
var ingreso = false;

//Principal path para redireccionar al "/login"
my_router.get("/" ,function( request , response ) {
    ingreso = 0; //Reseteamos variable ingreso (forma de cerrar sesion desde "main.js")
    usuario_actual = ""; //Reseteamos el nombre del usuario actual en la session

    //Redirigimos archivo html hacia login.html
    response.sendFile( path.join(__dirname,"..", "/public/login.html") );
    console.log("login_entry".green);
});


my_router.post("/login",function(request,response) {
    //Almacenamos info del body del post (en este caso JSON es contenido de interes)
    let data = request.body;
    console.log(data);

    //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
    con.query('SELECT * FROM iot_taller_final.usuarios WHERE usuario = ? AND password = ?', [data.usuario, data.password], function(error, result, fields) { 
        
        //Creamos un objeto para recibir info de MySQL
        var info_obtenida = {};

        //almacenamos fila recibida  y la mostramos en terminal
        var info_obtenida =result; 
        console.log(info_obtenida);

        //Validamos usuario
        if (info_obtenida.length > 0) {
            ingreso = true;
            usuario_actual = data.usuario;
            response.send("server_ok");
        } else {   
            response.send('Usuario y/o contraseña incorrectos!');
            ingreso = false;
        }           
    });

});






//-----------------------------------------CHANGE PASSWORD-----------------------------------------------
//Redireccion a url path para cambiar password
my_router.get("/change_password" ,function( request , response ) {
    // De esta forma "renderiamos" archivo HTML
    //Llevamos a HTML asociado    
    response.sendFile( path.join(__dirname ,"..", "/public/change_password.html") );

    //Mostramos en terimnal todo OK
    console.log("change_password_entry".red);
});

my_router.post("/change_password",function(request,response) {

    var data = request.body;
    console.log(data);


    if ( data.new_password_1 == data.new_password_2){
        console.log("CONTRASENNAS IGUALES");

        //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
        con.query('SELECT * FROM iot_taller_final.usuarios WHERE usuario = ? AND password = ?', [data.actual_usuario, data.actual_password], function(error, results, fields) { 
            
            //Creamos un objeto para recibir info de MySQL
            var info_obtenida = {};

            //almacenamos fila recibida  y la mostramos en terminal
            var info_obtenida = results; 
            console.log(info_obtenida);

            //Validamos que Usuario y Contrasenna indicados sean correctos (para proceder a cambiarlos)
            if (info_obtenida.length > 0) {

                //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
                con.query('UPDATE iot_taller_final.usuarios SET `password` = ? WHERE (`usuario` = ? )', [data.new_password_1, data.actual_usuario], function(error, results, fields) { 
                    
                    //Creamos un objeto para recibir info de MySQL
                    var info_obtenida = {};
                    //almacenamos fila recibida  y la mostramos en terminal
                    var info_obtenida = results; 
                    console.log(info_obtenida);
                    response.send("datos_ok");

                });  



            }else{
                response.send("datos_error_auth");
            }

        });        


    }else{
        response.send("datos_error");
        console.log("CONTRASENNAS DIFERENTES");
    }




});







//-----------------------------------------ELIMINAR USUARIO-----------------------------------------------
//Redireccion a url path para cambiar password
my_router.get("/eliminar_usuario" ,function( request , response ) {
    // De esta forma "renderiamos" archivo HTML
    //Llevamos a HTML asociado    
    response.sendFile( path.join(__dirname ,"..", "/public/eliminar_usuario.html") );

    //Mostramos en terimnal todo OK
    console.log("change_password_entry".red);
});

my_router.post("/eliminar_usuario",function(request,response) {

    var data = request.body;
    console.log(data);


    if ( data.new_password_1 == data.new_password_2){
        console.log("CONTRASENNAS IGUALES");
        //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
        con.query('SELECT * FROM iot_taller_final.usuarios WHERE usuario = ? AND password = ?', [data.actual_usuario, data.actual_password], function(error, results, fields) { 
            
            //Creamos un objeto para recibir info de MySQL
            var info_obtenida = {};
            //almacenamos fila recibida  y la mostramos en terminal
            var info_obtenida = results; 
            console.log(info_obtenida);
            //Validamos que Usuario y Contrasenna indicados sean correctos (para proceder a cambiarlos)
            if (info_obtenida.length > 0) {
                //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
                con.query('UPDATE iot_taller_final.usuarios SET `password` = ? WHERE (`usuario` = ? )', [data.new_password_1, data.actual_usuario], function(error, results, fields) { 
                    
                    //Creamos un objeto para recibir info de MySQL
                    var info_obtenida = {};
                    //almacenamos fila recibida  y la mostramos en terminal
                    var info_obtenida = results; 
                    console.log(info_obtenida);
                    response.send("datos_ok");
                });  
            }else{
                response.send("datos_error_auth");
            }
        });        
    }else{
        response.send("datos_error");
        console.log("CONTRASENNAS DIFERENTES");
    }
});









//-----------------------------------------MAIN LOGIN TO INFO-----------------------------------------------
my_router.get("/main",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry");
        response.sendFile( path.join(__dirname, "..", "/public/main.html") );
    } else {
        response.send("Traidor, usted NO se ha autentificado, la próxima le cerramos la cuenta.");
    }
});


//------------------------------------ESP POST RECIBIR INFO TEMP HUM------------------------------------------
my_router.post("/esp_post" ,function( request , response ) {

    let data = request.body;

    //En caso de que llegue algo que NO este vacio
    if (data != ""){
        console.log(data);

        var id = data.device_id;
        var temp = data.temp;
        var hum = data.hum;

            
        response.status(200);
        response.send("POST_RECIBIDO_OK");

    }else{
        response.status(400);
        response.send("POST_ERROR");
    }


});





//-------------------------------EXPORTAMOS MY_ROUTER---------------------------------
//Exportamos este modulo para usarlo en "server.js" y ser mucho mas organizados
module.exports = my_router;

