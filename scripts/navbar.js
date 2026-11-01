const opcionAdmin = document.getElementById("opcionAdmin");
const btnSesion = document.getElementById("btnInicio");

// Consultar si existe un token
const token = sessionStorage.getItem("accessToken");

// Mostrar u ocultar opciones
opcionAdmin.classList.toggle("d-none", !token);

// Operador ternario para cambiar el texto
btnSesion.textContent = token ? "Salir" : "Ingresar";

// Cambiar comportamiento del botón
btnSesion.addEventListener("click", (e) => {
    if (token) {
        e.preventDefault();

        sessionStorage.removeItem("accessToken");

        window.location.href = "../index.html";
    }
});