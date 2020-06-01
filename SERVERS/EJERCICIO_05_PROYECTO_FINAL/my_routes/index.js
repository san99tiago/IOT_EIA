//ARCHIVO AUXILIAR PARA "DIRECCION" DE RUTAS DEL SERVIDOR (ROUTER)
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
    database: "iot_proyecto_final" //Base de datos
});



//--------------------------------PROCESAMIENTO DE RUTAS----------------------------------
//-----------------------------------------------------------------------------------------
//Variables importantes para saber usuario actual y verificar si ya ingreso correctamente
var usuario_actual = "";
var ingreso = false;


//----------------------------------HOME---------------------------------------------------


//Principal path para redireccionar  "/home"
my_router.get("/" ,function( request , response ) {
    response.redirect("/home");
});


//Principal path para redireccionar  "/home"
my_router.get("/home" ,function( request , response ) {

    ingreso = 0; //Reseteamos variable ingreso (forma de cerrar sesion desde "home.js")
    usuario_actual = ""; //Reseteamos el nombre del usuario actual en la session

    //Redirigimos archivo html hacia login.html
    response.sendFile( path.join(__dirname,"..", "/public/home.html") );
    console.log("home_entry".green);
});


//----------------------------------LOGIN---------------------------------------------------
//Principal path para redireccionar al "/login"
my_router.get("/login" ,function( request , response ) {

    ingreso = false; //Reseteamos variable ingreso (forma de cerrar sesion desde "main.js")
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
    con.query('SELECT * FROM iot_proyecto_final.usuarios WHERE usuario = ? AND password = ?', [data.usuario, data.password], function(error, result, fields) { 
        
        //Creamos un objeto para recibir info de MySQL
        var info_obtenida = {};

        //almacenamos fila recibida  y la mostramos en terminal
        var info_obtenida =result; 
        console.log(info_obtenida);
        // console.log(typeof(info_obtenida));
        // console.log(info_obtenida[0]);

        //Validamos usuario
        if (info_obtenida.length > 0) {
            ingreso = true;
            usuario_actual = data.usuario;


            //Ahora filtramos si entrada es de USUARIO o de ADMINISTRADOR ( y enviamos mensaje personalizado para el proceso correcto)
            //Nota: como es objeto tipo vector, se accede primero a la posicion donde esta la info y luego al perfil
            if (info_obtenida[0].perfil == "U"){
                response.send("server_user_ok");
                console.log("login_succes_user");
            }
            else if (info_obtenida[0].perfil == "A"){
                response.send("server_admin_ok");
                console.log("login_succes_admin");
            }



        } else {   
            response.send('usuario_o_password_incorrectos');
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

    //Si es primer acceso como tal enviamos nombre del usuario almacenado globalmente (sino, aceptamos post normal)
    if (data.first_access == "yes"){
        //Enviamos info valiosa para procesar nombre del usuario
        //(recordar que info del usuario es unica de la session)
        response.send("usuario:" + usuario_actual );
    }else{
        if ( data.new_password_1 == data.new_password_2){
            console.log("CONTRASENNAS IGUALES");

            //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
            con.query('SELECT * FROM iot_proyecto_final.usuarios WHERE usuario = ? AND password = ?', [data.actual_usuario, data.actual_password], function(error, results, fields) { 
                
                //Creamos un objeto para recibir info de MySQL
                var info_obtenida = {};

                //almacenamos fila recibida  y la mostramos en terminal
                var info_obtenida = results; 
                console.log(info_obtenida);

                //Validamos que Usuario y Contrasenna indicados sean correctos (para proceder a cambiarlos)
                if (info_obtenida.length > 0) {

                    //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
                    con.query('UPDATE iot_proyecto_final.usuarios SET `password` = ? WHERE (`usuario` = ? )', [data.new_password_1, data.actual_usuario], function(error, results, fields) { 
                        
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
    }
});







//-----------------------------------------CREAR NUEVO USUARIO-----------------------------------------------
//Redireccion a url path para crear un nuevo usuario
my_router.get("/crear_usuario" ,function( request , response ) {
    // De esta forma "renderiamos" archivo HTML
    //Llevamos a HTML asociado    
    response.sendFile( path.join(__dirname ,"..", "/public/crear_usuario.html") );

    //Mostramos en terimnal todo OK
    console.log("crear_usuario_entry".blue);
});

my_router.post("/crear_usuario",function(request,response) {

    var data = request.body;
    console.log(data);


    if ( data.nuevo_password_1 == data.nuevo_password_2){
        console.log("CONTRASENNAS IGUALES".green);

        //QUERY para verificar que usuario NO exista previamente (evitar 2 nombres de usuario iguales)
        con.query('SELECT * FROM iot_proyecto_final.usuarios WHERE usuario = ? ', [data.nuevo_usuario], function(error, results, fields) { 
            
            //Creamos un objeto para recibir info de MySQL
            var info_obtenida = {};

            //almacenamos fila recibida  y la mostramos en terminal
            var info_obtenida = results; 
            console.log(info_obtenida);

            //Al validar que usuario NO exista (de lo contrario, enviar que ya existe usuario)
            if (info_obtenida.length == 0) {

                //En caso de que hayan dejado algo vacio de la info necesaria, debe haber error e indicarlo en HTML como alerta (osea enviamos error_falta_datos)
                if( data.new_password_1=="" || data.nuevo_nombre=="" || data.nuevo_apellido =="" || data.nuevo_usuario=="" || data.nuevo_edad=="" || data.nuevo_sexo=="" || data.nuevo_pais=="" ){
                    response.send("error_falta_datos");
                    console.log("FALTAN DATOS POR LLENAR DE LA INFO".red)
                }else{
                    //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
                    con.query('INSERT INTO iot_proyecto_final.usuarios (`nombre`, `apellido`, `usuario`, `password`, `edad`, `sexo`, `pais`, `perfil`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', [data.nuevo_nombre, data.nuevo_apellido , data.nuevo_usuario, data.nuevo_password_2, data.nuevo_edad, data.nuevo_sexo, data.nuevo_pais, data.nuevo_perfil], function(error, results, fields) { 
                        
                        //Creamos un objeto para recibir info de MySQL
                        var info_obtenida = {};
                        //almacenamos fila recibida  y la mostramos en terminal
                        var info_obtenida = results; 
                        console.log(info_obtenida);
                        response.send("crear_usuario_ok");
                    });  
                }

            }else{
                //Si hay respuesta (mayor a cero), implica que SI existe usuario igual, por lo que debe responderse esto...
                response.send("usuario_existente_ojo");
                console.log("USUARIO_EXISTENTE".red);
            }
        
        
        
        });        
    }else{
        response.send("datos_error");
        console.log("CONTRASENNAS DIFERENTES");
    }
});







//-----------------------------------------ELIMINAR USUARIO-----------------------------------------------
//Redireccion a url path para eliminar un usuario ya existente
my_router.get("/eliminar_usuario" ,function( request , response ) {
    
    //Solamente damos acceso, si usuario ya esta con ingreso correcto
    if (ingreso){
        // De esta forma "renderiamos" archivo HTML
        //Llevamos a HTML asociado    
        response.sendFile( path.join(__dirname ,"..", "/public/eliminar_usuario.html") );
        
        //Mostramos en terimnal todo OK
        console.log("eliminar_usuario_entry".red);
    }else{
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/');
    }
});

my_router.post("/eliminar_usuario",function(request,response) {
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal enviamos nombre del usuario almacenado globalmente (sino, aceptamos post normal)
    if (data.first_access == "yes"){
        //Enviamos info valiosa para procesar nombre del usuario
        //(recordar que info del usuario es unica de la session)
        response.send("usuario:" + usuario_actual );
    }else{

        con.query('SELECT * FROM iot_proyecto_final.usuarios WHERE usuario = ? AND password = ?', [data.usuario_eliminar, data.password_eliminar], function(error, result, fields) { 
            
            //Creamos un objeto para recibir info de MySQL
            var info_obtenida = {};
            
            //almacenamos fila recibida  y la mostramos en terminal
            var info_obtenida =result; 
            console.log(info_obtenida);
            
            //Validamos usuario y aplicamos query para eliminarlo de la base de datos!!!
            if (info_obtenida.length > 0) {
                
                con.query('DELETE FROM iot_proyecto_final.usuarios WHERE (usuario = ?);', [data.usuario_eliminar], function(error, result, fields) { 
    
                    //Cargamos info de respuesta query
                    info_obtenida = result;
                    console.log(info_obtenida);
    
                    //Unicamente indicamos que usuario se creo si la fila afectada de la respuesta corresponde a 1 (osea cambio exitoso)
                    if (info_obtenida.affectedRows == "1" || info_obtenida == "2"){
                        response.send("usuario_eliminado");
                    }else{
                        response.send("error_vuelva_luego");
                    }
    
                });
            }else{   
                response.send('datos_error_auth');
            }           
        });
    }
    
    
});













//-----------------------------------------MAIN LOGIN TO INFO-----------------------------------------------
my_router.get("/main",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_user".red.bgYellow);
        //Enviamos ultimo dato realizado con POST desde el ESP8266 al servidor (objeto con info)
        response.sendFile( path.join(__dirname, "..", "/public/main.html") );

    } else {
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/');
    }
});


my_router.post("/main",function(request,response) {
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "admin.js", el cual tiene toda la info obtenida de usuarios de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los dtos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.tabla_datos;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con todos los usuarios)
            response.send( info_obtenida );
        });

    }else{
        // if (data.admin_que_hacer == "admin_eliminar_usuario"){

        // }
        // else if (){
            
        // }

    }

    
});










//-----------------------------------------MAIN LOGIN TO ADMIN-----------------------------------------------
my_router.get("/admin",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_admin".red.bgYellow);
        response.sendFile( path.join(__dirname, "..", "/public/admin.html") );
    } else {
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/');
    }
});


my_router.post("/admin",function(request,response) {
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "admin.js", el cual tiene toda la info obtenida de usuarios de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los usuarios de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.usuarios;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;
            // console.log( info_obtenida.length );

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con todos los usuarios)
            response.send( info_obtenida );
        });
    }else{
        if (data.admin_que_hacer == "admin_eliminar_usuario"){
            //ELIMINAR USUARIO
            con.query('SELECT * FROM iot_proyecto_final.usuarios WHERE usuario = ? ', [data.admin_usuario_elegido], function(error, result, fields) { 
                
                //Creamos un objeto para recibir info de MySQL
                var info_obtenida = {};
                
                //almacenamos fila recibida  y la mostramos en terminal
                var info_obtenida =result; 
                console.log(info_obtenida);
                
                //Validamos usuario y aplicamos query para eliminarlo de la base de datos!!!
                if (info_obtenida.length > 0) {
                    
                    con.query('DELETE FROM iot_proyecto_final.usuarios WHERE (usuario = ?);', [data.admin_usuario_elegido], function(error, result, fields) { 
        
                        //Cargamos info de respuesta query
                        info_obtenida = result;
                        console.log(info_obtenida);
        
                        //Unicamente indicamos que usuario se creo si la fila afectada de la respuesta corresponde a 1 (osea cambio exitoso)
                        if (info_obtenida.affectedRows == "1" || info_obtenida == "2"){
                            response.send("datos_actualizados_ok");
                        }else{
                            response.send("error_datos_usuario");
                        }
        
                    });
                }else{   
                    response.send('no_existe_usuario');
                }           
            });

        }
        else if (data.admin_que_hacer == "admin_actualizar_dato_usuario"){
            
            //ACTUALIZAR DATO ESPECIFICADO DESDE OPCIONES DE PAGINA WEB
            con.query('SELECT * FROM iot_proyecto_final.usuarios WHERE usuario = ? ', [data.admin_usuario_elegido], function(error, result, fields) { 
                
                //Creamos un objeto para recibir info de MySQL
                var info_obtenida = {};
                
                //almacenamos fila recibida  y la mostramos en terminal
                var info_obtenida =result; 
                console.log(info_obtenida);
                
                //Validamos usuario y aplicamos query para eliminarlo de la base de datos!!!
                if (info_obtenida.length > 0) {

                    //Obtenemos ID del usuario a editar (para no tener problemas con cambios de datos y privacidad de Mysql)
                    var ID_actual = info_obtenida[0].id;
                    console.log(ID_actual);
        
                    con.query('UPDATE iot_proyecto_final.usuarios SET '+ data.admin_dato_cambiar + '= ? WHERE (id = ?)', [ data.admin_nuevo_dato , ID_actual], function(error, result, fields) { 
        
                        //Cargamos info de respuesta query
                        info_obtenida = result;
                        console.log(info_obtenida);
                        console.log(error);
        
                        //Unicamente indicamos que usuario se actualizo si la fila afectada de la respuesta corresponde a 1 (osea cambio exitoso)
                        if (error){
                            response.send("error_datos_usuario");
                        }else{
                            response.send("datos_actualizados_ok");
                        }
        
                    });
                }else{   
                    response.send('no_existe_usuario');
                }           
            });


        }

    }

    
});


