const opcionAdmin = document.getElementById("opcionAdmin");
const btnSesion = document.getElementById("btnInicio");

// Consultar si existe un token
const token = sessionStorage.getItem("accessToken");

// Mostrar u ocultar opciones
if (opcionAdmin) {
    opcionAdmin.classList.toggle("d-none", !token);
}

// Operador ternario para cambiar el texto
if (btnSesion) {
    btnSesion.textContent = token ? "Salir" : "Ingresar";
    btnSesion.classList.toggle("btn-danger", Boolean(token));
    btnSesion.classList.toggle("btn-primary", !token);

    // Cambiar comportamiento del botón
    btnSesion.addEventListener("click", (e) => {
        if (token) {
            e.preventDefault();

            sessionStorage.removeItem("accessToken");

            const estaEnPages = window.location.pathname.includes("/pages/");
            window.location.href = estaEnPages ? "../index.html" : "./index.html";
        }
    });
}