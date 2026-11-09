import { obtenerVeterinarios } from "./storage.js";

const seccionProfesionales = document.getElementById("profesionales");
const especializaciones = {
    Cardiologia: "Cardiología",
    Dermatologia: "Dermatología",
    Oftalmologia: "Oftalmología"
};
const IMAGEN_PREDETERMINADA = "./assets/imgs/vet-predeterminado.png";
const IMAGEN_BASE64_PERMITIDA = /^data:image\/(?:jpeg|png|webp|avif);base64,/i;

function renderProfesionales() {
    if (!seccionProfesionales) return;

    const veterinarios = obtenerVeterinarios();
    seccionProfesionales.replaceChildren();

    if (veterinarios.length === 0) return;

    seccionProfesionales.className = "profesionales py-5";
    seccionProfesionales.insertAdjacentHTML("afterbegin", `
        <div class="container">
            <div class="text-center mb-5">
                <h2>Nuestros profesionales</h2>
                <p>Conocé a nuestro equipo de especialistas</p>
            </div>
            <div id="lista-profesionales" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 m-5 justify-content-center"></div>
        </div>
    `);

    const listaProfesionales = seccionProfesionales.querySelector("#lista-profesionales");

    veterinarios.forEach((veterinario) => {
        const cargo = especializaciones[veterinario.especializacion] || veterinario.especializacion;
        const columna = document.createElement("div");
        columna.className = "col";

        const tarjeta = document.createElement("div");
        tarjeta.className = "card h-100";

        const imagen = document.createElement("img");
        const imagenGuardada = IMAGEN_BASE64_PERMITIDA.test(veterinario.imagen || "")
            ? veterinario.imagen
            : IMAGEN_PREDETERMINADA;
        imagen.src = imagenGuardada;
        imagen.className = "card-img-top h-100 object-fit-cover";
        imagen.alt = `${veterinario.nombre} - ${cargo}`;

        const cuerpo = document.createElement("div");
        cuerpo.className = "card-body text-center";

        const nombre = document.createElement("h5");
        nombre.className = "card-title";
        nombre.textContent = veterinario.nombre;

        const cargoElemento = document.createElement("p");
        cargoElemento.className = "card-text";
        cargoElemento.textContent = cargo;

        cuerpo.append(nombre, cargoElemento);
        tarjeta.append(imagen, cuerpo);
        columna.append(tarjeta);
        listaProfesionales.append(columna);
    });
}

renderProfesionales();
window.addEventListener("pageshow", renderProfesionales);
window.addEventListener("storage", (event) => {
    if (event.key === "veterinarios") renderProfesionales();
});