//--------------------------------------MAIN LOGIN TO TEMPERATURA-HUMEDAD---------------------------------------------
my_router.get("/temp_hum",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_temp_hum".red.bgYellow);
        response.sendFile( path.join(__dirname, "..", "/public/temp_hum.html") );
    } else {
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/login');
    }
});


my_router.post("/temp_hum",function(request,response) {
    
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "temp_hum.js", el cual tiene toda la info obtenida de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.temp_hum;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( info_obtenida );
        });
    }
    else if (data.first_access == "no"){
        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.temp_hum;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;
            // console.log( info_obtenida.length )

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( info_obtenida );
        });
        


    }

    
});



//--------------------------------------MAIN LOGIN TO LUZ---------------------------------------------
my_router.get("/luz",function(request,response) {
    //Solamente se ingresa si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_luz".red.bgYellow);
        response.sendFile( path.join(__dirname, "..", "/public/luz.html") );
    } else {
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/login');
    }
});


my_router.post("/luz",function(request,response) {
    
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "temp_hum.js", el cual tiene toda la info obtenida de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.luz;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( info_obtenida );
        });
    }
    else if (data.first_access == "no"){
        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.luz;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;
            // console.log( info_obtenida.length )

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( info_obtenida );
        });
        


    }

    
});





//--------------------------------------MAIN LOGIN TO TEMPERATURA-HUMEDAD---------------------------------------------
my_router.get("/ph",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_ph".red.bgYellow);
        response.sendFile( path.join(__dirname, "..", "/public/ph.html") );
    } else {
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/login');
    }
});


