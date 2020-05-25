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



//------------------------------MOSTRAR TABLA DINAMICA------------------------------------------
var info_principal = {
    first_access: "yes",
};

var vector_usuarios = {};

function mostrar_tabla_segun_usuarios() {
    $.post({
        //Redirigimos el path para acceder al login(esta vez con post)
        url: "/admin",
        
        //Convertimos objeto de datos de usuario a formato JSON
        data: JSON.stringify(info_principal),
        //Indicamos Header para enviar info de tipo JSON
        contentType: "application/json",
        
        //En caso de lograr correcto POST
        //nota: (datos_Entrada es la respuesta enviada desde el index.js)
        success: function(datosEntrada,status) {
            //Vector donde almacenamos la info que nos llega en el vector de usuarios enviado desde index.js
            vector_usuarios = datosEntrada;

            for (i = 0; i < vector_usuarios.length; i++) {
                //Utilizamos JQUERY para efectuar un cambio estrategico y llenar el <tbody> de la tabla de usuarios
                $('#tabla_usuarios_dinamica > tbody:last-child').append(
                    '<tr><td>' + vector_usuarios[i].id + 
                    '</td><td>' + vector_usuarios[i].nombre + 
                    '</td><td>' + vector_usuarios[i].apellido + 
                    '</td><td>' + vector_usuarios[i].usuario + 
                    '</td><td>' + vector_usuarios[i].password + 
                    '</td><td>' + vector_usuarios[i].edad + 
                    '</td><td>' + vector_usuarios[i].sexo + 
                    '</td><td>' + vector_usuarios[i].pais + 
                    '</td><td>' + vector_usuarios[i].perfil + 
                    '</td></tr>');
            }   
        }
    });
}








