const AUTH_URL = 'https://dummyjson.com/auth/login';
const form = document.getElementById("formInicio");
const msjError = document.getElementById("msjError");
const boton = document.getElementById("inicioSesion");

if (form && msjError && boton) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        msjError.textContent = "";
        boton.disabled = true;
        boton.textContent = "Iniciando sesión...";

        try {
            const datosForm = new FormData(form);

            const usuario = {
                username: datosForm.get("usuario").trim(),
                password: datosForm.get("password").trim(),
            };

            const respuesta = await fetch(AUTH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });

            if (!respuesta.ok) {
                msjError.textContent = "Usuario y/o contraseña incorrecta";
                return;
            }

            const datos = await respuesta.json();
            sessionStorage.setItem("accessToken", datos.accessToken);
            window.location.href = "./panel-admin.html";
        } catch (error) {
            msjError.textContent = "Ocurrió un error, inténtelo nuevamente";
            console.error(error);
        } finally {
            boton.disabled = false;
            boton.textContent = "Iniciar sesión";
        }
    });
}

const paginasProtegidas = [
    "panel-admin.html",
    "mascotas.html",
    "veterinarios.html",
    "turnos.html",
    "historia-clinica.html"
];
const paginaActual = window.location.pathname.split("/").pop();
const accessToken = sessionStorage.getItem("accessToken");

if (paginasProtegidas.includes(paginaActual) && !accessToken) {
    window.location.replace("./login.html");
}