my_router.post("/ph",function(request,response) {
    
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "temp_hum.js", el cual tiene toda la info obtenida de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.ph;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( info_obtenida );
        });
    }
    else if (data.first_access == "no"){
        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.ph;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;
            // console.log( info_obtenida.length )

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( info_obtenida );
        });
        


    }

    
});




//--------------------------------------MAIN LOGIN TO ESTADISTICAS---------------------------------------------
my_router.get("/estadisticas",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_ph".red.bgYellow);
        response.sendFile( path.join(__dirname, "..", "/public/estadisticas.html") );
    } else {
        response.sendFile( path.join(__dirname ,"..", "/public/login.html") );
        response.redirect('/login');
    }
});


my_router.post("/estadisticas",function(request,response) {
    
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "temp_hum.js", el cual tiene toda la info obtenida de mysql
    if (data.first_access == "yes"){

        //Variable para enviar toda la info en un objeto 
        var objeto_total = {};


        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.temp_hum;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;


            //Variables para estadisticas temp-hum
            var total_temp = 0;
            var total_hum = 0;
            var cantidad_datos_temp = 0;
            var cantidad_datos_hum = 0;
            var promedio_temp = 0;
            var promedio_hum = 0;
            var max_temp = 0;
            var max_hum = 0;
            var min_temp = 10000;
            var min_hum = 10000;

            if(info_obtenida.length > 0){

                for (i=0 ; i<info_obtenida.length ; i++){

                    total_temp = total_temp + parseInt( info_obtenida[i].temp );
                    total_hum = total_hum + parseInt( info_obtenida[i].hum );
                    if (info_obtenida[i].temp > max_temp){
                        max_temp = info_obtenida[i].temp;
                    }
                    if (info_obtenida[i].temp < min_temp){
                        min_temp = info_obtenida[i].temp
                    }
    
                    if (info_obtenida[i].hum > max_hum){
                        max_hum = info_obtenida[i].hum;
                    }
                    if (info_obtenida[i].hum < min_hum){
                        min_hum = info_obtenida[i].hum
                    }
                }
                cantidad_datos_temp = info_obtenida.length;
                cantidad_datos_hum = info_obtenida.length;
                promedio_temp = total_temp/cantidad_datos_temp;
                promedio_hum = total_hum/cantidad_datos_hum;


                objeto_total.promedio_temp = promedio_temp;
                objeto_total.max_temp = max_temp;
                objeto_total.min_temp = min_temp;
                objeto_total.cantidad_datos_temp = cantidad_datos_temp;

                objeto_total.promedio_hum = promedio_hum;
                objeto_total.max_hum = max_hum;
                objeto_total.min_hum = min_hum;
                objeto_total.cantidad_datos_hum = cantidad_datos_hum;

            }



        });

        //Hacemos QUERY para obtener info de todos los datos de la base de datos de Mysql
        con.query('SELECT * FROM iot_proyecto_final.ph;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;


            //Variables para estadisticas temp-hum
            var total_ph = 0;
            var cantidad_datos_ph = 0;
            var promedio_ph = 0;
            var max_ph = 0;
            var min_ph = 10000;

            if(info_obtenida.length > 0){

                for (i=0 ; i<info_obtenida.length ; i++){

                    total_ph= total_ph + parseInt( info_obtenida[i].ph );
                    if (info_obtenida[i].ph > max_ph){
                        max_ph = info_obtenida[i].ph;
                    }
                    if (info_obtenida[i].ph < min_ph){
                        min_ph = info_obtenida[i].ph
                    }

                }
                cantidad_datos_ph = info_obtenida.length;
                promedio_ph = total_ph/cantidad_datos_ph;


                objeto_total.promedio_ph = promedio_ph;
                objeto_total.max_ph = max_ph;
                objeto_total.min_ph = min_ph;
                objeto_total.cantidad_datos_ph = cantidad_datos_ph;

            }

            console.log( objeto_total );

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con info)
            response.send( objeto_total );
        });


    }
    
    
});





















