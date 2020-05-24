// ARCHIVO PARA PROCESAR LA PARTE PRINCIPAL DE LA APLICACION (TEMP-HUM) (UTILIZANDO JQUERY)
//SANTIAGO GARCIA ARANGO
//---------------------------------------------------------------------------------------

//-----------------------------BOTON DE SALIRSE------------------------------------------
//Agregamos "EventListener" para procesar click en boton
document.getElementById('salir_usuario').addEventListener('click', function() {
    window.location.replace("/");//Redirigimos el usuario al login principal (y se cierra sesion)

});


//Agregamos "EventListener" para procesar click en boton
document.getElementById('password_change_button').addEventListener('click', function() {
    window.location.replace('/change_password')
    
});




