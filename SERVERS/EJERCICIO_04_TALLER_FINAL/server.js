// SERVIDOR PRINCIPAL PARA EL TALLER FINAL DE IOT (VER DETALLES EN PDF ANEXO)
//SANTIAGO GARCIA ARANGO, MAYO 2020, IOT
//-----------------------------------------------------------------------------


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
    database: "iot_taller_final" //Base de datos
});


// //QUERY BASICO (mostrar info DB)
// con.connect( function(err) {
//     if (err) throw err; //Error handler
//     //indicamos que vamos a trabajar con tabla respectiva
//     con.query("SELECT * FROM test_table_1", function (err, result, fields) {
//         if (err) throw err; //Error handler
//         // console.log(result);
//     });
// });




//-------------------------------EXPRESS-----------------------------------------
// Activamos librerias e inicializamos express
//(ya debemos haber corrido en terminal >>npm install express)
const express = require("express");
const app = express();

//De esta forma podremos aprovecharnos de archivos "json" mas adelante
app.use( express.json() );
// Indicamos que accederemos a carpeta public (la creamos nosotros) ...
//...para lo "static" (debe ubicarse en este mismo directorio)
app.use( express.static("public") );



//-------------------------ACTIVAMOS FUNCIONALIDAD DE ROUTER------------------------
//Ahora "modularizamos" nuestras rutas con carpeta "my_routes" (orden) 
app.use( require('./my_routes/index') );




//------------------------------INICIALIZAMOS SERVIDOR------------------------------
// Esta parte permite indicar el procesamiento correcto, indicando puerto
app.listen( 3000 , function() 
{
    console.log( "server ready... \n listening...".bgGreen );
} 
);
