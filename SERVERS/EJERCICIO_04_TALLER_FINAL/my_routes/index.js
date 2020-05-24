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


//--------------------------------PROCESAMIENTO DE RUTAS----------------------------


//Principal path para redireccionar al "/login"
app.get("/" ,function( request , response ) {
    // De esta forma "renderiamos" archivo HTML
    response.sendFile( __dirname + "/public/login.html");

    console.log("login_entry");
});

//Variable para procesar y validar el ingreso correcto
var ingreso = false;

app.post("/login",function(request,response) {

    //Almacenamos info del body del post (en este caso JSON es contenido de interes)
    let data = request.body;
    
    console.log(data);


    //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
    con.query('SELECT * FROM test_table_1 WHERE usuario = ? AND password = ?', [data.usuario, data.password], function(error, result, fields) { 
        
        //Creamos un objeto para recibir info de MySQL
        var info_obtenida = {};

        //almacenamos fila recibida  y la mostramos en terminal
        var info_obtenida =result; 
        console.log(info_obtenida);

        //Validamos usuario
        if (info_obtenida.length > 0) {
            ingreso = true;
            response.send("server_ok");
        } else {   
            response.send('Usuario y/o contraseña incorrectos!');
            ingreso = false;
        }           
    });

});






//-------------------TAREA CHANGE PASSWORD--------------------------
//Redireccion a url path para cambiar password
app.get("/change_password" ,function( request , response ) {
    // De esta forma "renderiamos" archivo HTML
    //Llevamos a HTML asociado    
    response.sendFile( __dirname + "/public/change_password.html");

    //Mostramos en terimnal todo OK
    console.log("change_password_entry");
});

app.post("/change_password",function(request,response) {

    var data = request.body;
    console.log(data);

    if ( data.new_password_1 == data.new_password_2){
        console.log("CONTRASENNAS IGUALES");

        //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
        con.query('SELECT * FROM test_table_1 WHERE usuario = ? AND password = ?', [data.actual_usuario, data.actual_password], function(error, results, fields) { 
            
            //Creamos un objeto para recibir info de MySQL
            var info_obtenida = {};

            //almacenamos fila recibida  y la mostramos en terminal
            var info_obtenida = results; 
            console.log(info_obtenida);

            //Validamos que Usuario y Contrasenna indicados sean correctos (para proceder a cambiarlos)
            if (info_obtenida.length > 0) {

                //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
                con.query('UPDATE `iot_1`.`test_table_1` SET `password` = ? WHERE (`usuario` = ? )', [data.new_password_1, data.actual_usuario], function(error, results, fields) { 
                    
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







//-------------------------------------------------------------------

//POST ENSAYOS (seleccionar estrategicamente elementos de cierta columna)
//Esta es para dar usuarios con nombre "san99tiago"
app.post("/test_query_1",function(request,response) {

    //Almacenamos info del body del post (en este caso JSON es contenido de interes)
    let data = request.body;
    
    console.log(data);


    //Hacemos un query al MySQL pidiendo acceso a test_table_2 (con variables obtenidas desde el JSON recibido)
    con.query('INSERT INTO `iot_1`.`test_table_2` (`nombre`, `ciudad`, `pais`, `date_created`) VALUES (?, ?, ?, ?) ', [data.nombre, data.ciudad, data.pais, data.date_created], function(error, result, fields) { 
        
        if (error) {
            console.log(error);
        }
        response.send("ok");
    });

});

//-------------------------------------------------------------------












app.get("/cuestionario",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry");
        response.sendFile(__dirname + "/public/cuestionario.html");
    } else {
    response.send("No se ha autenticado");
    }
});


app.get("/TEST_GET" ,function( request , response ) {

    //Mostramos en terminal que se hizo un GET a "TEST_GET"
    console.log("TEST_GET_DONE");

    
    //Simplemente devolvemos numero aleatorio al usuario
    var aleatorio = Math.random() ;

    response.send( aleatorio.toString() );
    response.status(200);

});




app.post("/TEST_POST" ,function( request , response ) {

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

