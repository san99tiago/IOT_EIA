//ARCHIVO PRINCIPAL PARA "DIRECCION" DE RUTAS DEL SERVIDOR (ROUTER)
//SANTIAGO GARCIA ARANGO, MAYO 2020, IOT
//---------------------------------------------------------------------------------
//------------------------------COLORS (terminal)---------------------------
//Package that allows us to print with colors in terminals (more fancy)
const colors = require('colors');


//Vamos a utilizar "express" como el intermediario para ser "router"...
//(Decidi llamar esta funcionalidad como "app", pero cualquier nombre sirve correctamente)
const express = require('express');
const app = express();

//De esta forma podremos aprovecharnos de archivos "json" mas adelante
app.use( express.json() );
// Indicamos que accederemos a carpeta public (la creamos nosotros) ...
//...para lo "static" (debe ubicarse en este mismo directorio)
app.use( express.static("public") );



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
    database: "iot_final" //Base de datos
});


//--------------------------------PROCESAMIENTO DE RUTAS----------------------------------
//-----------------------------------------------------------------------------------------


//----------------------------------LOGIN---------------------------------------------------
//Variables importantes para saber usuario actual y verificar si ya ingreso correctamente
var usuario_actual = "";
var ingreso = false;

//Principal path para redireccionar al "/login"
app.get("/" ,function( request , response ) {
    //Redirigimos archivo html hacia login.html
    response.sendFile( path.join(__dirname, "/public/login.html") );
    response.redirect('/login');
});

//Principal path para redireccionar al "/login"
app.get("/login" ,function( request , response ) {

    ingreso = 0; //Reseteamos variable ingreso (forma de cerrar sesion desde "main.js")
    usuario_actual = ""; //Reseteamos el nombre del usuario actual en la session

    //Redirigimos archivo html hacia login.html
    response.sendFile( path.join(__dirname, "/public/login.html") );
    console.log("login_entry".green);
});


app.post("/login",function(request,response) {
    //Almacenamos info del body del post (en este caso JSON es contenido de interes)
    let data = request.body;
    console.log(data);

    //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
    con.query('SELECT * FROM iot_final.usuarios WHERE usuario = ? AND contrasena = ?', [data.usuario, data.password], function(error, result, fields) { 
        
        //Creamos un objeto para recibir info de MySQL
        var info_obtenida = {};

        //almacenamos fila recibida  y la mostramos en terminal
        var info_obtenida = result; 
        console.log(info_obtenida);
        // console.log(typeof(info_obtenida));
        // console.log(info_obtenida[0]);

        //Validamos usuario
        if (info_obtenida.length > 0) {
            ingreso = true;
            usuario_actual = data.usuario;

            response.send("server_user_ok");
            console.log("login_succes_user");
        } else {   
            response.send('usuario_o_password_incorrectos');
            ingreso = false;
        }           
    });

});













//-----------------------------------------CREAR NUEVO USUARIO-----------------------------------------------
//Redireccion a url path para crear un nuevo usuario
app.get("/crear_usuario" ,function( request , response ) {
    // De esta forma "renderiamos" archivo HTML
    //Llevamos a HTML asociado    
    response.sendFile( path.join(__dirname , "/public/crear_usuario.html") );

    //Mostramos en terimnal todo OK
    console.log("crear_usuario_entry".blue);
});

