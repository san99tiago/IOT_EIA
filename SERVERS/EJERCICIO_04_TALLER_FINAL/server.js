// SERVIDOR PRINCIPAL PARA EL TALLER FINAL DE IOT (VER DETALLES EN PDF ANEXO)
//SANTIAGO GARCIA ARANGO, MAYO 2020, IOT
//-----------------------------------------------------------------------------


//------------------------------COLORS (terminal)---------------------------
//Package that allows us to print with colors in terminals (more fancy)
const colors = require('colors');


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
