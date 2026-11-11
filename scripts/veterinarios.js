import {
    obtenerVeterinarios,
    guardarVeterinario as guardarVeterinariosEnStorage,
    mostrarMensaje,
    inicializarTooltips
} from "./storage.js";

const veterinarios = obtenerVeterinarios();
const TAMANIO_MAXIMO_IMAGEN = 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const IMAGEN_PREDETERMINADA = new URL("../assets/imgs/vet-predeterminado.png", import.meta.url).href;

const formulario = document.getElementById("form-veterinarios");
const campoMatricula = document.getElementById("matricula");
const campoImagen = document.getElementById("imagenVeterinario");
const vistaPreviaImagen = document.getElementById("vistaPreviaImagenVeterinario");
const feedbackImagen = document.getElementById("imagenVeterinario-feedback");
const camposRegistro = [
    campoMatricula,
    document.getElementById("nombre"),
    document.getElementById("especializacion"),
    document.getElementById("valorConsulta")
];
const botonRegistrar = document.getElementById("botonRegistrarVeterinario");
const listadoVete = document.getElementById("lista-veterinarios");
inicializarTooltips(listadoVete);
const alertSinResultados = document.getElementById("alert-sin-resultados");
const inputBuscarVeterinario = document.getElementById("inputBuscarVeterinario");
const contenedorBusquedaVeterinarios = document.getElementById("contenedor-busqueda-veterinarios");
const contenedorTabla = document.getElementById("contenedor-tabla");
const alertSinVeterinarios = document.getElementById("alert-sin-veterinarios");
const contenedorTotal = document.getElementById("total-veterinarios-contenedor");
const total = document.getElementById("total-veterinarios");
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));
const formEditar = document.getElementById("formEditarVeterinario");
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
const nombreVeterinarioEliminar = document.getElementById("nombreVeterinarioEliminar");
const botonConfirmarEliminar = document.getElementById("confirmarEliminar");
const campoMatriculaEdicion = document.getElementById("editarMatricula");
const campoImagenEdicion = document.getElementById("editarImagenVeterinario");
const vistaPreviaImagenEdicion = document.getElementById("vistaPreviaEditarImagenVeterinario");
const feedbackImagenEdicion = document.getElementById("editarImagenVeterinario-feedback");
const botonQuitarImagenEdicion = document.getElementById("botonQuitarImagenEdicion");
const botonGuardarEdicion = document.getElementById("botonGuardarEdicion");
const camposEdicion = [
    campoMatriculaEdicion,
    document.getElementById("editarNombre"),
    document.getElementById("editarEspecializacion"),
    document.getElementById("editarValorConsulta")
];
let idVeterinarioEliminar = null;
let urlPreviaImagen = null;
let urlPreviaImagenEdicion = null;
let imagenEdicionEliminada = false;
const camposTocados = new Set();
let mostrarErroresRegistro = false;
let mostrarErroresEdicion = false;
const mensajesValidacion = {
    matriculaRequerida: "La matrícula es obligatoria.",
    matriculaDuplicada: "Ya existe un veterinario registrado con esta matrícula.",
    nombreRequerido: "El nombre es obligatorio.",
    especializacionRequerida: "Seleccioná una especialización.",
    valorConsultaRequerido: "El valor de consulta es obligatorio.",
    valorConsultaInvalido: "Ingresá un valor numérico válido mayor a 0."
};
function obtenerErrorCampo(campo, veterinarioIdIgnorado = null) {
    const valor = campo.value.trim();

    if (!valor) {
        if (campo === campoMatricula || campo === campoMatriculaEdicion) {
            return mensajesValidacion.matriculaRequerida;
        }
        if (campo.id === "nombre" || campo.id === "editarNombre") {
            return mensajesValidacion.nombreRequerido;
        }
        if (campo.id === "especializacion" || campo.id === "editarEspecializacion") {
            return mensajesValidacion.especializacionRequerida;
        }
        return mensajesValidacion.valorConsultaRequerido;
    }

    if (campo === campoMatricula || campo === campoMatriculaEdicion) {
        const matriculaNormalizada = valor.toLocaleLowerCase();
        const matriculaDuplicada = veterinarios.some(
            (veterinario) =>
                veterinario.idVeterinario !== veterinarioIdIgnorado &&
                veterinario.matricula.trim().toLocaleLowerCase() === matriculaNormalizada
        );

        if (matriculaDuplicada) {
            return mensajesValidacion.matriculaDuplicada;
        }
    }

    if (campo.id === "valorConsulta" || campo.id === "editarValorConsulta") {
        const esNumeroValido = /^\d+(?:[.,]\d+)?$/.test(valor);
        const valorNumerico = Number(valor.replace(",", "."));

        if (!esNumeroValido || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            return mensajesValidacion.valorConsultaInvalido;
        }
    }

    return "";
}