app.post("/crear_usuario",function(request,response) {

    var data = request.body;
    console.log(data);


    if ( data.nuevo_password_1 == data.nuevo_password_2){
        console.log("CONTRASENNAS IGUALES".green);

        //QUERY para verificar que usuario NO exista previamente (evitar 2 nombres de usuario iguales)
        con.query('SELECT * FROM iot_final.usuarios WHERE usuario = ? ', [data.nuevo_usuario], function(error, results, fields) { 
            
            //Creamos un objeto para recibir info de MySQL
            var info_obtenida = {};

            //almacenamos fila recibida  y la mostramos en terminal
            var info_obtenida = results; 
            console.log(info_obtenida);

            //Al validar que usuario NO exista (de lo contrario, enviar que ya existe usuario)
            if (info_obtenida.length == 0) {

                //En caso de que hayan dejado algo vacio de la info necesaria, debe haber error e indicarlo en HTML como alerta (osea enviamos error_falta_datos)
                if( data.new_password_1=="" || data.nuevo_nombre=="" || data.nuevo_usuario=="" ){
                    response.send("error_falta_datos");
                    console.log("FALTAN DATOS POR LLENAR DE LA INFO".red)
                }else{
                    //Hacemos un query al MySQL pidiendo acceso a test_table_1 (usuario y password se remplazan por "user" y "pass" (sintaxis remplazo))
                    con.query('INSERT INTO iot_final.usuarios (`nombre`, `correo`, `usuario`, `contrasena`) VALUES (?, ?, ?, ?);', [data.nuevo_nombre, data.nuevo_correo , data.nuevo_usuario, data.nuevo_password_2], function(error, results, fields) { 
                        
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





//-----------------------------------------HOME-----------------------------------------------
app.get("/home",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_user".red.bgYellow);
        //Enviamos ultimo dato realizado con POST desde el ESP8266 al servidor (objeto con info)
        response.sendFile( path.join(__dirname, "/public/home.html") );

    } else {
        response.sendFile( path.join(__dirname , "/public/login.html") );
        response.redirect('/');
    }
});


//Variable global para poder aplicar filtro e ir a historial de 1 solo paciente
var paciente_filtrar = "";


app.post("/home",function(request,response) {
    
    var data = request.body;
    console.log(data);
    console.log("HOME_OK".bgGreen);
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "admin.js", el cual tiene toda la info obtenida de usuarios de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los dtos de la base de datos de Mysql
        con.query('SELECT * FROM iot_final.pacientes;', function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;

            console.log(result);

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con todos los usuarios)
            response.send( info_obtenida );
        });

    }else{
        paciente_filtrar = data.nombre_paciente_filtrar;
        console.log(paciente_filtrar.red);
        response.send("nombre_paciente_filtro_ok")
    }

    
});






//-----------------------------------------HISTORIAL PACIENTE-----------------------------------------------
app.get("/historial_paciente",function(request,response) {
    //Solamente se ingresa al cuestionario si ya hubo login correcto con MysQL
    if (ingreso) {
        console.log("success_entry_historial".red.bgYellow);
        //Enviamos ultimo dato realizado con POST desde el ESP8266 al servidor (objeto con info)
        response.sendFile( path.join(__dirname, "/public/historial_paciente.html") );

    } else {
        response.sendFile( path.join(__dirname , "/public/login.html") );
        response.redirect('/');
    }
});

app.post("/historial_paciente",function(request,response) {
    
    var data = request.body;
    console.log(data);
    
    //Si es primer acceso como tal, cargamos objeto para enviar hacia "admin.js", el cual tiene toda la info obtenida de usuarios de mysql
    if (data.first_access == "yes"){
        
        //Hacemos QUERY para obtener info de todos los dtos de la base de datos de Mysql
        con.query('SELECT * FROM iot_final.pacientes WHERE nombre = ?;', [ paciente_filtrar ] , function(error, result, fields) { 
        
            //Cargamos info de respuesta query
            var info_obtenida = result;
            console.log(info_obtenida);

            //Mandamaos objeto con la info obtenida por el QUERY (es decir, un vector con todos los usuarios)
            response.send( info_obtenida );
        });

    }

    
});






//------------------------------------ESP POST RECIBIR INFO PACIENTES------------------------------------------


app.post("/esp_post" ,function( request , response ) {

    let data = request.body;

    //En caso de que llegue algo que NO este vacio
    if (data.nombre != "" && data.nivel_medicina != "" && data.nivel_oxigenacion != "" && data.temp_habitacion != ""){
        console.log(data);

        //Obtenemos datos obtenidos
        var nombre = data.nombre;
        var nivel_medicina = data.nivel_medicina;
        var nivel_oxigenacion = data.nivel_oxigenacion;
        var temp_habitacion = data.temp_habitacion;
        var estado_atencion = data.estado_atencion;


        //Realizamos query para agregar datos recibidos a la base de datos
        con.query('INSERT INTO iot_final.pacientes (nombre, nivel_medicina, nivel_oxigenacion, temp_habitacion, estado_atencion) VALUES (?, ?, ?, ?, ?);', 
        [ nombre, nivel_medicina, nivel_oxigenacion, temp_habitacion, estado_atencion], function(error, result, fields) { 
        
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


//------------------------------INICIALIZAMOS SERVIDOR------------------------------
// Esta parte permite indicar el procesamiento correcto, indicando puerto
app.listen( 3000 , function() 
{
    console.log( "server ready... \n listening...".bgGreen );
} 
);

