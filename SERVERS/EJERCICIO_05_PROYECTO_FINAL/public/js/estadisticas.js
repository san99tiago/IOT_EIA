//------------------------------MOSTRAR ESTADISTICAS------------------------------------------
//Archivo JSON para procesar diferentes eventos segun los botones indicados (first_access nos ayuda a llenar tabla)
var info_principal = {
    first_access: "yes",
};

function mostrar_estadisticas() {
    $.post({
        //Redirigimos el path para acceder a url (esta vez con post)
        url: "/estadisticas",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //Vector donde almacenamos la info que nos llega en el vector de usuarios enviado desde index.js
            vector_datos = datosEntrada;

            //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla dinamica
            $('#tabla_datos_dinamica > tbody:last-child').append(
                '<tr><td>' + "TEMPERATURA"+ 
                '</td><td>' + Number( vector_datos.promedio_temp ).toFixed(3) + 
                '</td><td>' + vector_datos.max_temp + 
                '</td><td>' + vector_datos.min_temp + 
                '</td><td>' + vector_datos.cantidad_datos_temp + 
                '</td></tr>');
            //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla dinamica
            $('#tabla_datos_dinamica > tbody:last-child').append(
                '<tr><td>' + "HUMEDAD"+ 
                '</td><td>' + Number( vector_datos.promedio_hum ).toFixed(3) + 
                '</td><td>' + vector_datos.max_hum + 
                '</td><td>' + vector_datos.min_hum + 
                '</td><td>' + vector_datos.cantidad_datos_hum + 
                '</td></tr>');
            //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla dinamica
            $('#tabla_datos_dinamica > tbody:last-child').append(
                '<tr><td>' + "PH"+ 
                '</td><td>' + Number ( vector_datos.promedio_ph ).toFixed(3) + 
                '</td><td>' + vector_datos.max_ph + 
                '</td><td>' + vector_datos.min_ph + 
                '</td><td>' + vector_datos.cantidad_datos_ph + 
                '</td></tr>');

        }
    });
}