//------------------------------------ESP POST RECIBIR INFO TEMP HUM------------------------------------------

my_router.post("/esp_post_temp_hum" ,function( request , response ) {

    let data = request.body;

    //En caso de que llegue algo que NO este vacio
    if (data.temp != "" && data.hum != ""){
        console.log(data);

        //Obtenemos datos de tempertura y humedad desde el post obtenido
        var temp = data.temp;
        var hum = data.hum;

        //Generamos datos de fecha para el servidor
        var d = new Date()
        console.log( d.getFullYear().toString().bgGreen );
        console.log( ( d.getMonth()+1).toString().bgGreen );
        console.log( d.getDate().toString().bgGreen );
        console.log( d.getHours().toString().bgGreen );
        console.log( d.getMinutes().toString().bgGreen );

        var anno = d.getFullYear().toString() ;
        var mes =  ( d.getMonth()+1 ).toString() ;
        var dia =  d.getDate().toString() ;
        var hora =  d.getHours().toString() ;
        var minuto = d.getMinutes().toString() ;

        //Realizamos query para agregar datos recibidos a la base de datos
        con.query('INSERT INTO iot_proyecto_final.temp_hum (temp, hum, anno, mes, dia, hora, minuto) VALUES (?, ?, ?, ?, ?, ?, ?);', 
        [ temp , hum, anno, mes, dia, hora, minuto], function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            info_obtenida = result;
            console.log(info_obtenida);

            //Unicamente indicamos que usuario se actualizo si la fila afectada de la respuesta corresponde a 1 (osea cambio exitoso)
            if (error){
                response.send("error_post");
            }else{
                response.status(200);
                response.send("post_recibido_ok");
            }

        });

        



    }else{
        response.status(400);
        response.send("POST_ERROR");
    }


});




