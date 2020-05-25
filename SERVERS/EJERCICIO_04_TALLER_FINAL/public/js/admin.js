// ARCHIVO PARA PROCESAR LA PARTE PRINCIPAL DE LOS ADMIN DE LA APLICACION(UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//-------------------------------------------------------------------------------------------

//-----------------------------BOTON DE SALIRSE-----------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('salir_admin').addEventListener('click', function() {
    window.location.replace("/");//Redirigimos el usuario al login principal (y se cierra sesion)
});


//------------------------------BOTON CAMBIAR PASSWORD-----------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('password_change_button_admin').addEventListener('click', function() {
    window.location.replace('/change_password')
    
});






