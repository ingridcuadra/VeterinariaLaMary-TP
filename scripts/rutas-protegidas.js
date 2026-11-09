
const paginasProtegidas = [
    "panel-admin.html",
    "mascotas.html",
    "veterinarios.html",
    "turnos.html",
    "historia-clinica.html"
];

function protegerRuta() {
    const paginaActual = window.location.pathname.split("/").pop();
    const accessToken = sessionStorage.getItem("accessToken");

    if (paginasProtegidas.includes(paginaActual) && !accessToken) {
        window.location.replace("/pages/login.html");
    }
}

// Comprobar el acceso al cargar la página
protegerRuta();

// Volver a comprobar al regresar con el botón Atrás
window.addEventListener("pageshow", protegerRuta);