//------------------------------------ESP POST RECIBIR INFO TEMP HUM------------------------------------------

my_router.post("/esp_post_luz" ,function( request , response ) {

    let data = request.body;

    //En caso de que llegue algo que NO este vacio
    if (data.luz != ""){
        console.log(data);

        //Obtenemos datos de tempertura y humedad desde el post obtenido
        var luz = data.luz;

        //Generamos datos de fecha para el servidor
        var d = new Date()
        console.log( d.getFullYear().toString().bgGreen );
        console.log( ( d.getMonth()+1).toString().bgGreen );
        console.log( d.getDate().toString().bgGreen );
        console.log( d.getHours().toString().bgGreen );
        console.log( d.getMinutes().toString().bgGreen );

        var anno = d.getFullYear().toString() ;
        var mes =  ( d.getMonth()+1 ).toString() ;
        var dia =  d.getDate().toString() ;
        var hora =  d.getHours().toString() ;
        var minuto = d.getMinutes().toString() ;

        //Realizamos query para agregar datos recibidos a la base de datos
        con.query('INSERT INTO iot_proyecto_final.luz (luz, anno, mes, dia, hora, minuto) VALUES (?, ?, ?, ?, ?, ?);', 
        [ luz, anno, mes, dia, hora, minuto], function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            info_obtenida = result;
            console.log(info_obtenida);

            //Unicamente indicamos que usuario se actualizo si la fila afectada de la respuesta corresponde a 1 (osea cambio exitoso)
            if (error){
                response.send("error_post");
            }else{
                response.status(200);
                response.send("post_recibido_ok");
            }

        });

        



    }else{
        response.status(400);
        response.send("POST_ERROR");
    }


});