function actualizarEstadoCampo(campo, mostrarError, veterinarioIdIgnorado = null) {
    const mensajeError = obtenerErrorCampo(campo, veterinarioIdIgnorado);
    const feedback = document.getElementById(`${campo.id}-feedback`);

    campo.classList.toggle("is-invalid", Boolean(mensajeError && mostrarError));
    campo.classList.toggle("is-valid", !mensajeError && campo.value.trim() !== "");
    campo.setAttribute("aria-invalid", String(Boolean(mensajeError && mostrarError)));

    if (feedback) {
        feedback.textContent = mensajeError;
        feedback.classList.toggle("d-block", Boolean(mensajeError && mostrarError));
    }

    return !mensajeError;
}

function validarRegistro() {
    const registroValido = camposRegistro
        .map((campo) => actualizarEstadoCampo(campo, mostrarErroresRegistro || camposTocados.has(campo)))
        .every(Boolean);
    const imagenValida = actualizarEstadoImagen(
        campoImagen,
        feedbackImagen,
        mostrarErroresRegistro || campoImagen.dataset.tocado === "true"
    );

    botonRegistrar.disabled = !(registroValido && imagenValida);
    return registroValido && imagenValida;
}

function actualizarEstadoImagen(input, feedback, mostrarError) {
    const archivo = input.files[0];
    let mensajeError = "";

    if (archivo && !TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
        mensajeError = "Seleccioná una imagen PNG, JPG, WEBP o AVIF.";
    } else if (archivo && archivo.size > TAMANIO_MAXIMO_IMAGEN) {
        mensajeError = "La imagen no puede superar 1 MB.";
    }

    input.classList.toggle("is-invalid", Boolean(mensajeError && mostrarError));
    input.classList.toggle("is-valid", Boolean(archivo && !mensajeError));
    input.setAttribute("aria-invalid", String(Boolean(mensajeError && mostrarError)));
    feedback.textContent = mensajeError;
    feedback.classList.toggle("d-block", Boolean(mensajeError && mostrarError));
    return !mensajeError;
}

function mostrarVistaPrevia(archivo, imagen, urlActual) {
    if (urlActual) URL.revokeObjectURL(urlActual);
    if (!archivo) {
        imagen.hidden = true;
        imagen.classList.add("d-none");
        return null;
    }

    const url = URL.createObjectURL(archivo);
    imagen.src = url;
    imagen.hidden = false;
    imagen.classList.remove("d-none");
    return url;
}

function mostrarImagenGuardada(imagen, fuente) {
    imagen.onerror = () => {
        imagen.onerror = null;
        imagen.src = IMAGEN_PREDETERMINADA;
    };
    imagen.src = fuente || IMAGEN_PREDETERMINADA;
    imagen.hidden = false;
    imagen.classList.remove("d-none");
}

function actualizarBotonQuitarImagen() {
    const idEdicion = document.getElementById("editarIdVeterinario").value;
    const veterinario = veterinarios.find(item => item.idVeterinario === idEdicion);
    const archivo = campoImagenEdicion.files[0];
    const archivoValido = archivo &&
        TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type) &&
        archivo.size <= TAMANIO_MAXIMO_IMAGEN;

    botonQuitarImagenEdicion.disabled = imagenEdicionEliminada
        ? !archivoValido
        : !archivoValido && !veterinario?.imagen;
}

