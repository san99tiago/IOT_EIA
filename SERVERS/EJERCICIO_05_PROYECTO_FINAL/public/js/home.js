// ARCHIVO PARA PROCESAR LA PARTE PRINCIPAL DE HOME DE LA APLICACION(UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//-------------------------------------------------------------------------------------------


//Agregamos "EventListener" para procesar click en boton
document.getElementById('funcion_temp_hum').addEventListener('click', function() {
    window.location.replace("/temp_hum");//Redirigimos el usuario al login principal (y se cierra sesion)
});


//Agregamos "EventListener" para procesar click en boton
document.getElementById('funcion_luz').addEventListener('click', function() {
    window.location.replace("/luz");//Redirigimos el usuario al login principal (y se cierra sesion)
});


//Agregamos "EventListener" para procesar click en boton
document.getElementById('funcion_ph').addEventListener('click', function() {
    window.location.replace("/ph");//Redirigimos el usuario al login principal (y se cierra sesion)
});