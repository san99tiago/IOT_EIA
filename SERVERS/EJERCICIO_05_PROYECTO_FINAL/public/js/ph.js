// ARCHIVO PARA PROCESAR LA PARTE PRINCIPAL DE PH DE LA APLICACION(UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//-------------------------------------------------------------------------------------------
//Archivo JSON para procesar diferentes eventos segun los botones indicados (first_access nos ayuda a llenar tabla)
var info_principal = {
    first_access: "yes",
    fecha_1_anno: "0",
    fecha_1_mes: "0",
    fecha_1_dia: "0",
    fecha_1_hora: "0",
    fecha_2_anno: "0",
    fecha_2_mes: "0",
    fecha_2_dia: "0",
    fecha_2_hora: "0",
};

var vector_datos = {}; //Nos permite recorrer vector de usuarios que nos llegue desde servidor principal



//------------------------------MOSTRAR TABLA DINAMICA------------------------------------------
function mostrar_tabla_dinamica() {
    $.post({
        //Redirigimos el path para acceder a url (esta vez con post)
        url: "/ph",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //Vector donde almacenamos la info que nos llega en el vector de usuarios enviado desde index.js
            vector_datos = datosEntrada;

            for (i = 0; i < vector_datos.length; i++) {
                //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla de usuarios
                $('#tabla_datos_dinamica > tbody:last-child').append(
                    '<tr><td>' + vector_datos[i].id + 
                    '</td><td>' + vector_datos[i].ph + 
                    '</td><td>' + vector_datos[i].anno + 
                    '</td><td>' + vector_datos[i].mes + 
                    '</td><td>' + vector_datos[i].dia + 
                    '</td><td>' + vector_datos[i].hora + 
                    '</td><td>' + vector_datos[i].minuto + 
                    '</td></tr>');
            }   
        }
    });
}






//-----------------------BOTON PARA PROCESAR NUEVO CAMBIO DE ADMIN------------------------

//Agregamos "EventListener" para procesar click en boton
document.getElementById('filtrar_datos').addEventListener('click', function() {
    info_principal.first_access = "no";
    info_principal.fecha_1_anno = document.getElementById("fecha_1_anno").value;
    info_principal.fecha_1_mes = document.getElementById("fecha_1_mes").value;
    info_principal.fecha_1_dia = document.getElementById("fecha_1_dia").value;
    info_principal.fecha_1_hora = document.getElementById("fecha_1_hora").value;
    info_principal.fecha_2_anno = document.getElementById("fecha_2_anno").value;
    info_principal.fecha_2_mes = document.getElementById("fecha_2_mes").value;
    info_principal.fecha_2_dia = document.getElementById("fecha_2_dia").value;
    info_principal.fecha_2_hora = document.getElementById("fecha_2_hora").value;
    

    //De esta manera utilizamos JQUERY para realizar el POST
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/ph",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {


            //Vector donde almacenamos la info que nos llega en el vector de usuarios enviado desde index.js
            vector_datos = datosEntrada;


            $("#tabla_datos_dinamica tbody").empty();

            // jAlert(vector_datos.length,"LENGHT VECTOR");
            
            for (i = 0; i < vector_datos.length; i++) {

                //Validamos que fecha este en rango correcto... 
                var fecha_1 = new Date(info_principal.fecha_1_anno , info_principal.fecha_1_mes - 1 , info_principal.fecha_1_dia , info_principal.fecha_1_hora);  // -1 porque formate fecha de JS es desde 0 hasta 11
                var fecha_2 = new Date(info_principal.fecha_2_anno , info_principal.fecha_2_mes - 1 , info_principal.fecha_2_dia , info_principal.fecha_2_hora);  // -1 porque formate fecha de JS es desde 0 hasta 11
                var fecha_a_filtrar = new Date(vector_datos[i].anno, vector_datos[i].mes - 1 , vector_datos[i].dia , vector_datos[i].hora);  // -1 porque formate fecha de JS es desde 0 hasta 11

                // jAlert(fecha_1.toString(),"FECHA_1");
                // jAlert(fecha_2.toString(),"FECHA_2");
                
                if(fecha_a_filtrar >= fecha_1 && fecha_a_filtrar <= fecha_2){
                // if(false){

                    //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla de usuarios
                    $('#tabla_datos_dinamica > tbody:last-child').append(
                        '<tr><td>' + vector_datos[i].id + 
                        '</td><td>' + vector_datos[i].ph + 
                        '</td><td>' + vector_datos[i].anno + 
                        '</td><td>' + vector_datos[i].mes + 
                        '</td><td>' + vector_datos[i].dia + 
                        '</td><td>' + vector_datos[i].hora + 
                        '</td><td>' + vector_datos[i].minuto + 
                        '</td></tr>');
                        
                }
            }

        }
    });
});





