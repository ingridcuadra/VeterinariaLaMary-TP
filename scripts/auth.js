
document.addEventListener("DOMContentLoaded", () => {
    inyectarModalLogin();
    actualizarEstadoNavbar();
    proteccionRutas();
});

function inyectarModalLogin() {
    // Código para inyectar el modal de login
    const modalHTML = `
    <div class="modal fade" id="modalLogin" tabindex="-1" aria-labelledby="modalLoginLabel"
        aria-hidden="true">

        <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <h2 class="h5 modal-title fw-bold" id="modalLoginLabel">Iniciar Sesión</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <div id="login-error-feedback" class="alert alert-danger d-none" role="alert"></div>
                        <form id="form-login" novalidate>
                            <div class="mb-3">
                                <label for="login-username" class="form-label">Usuario</label>
                                <input type="text" class="form-control" id="login-username" name="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="login-password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="login-password" name="password" required>
                            </div>
                            <div class="d-grid gap-2 mt-4">
                                <button type="submit" id="btn-submit-login" class="btn btn-primary">Ingresar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    escucharSubmitLogin();
}

function actualizarEstadoNavbar() {
    const usuarioSesion = sessionStorage.getItem("usuarioSesion");

    // Actualizar el estado del navbar según si el usuario está logueado o no
    const navLink = document.querySelector("a[href*='panel-admin.html']");
    if (navLink) {
        const liContainer = navLink.closest(".nav-item");
        if (liContainer) {
            liContainer.classList.toggle("d-none", !usuarioSesion);
        }
    }

    //Selección botón de login navbar
    const btnIngresar = document.querySelector(".navbar .btn-primary, #btnIngresar");
    if (!btnIngresar) return;

    if (usuarioSesion) {
        btnIngresar.textContent = "Salir";
        btnIngresar.classList.replace("btn-primary", "btn-outline-danger");
        btnIngresar.onclick = (e) => {
            e.preventDefault();
            sessionStorage.removeItem("usuarioSesion");
            redirigirA("inicio")
        }
    } else {
        btnIngresar.textContent = "Ingresar";
        btnIngresar.classList.replace("btn-outline-danger", "btn-primary");
        btnIngresar.onclick = (e) => {
            e.preventDefault();
            const modalLogin = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalLogin"));
            modalLogin.show();
        }
    }
}

// Protección de rutas para panel-admin.html
function proteccionRutas() {
    const paginasProtegidas = ["panel-admin.html", "mascotas.html", "veterinarios.html", "turnos.html"];
    const paginaActual = window.location.pathname.split("/").pop();
    const usuarioSesion = sessionStorage.getItem("usuarioSesion");

    if (paginasProtegidas.includes(paginaActual) && !usuarioSesion) {
        redirigirA("inicio");
    }
}

//Login con fetch
function escucharSubmitLogin() {
    const formLogin = document.getElementById("form-login");
    const alertError = document.getElementById("login-error-feedback");

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        alertError.classList.add("d-none");
        const username = formLogin.username.value.trim();
        const password = formLogin.password.value.trim();

        if (!username || !password) {
            alertError.textContent = "Por favor, complete todos los campos.";
            alertError.classList.remove("d-none");
            return;
        }

        try {
            const response = await fetch("https://dummyjson.com/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Credenciales inválidas.");
            }
            // Guardar sesión y redirigir
            sessionStorage.setItem("usuarioSesion", JSON.stringify(data));
            redirigirA("panel")
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalLogin"));
            modalInstance.hide();
            
            redirigirA("panel");
        } catch (error) {
            alertError.textContent = error.message;
            alertError.classList.remove("d-none");
        }
    });
}

function redirigirA(destino) {
    const estaEnPages = window.location.pathname.includes("/pages/");

    if (destino === "panel") {
        window.location.href = estaEnPages ? "./panel-admin.html" : "./pages/panel-admin.html";
    } else if (destino === "inicio") {
        window.location.href = estaEnPages ? "../index.html" : "./index.html";
    }
}