function convertirImagenABase64(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.addEventListener("load", () => {
            if (typeof lector.result === "string") {
                resolve(lector.result);
            } else {
                reject(new Error("No se pudo leer la imagen seleccionada."));
            }
        });
        lector.addEventListener("error", () => {
            reject(lector.error || new Error("No se pudo leer la imagen seleccionada."));
        });
        lector.readAsDataURL(archivo);
    });
}

function validarEdicion() {
    const idEdicion = document.getElementById("editarIdVeterinario").value;
    const edicionValida = camposEdicion
        .map((campo) => actualizarEstadoCampo(
            campo,
            mostrarErroresEdicion || camposTocados.has(campo),
            idEdicion
        ))
        .every(Boolean);
    const imagenValida = actualizarEstadoImagen(
        campoImagenEdicion,
        feedbackImagenEdicion,
        mostrarErroresEdicion || Boolean(campoImagenEdicion.files[0])
    );

    botonGuardarEdicion.disabled = !(edicionValida && imagenValida);
    return edicionValida && imagenValida;
}

function render() {
    listadoVete.replaceChildren();

    const textoBusqueda = inputBuscarVeterinario.value.trim().toLowerCase();

    const veterinariosFiltrados = veterinarios.filter((veterinario) =>
        [
            veterinario.matricula,
            veterinario.nombre,
            veterinario.especializacion,
            veterinario.valorConsulta
        ].some((dato) => String(dato).toLowerCase().includes(textoBusqueda))
    );

    const hayVeterinariosRegistrados = veterinarios.length > 0;
    const hayResultados = veterinariosFiltrados.length > 0;

    contenedorBusquedaVeterinarios.hidden = !hayVeterinariosRegistrados;
    contenedorTabla.hidden = !hayResultados;
    contenedorTotal.hidden = !hayResultados;

    alertSinVeterinarios.hidden = hayVeterinariosRegistrados;
    alertSinResultados.hidden = !hayVeterinariosRegistrados || hayResultados;

    veterinariosFiltrados.forEach((veterinario) => {
        const fila = document.createElement("tr");
        const imagen = document.createElement("img");
        mostrarImagenGuardada(imagen, veterinario.imagen);
        imagen.alt = `Imagen de ${veterinario.nombre}`;
        imagen.width = 48;
        imagen.height = 48;
        imagen.className = "rounded object-fit-cover";

        const celdaImagen = document.createElement("td");
        celdaImagen.append(imagen);

        const celdaMatricula = document.createElement("td");
        celdaMatricula.textContent = veterinario.matricula;
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = veterinario.nombre;
        const celdaEspecialidad = document.createElement("td");
        celdaEspecialidad.textContent = veterinario.especializacion;
        const celdaValor = document.createElement("td");
        celdaValor.textContent = `$${veterinario.valorConsulta}`;

        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "table-actions text-end";
        const acciones = document.createElement("div");
        acciones.className = "d-flex gap-3 justify-content-end flex-nowrap";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "btn btn-icon btn-icon-primary";
        botonEditar.dataset.bsToggle = "tooltip";
        botonEditar.dataset.bsTitle = "Editar veterinario";
        botonEditar.setAttribute("aria-label", `Editar ${veterinario.nombre}`);
        botonEditar.innerHTML = '<i class="fa-solid fa-pen" aria-hidden="true"></i>';
        botonEditar.addEventListener("click", () => editarVeterinario(veterinario.idVeterinario));

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn btn-icon btn-icon-danger";
        botonEliminar.dataset.bsToggle = "tooltip";
        botonEliminar.dataset.bsTitle = "Eliminar";
        botonEliminar.setAttribute("aria-label", `Eliminar ${veterinario.nombre}`);
        botonEliminar.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
        botonEliminar.addEventListener("click", () => eliminarVeterinario(veterinario.idVeterinario));

        acciones.append(botonEditar, botonEliminar);
        celdaAcciones.append(acciones);
        fila.append(celdaImagen, celdaMatricula, celdaNombre, celdaEspecialidad, celdaValor, celdaAcciones);
        listadoVete.append(fila);
    });

    total.textContent = veterinariosFiltrados.length;
    validarRegistro();
}

