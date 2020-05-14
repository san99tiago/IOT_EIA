var na="";
var ap="";
var ed="";

function procesar_datos(){
    na = document.getElementById("nombre").value;
    ap = document.getElementById("apellido").value;
    ed = document.getElementById("edad").value;

    document.getElementById("li1").innerHTML = na;
    document.getElementById("li2").innerHTML = ap;
    document.getElementById("li3").innerHTML = ed;

}