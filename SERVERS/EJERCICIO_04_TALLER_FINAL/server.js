// ARCHIVO MAIN PARA CORRECTO FUNCIONAMIENTO DE NODEJS (Y SERVIDOR)
//Santiago Garcia Arango
//-----------------------------------------------------------------------------

////TEST API PLUGIN GOOGLE MAPS
// const {Client, Status} = require("@googlemaps/google-maps-services-js");
// const client = new Client({});

// client
// .elevation({
//     params: {
//         locations: [{ lat: 45, lng: -110 }],
//         keys: "asdf",
//     },
//     timeout: 1000, // milliseconds
// })
// .then((r) => {
//     if (r.data.status === Status.OK) {
//         console.log(r.data.results[0].elevation);
//     } else {
//         console.log(r.data.error_message);
//     }
// })
// .catch((e) => {
//     console.log(e);
// });





//------------------------------COLORS (terminal)---------------------------
//Package that allows us to print with colors in terminals (more fancy)
const colors = require('colors');

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
    database: "iot_1" //Base de datos
});


//QUERY BASICO (mostrar info DB)
con.connect( function(err) {
    if (err) throw err; //Error handler
    //indicamos que vamos a trabajar con tabla respectiva
    con.query("SELECT * FROM test_table_1", function (err, result, fields) {
        if (err) throw err; //Error handler
        // console.log(result);
    });
});



//-------------------------------EXPRESS-----------------------------------------
// Activamos librerias e inicializamos express
//(ya debemos haber corrido en terminal >>npm install express)
const express = require("express");
const app = express();

app.use( express.json() );
// Indicamos que accederemos a carpeta public (la creamos nosotros) ...
//...para lo "static" (debe ubicarse en este mismo directorio)
app.use( express.static("public") );





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










// Siempre esto debe ir al final
// Esta parte permite indicar el procesamiento correcto, indicando puerto
app.listen( 3000 , function() 
{
    console.log( "server ready... \n listening...".bgGreen );
} 
);