inputBuscarVeterinario.addEventListener("input", render);
render();

campoImagen.addEventListener("change", () => {
    campoImagen.dataset.tocado = "true";
    urlPreviaImagen = mostrarVistaPrevia(campoImagen.files[0], vistaPreviaImagen, urlPreviaImagen);
    validarRegistro();
});

campoImagenEdicion.addEventListener("change", () => {
    const imagenValida = actualizarEstadoImagen(campoImagenEdicion, feedbackImagenEdicion, true);
    urlPreviaImagenEdicion = mostrarVistaPrevia(
        campoImagenEdicion.files[0],
        vistaPreviaImagenEdicion,
        urlPreviaImagenEdicion
    );
    if (campoImagenEdicion.files[0] && imagenValida) {
        imagenEdicionEliminada = false;
    }
    if (campoImagenEdicion.files[0] && imagenValida) {
        mostrarImagenGuardada(vistaPreviaImagenEdicion, urlPreviaImagenEdicion);
    } else if (!imagenEdicionEliminada) {
        const veterinario = veterinarios.find(item =>
            item.idVeterinario === document.getElementById("editarIdVeterinario").value
        );
        mostrarImagenGuardada(vistaPreviaImagenEdicion, veterinario?.imagen);
    } else if (!campoImagenEdicion.files[0]) {
        mostrarImagenGuardada(vistaPreviaImagenEdicion, IMAGEN_PREDETERMINADA);
    }
    actualizarBotonQuitarImagen();
    validarEdicion();
});

botonQuitarImagenEdicion.addEventListener("click", () => {
    imagenEdicionEliminada = true;
    campoImagenEdicion.value = "";
    urlPreviaImagenEdicion = mostrarVistaPrevia(
        null,
        vistaPreviaImagenEdicion,
        urlPreviaImagenEdicion
    );
    mostrarImagenGuardada(vistaPreviaImagenEdicion, IMAGEN_PREDETERMINADA);
    actualizarEstadoImagen(campoImagenEdicion, feedbackImagenEdicion, false);
    actualizarBotonQuitarImagen();
    validarEdicion();
});

camposRegistro.forEach((campo) => {
    campo.addEventListener("input", () => {
        camposTocados.add(campo);
        validarRegistro();
    });
    campo.addEventListener("change", () => {
        camposTocados.add(campo);
        validarRegistro();
    });
    campo.addEventListener("blur", () => {
        camposTocados.add(campo);
        validarRegistro();
    });
});

camposEdicion.forEach((campo) => {
    campo.addEventListener("input", () => {
        camposTocados.add(campo);
        validarEdicion();
    });
    campo.addEventListener("change", () => {
        camposTocados.add(campo);
        validarEdicion();
    });
    campo.addEventListener("blur", () => {
        camposTocados.add(campo);
        validarEdicion();
    });
});
validarRegistro();

function guardarVeterinario() {
    return guardarVeterinariosEnStorage(veterinarios);
}

function eliminarVeterinario(id) {
    const veterinario = veterinarios.find(
        (veterinario) => veterinario.idVeterinario === id
    );

    if (!veterinario) return;

    idVeterinarioEliminar = id;
    nombreVeterinarioEliminar.textContent = veterinario.nombre;
    modalEliminar.show();
}

window.eliminarVeterinario = eliminarVeterinario;

botonConfirmarEliminar.addEventListener("click", () => {
    if (!idVeterinarioEliminar) return;

    const indice = veterinarios.findIndex(
        (veterinario) =>
            veterinario.idVeterinario === idVeterinarioEliminar
    );

    if (indice === -1) return;

    const [veterinarioEliminado] = veterinarios.splice(indice, 1);

    if (!guardarVeterinario()) {
        veterinarios.splice(indice, 0, veterinarioEliminado);
        return;
    }
    render();

    idVeterinarioEliminar = null;
    modalEliminar.hide();
    mostrarMensaje("Veterinario eliminado con éxito.");
});