//------------------------------------ESP POST RECIBIR INFO TEMP HUM------------------------------------------

my_router.post("/esp_post_ph" ,function( request , response ) {

    let data = request.body;

    //En caso de que llegue algo que NO este vacio
    if (data.ph != ""){
        console.log(data);

        //Obtenemos datos de tempertura y humedad desde el post obtenido
        var ph = data.ph;

        //Generamos datos de fecha para el servidor
        var d = new Date()
        console.log( d.getFullYear().toString().bgGreen );
        console.log( ( d.getMonth()+1).toString().bgGreen );
        console.log( d.getDate().toString().bgGreen );
        console.log( d.getHours().toString().bgGreen );
        console.log( d.getMinutes().toString().bgGreen );

        var anno = d.getFullYear().toString() ;
        var mes =  ( d.getMonth()+1 ).toString() ;
        var dia =  d.getDate().toString() ;
        var hora =  d.getHours().toString() ;
        var minuto = d.getMinutes().toString() ;

        //Realizamos query para agregar datos recibidos a la base de datos
        con.query('INSERT INTO iot_proyecto_final.ph (ph, anno, mes, dia, hora, minuto) VALUES (?, ?, ?, ?, ?, ?);', 
        [ ph, anno, mes, dia, hora, minuto], function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            info_obtenida = result;
            console.log(info_obtenida);

            //Unicamente indicamos que usuario se actualizo si la fila afectada de la respuesta corresponde a 1 (osea cambio exitoso)
            if (error){
                response.send("error_post");
            }else{
                response.status(200);
                response.send("post_recibido_ok");
            }

        });

        



    }else{
        response.status(400);
        response.send("POST_ERROR");
    }


});











//-------------------------------EXPORTAMOS MY_ROUTER---------------------------------
//Exportamos este modulo para usarlo en "server.js" y ser mucho mas organizados
module.exports = my_router;

