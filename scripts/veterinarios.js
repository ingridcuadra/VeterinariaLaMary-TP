const veterinarios = JSON.parse(localStorage.getItem("veterinarios") || "[]");

const formulario = document.getElementById("form-veterinarios");
const campoMatricula = document.getElementById("matricula");
const camposRegistro = [
    campoMatricula,
    document.getElementById("nombre"),
    document.getElementById("especializacion"),
    document.getElementById("valorConsulta")
];
const botonRegistrar = document.getElementById("botonRegistrarVeterinario");
const listadoVete = document.getElementById("lista-veterinarios");
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
const botonGuardarEdicion = document.getElementById("botonGuardarEdicion");
const camposEdicion = [
    campoMatriculaEdicion,
    document.getElementById("editarNombre"),
    document.getElementById("editarEspecializacion"),
    document.getElementById("editarValorConsulta")
];
let idVeterinarioEliminar = null;
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
const statusMessage = document.querySelector("#mensajeEstado");

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

    botonRegistrar.disabled = !registroValido;
    return registroValido;
}


function showMessage(message, type = "success") {
    statusMessage.textContent = message;
    statusMessage.className = `alert alert-${type}`;
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

    botonGuardarEdicion.disabled = !edicionValida;
    return edicionValida;
}

function render() {
    listadoVete.innerHTML = "";

    const hayVeterinarios = veterinarios.length > 0;
    contenedorTabla.hidden = !hayVeterinarios;
    contenedorTotal.hidden = !hayVeterinarios;
    alertSinVeterinarios.hidden = hayVeterinarios;

    veterinarios.forEach((veterinario) => {
        listadoVete.innerHTML += `
            <tr>
                <td>${veterinario.matricula}</td>
                <td>${veterinario.nombre}</td>
                <td>${veterinario.especializacion}</td> 
                <td>$${veterinario.valorConsulta}</td>
                <td class="table-actions text-end">
                    <div class="d-flex gap-3 justify-content-end flex-nowrap">
                        <button type="button" class="btn btn-icon btn-icon-primary"
                            aria-label="Editar ${veterinario.nombre}"
                            onclick="editarVeterinario('${veterinario.idVeterinario}')">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="btn btn-icon btn-icon-danger"
                            aria-label="Eliminar ${veterinario.nombre}"
                            onclick="eliminarVeterinario('${veterinario.idVeterinario}')">
                            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
    })

    total.textContent = veterinarios.length;
    validarRegistro();
};

render();

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
    localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
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

    veterinarios.splice(indice, 1);
    guardarVeterinario();
    render();

    idVeterinarioEliminar = null;
    modalEliminar.hide();
});


function editarVeterinario(id) {
    const veterinario = veterinarios.find((veterinario) => veterinario.idVeterinario === id);

    if (!veterinario) return;

    camposEdicion.forEach((campo) => camposTocados.delete(campo));
    mostrarErroresEdicion = false;
    document.getElementById("editarIdVeterinario").value = veterinario.idVeterinario;
    document.getElementById("editarMatricula").value = veterinario.matricula;
    document.getElementById("editarNombre").value = veterinario.nombre;
    document.getElementById("editarEspecializacion").value = veterinario.especializacion;
    document.getElementById("editarValorConsulta").value = veterinario.valorConsulta;

    validarEdicion();
    modalEditar.show();
}


// Hacer que la función sea accesible desde el onclick del htlm
window.editarVeterinario = editarVeterinario;

// GUARDAR LOS CAMBIOS DE LA EDICIÓN
formEditar.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarErroresEdicion = true;

    if (!validarEdicion()) return;

    const id = document.getElementById("editarIdVeterinario").value;
    const veterinario = veterinarios.find((veterinario) => veterinario.idVeterinario === id);
    if (!veterinario) return;

    veterinario.matricula = document.getElementById("editarMatricula").value.trim();
    veterinario.nombre = document.getElementById("editarNombre").value.trim();
    veterinario.especializacion = document.getElementById("editarEspecializacion").value;
    veterinario.valorConsulta = Number(
        document.getElementById("editarValorConsulta").value.trim().replace(",", ".")
    );

    guardarVeterinario();
    render();
    modalEditar.hide();
});



formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarErroresRegistro = true;

    if (!validarRegistro()) return;

    const datos = new FormData(formulario);
    const matricula = datos.get("matricula").trim();
    const nombre = datos.get("nombre").trim();
    const especializacion = datos.get("especializacion").trim();
    const valorConsulta = Number(datos.get("valorConsulta").trim().replace(",", "."));

    const veterinario = {
        idVeterinario: crypto.randomUUID(),
        matricula,
        nombre,
        especializacion,
        valorConsulta
    }
    veterinarios.push(veterinario);
    guardarVeterinario();

    render();
    formulario.reset();
    mostrarErroresRegistro = false;
    camposRegistro.forEach((campo) => {
        camposTocados.delete(campo);
        campo.classList.remove("is-valid", "is-invalid");
        campo.removeAttribute("aria-invalid");
    });
    validarRegistro();
    showMessage("El veterinario se registró correctamente.");
})