function editarVeterinario(id) {
    const veterinario = veterinarios.find((veterinario) => veterinario.idVeterinario === id);

    if (!veterinario) return;

    camposEdicion.forEach((campo) => camposTocados.delete(campo));
    mostrarErroresEdicion = false;
    imagenEdicionEliminada = false;
    urlPreviaImagenEdicion = mostrarVistaPrevia(
        null,
        vistaPreviaImagenEdicion,
        urlPreviaImagenEdicion
    );
    document.getElementById("editarIdVeterinario").value = veterinario.idVeterinario;
    document.getElementById("editarMatricula").value = veterinario.matricula;
    document.getElementById("editarNombre").value = veterinario.nombre;
    document.getElementById("editarEspecializacion").value = veterinario.especializacion;
    document.getElementById("editarValorConsulta").value = veterinario.valorConsulta;
    campoImagenEdicion.value = "";
    mostrarImagenGuardada(vistaPreviaImagenEdicion, veterinario.imagen);
    actualizarBotonQuitarImagen();
    feedbackImagenEdicion.textContent = "";
    feedbackImagenEdicion.classList.remove("d-block");

    validarEdicion();
    modalEditar.show();
}

window.editarVeterinario = editarVeterinario;
formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarErroresEdicion = true;

    if (!validarEdicion()) return;

    const id = document.getElementById("editarIdVeterinario").value;
    const veterinario = veterinarios.find((veterinario) => veterinario.idVeterinario === id);
    if (!veterinario) return;

    const veterinarioAnterior = { ...veterinario };
    botonGuardarEdicion.disabled = true;
    try {
        veterinario.matricula = document.getElementById("editarMatricula").value.trim();
        veterinario.nombre = document.getElementById("editarNombre").value.trim();
        veterinario.especializacion = document.getElementById("editarEspecializacion").value;
        veterinario.valorConsulta = Number(
            document.getElementById("editarValorConsulta").value.trim().replace(",", ".")
        );

        if (campoImagenEdicion.files[0]) {
            veterinario.imagen = await convertirImagenABase64(campoImagenEdicion.files[0]);
        } else if (imagenEdicionEliminada) {
            delete veterinario.imagen;
        }

        if (!guardarVeterinario()) {
            Object.assign(veterinario, veterinarioAnterior);
            return;
        }
        render();
        modalEditar.hide();
        mostrarMensaje("Cambios guardados con éxito.");
    } catch (error) {
        Object.assign(veterinario, veterinarioAnterior);
        console.error(error);
        mostrarMensaje("No se pudo cargar la imagen seleccionada.", "danger");
    } finally {
        botonGuardarEdicion.disabled = false;
    }
});

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarErroresRegistro = true;

    if (!validarRegistro()) return;

    const datos = new FormData(formulario);
    const matricula = datos.get("matricula").trim();
    const nombre = datos.get("nombre").trim();
    const especializacion = datos.get("especializacion").trim();
    const valorConsulta = Number(datos.get("valorConsulta").trim().replace(",", "."));
    botonRegistrar.disabled = true;
    try {
        const veterinario = {
            idVeterinario: crypto.randomUUID(),
            matricula,
            nombre,
            especializacion,
            valorConsulta
        };
        if (campoImagen.files[0]) {
            veterinario.imagen = await convertirImagenABase64(campoImagen.files[0]);
        }
        veterinarios.push(veterinario);
        if (!guardarVeterinario()) {
            veterinarios.pop();
            return;
        }

        render();
        formulario.reset();
        urlPreviaImagen = mostrarVistaPrevia(null, vistaPreviaImagen, urlPreviaImagen);
        campoImagen.classList.remove("is-valid", "is-invalid");
        campoImagen.removeAttribute("aria-invalid");
        delete campoImagen.dataset.tocado;
        mostrarErroresRegistro = false;
        camposRegistro.forEach((campo) => {
            camposTocados.delete(campo);
            campo.classList.remove("is-valid", "is-invalid");
            campo.removeAttribute("aria-invalid");
        });
        validarRegistro();
        mostrarMensaje("El veterinario se registró correctamente.");
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message || "No se pudo cargar la imagen seleccionada.", "danger");
    } finally {
        if (campoImagen.files[0]) botonRegistrar.disabled = false;
        validarRegistro();
    }
})