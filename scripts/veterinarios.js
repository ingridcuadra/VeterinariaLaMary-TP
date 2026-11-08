

const btonAgregarVeterinario = document.getElementById("btnAgregarVeterinario");
const contenedorFormulario = document.getElementById('contenedorFormulario');
const modalVeterinario = new bootstrap.Modal(document.getElementById('contenedorFormulario'));
const formulario = document.getElementById("form-veterinarios");
const campoMatricula = document.getElementById("matricula");
const camposRegistro = [
    campoMatricula,
    document.getElementById("nombre"),
    document.getElementById("especialidad"),
    document.getElementById("valorConsulta")
];
const saveButton = document.querySelector("#botonRegistrarVeterinario");
const tablaVeterinarios = document.getElementById("tablaVeterinarios");
const alertSinResultados = document.getElementById("alert-sin-resultados");
const inputBuscarVeterinario = document.getElementById("inputBuscarVeterinario");
const contenedorTabla = document.getElementById("contenedor-tabla-veterinarios");
const alertSinVeterinarios = document.getElementById("alert-sin-veterinarios");
const contenedorTotal = document.getElementById("total-veterinarios-contenedor");
const total = document.getElementById("total-veterinarios");
const thead = document.querySelector('table thead');
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
const nombreVeterinarioEliminar = document.getElementById("nombreVeterinarioEliminar");
const botonConfirmarEliminar = document.getElementById("confirmarEliminar");
const titleElement = document.querySelector("#tituloFormulario");
const formStateElement = document.querySelector("#estadoFormulario");

let idVeterinarioEliminar = null;
let columnaOrden = "matricula";
let direccionOrden = "asc";
let idVeterinarioEdit = null;

const camposTocados = new Set();
let mostrarErroresRegistro = false;

const mensajesValidacion = {
    matriculaRequerida: "La matrícula es obligatoria.",
    matriculaDuplicada: "Ya existe un veterinario registrado con esta matrícula.",
    nombreRequerido: "El nombre es obligatorio.",
    especialidadRequerida: "Seleccioná una especialidad.",
    valorConsultaRequerido: "El valor de consulta es obligatorio.",
    valorConsultaInvalido: "Ingresá un valor numérico válido mayor a 0."
};
/* const statusMessage = document.querySelector("#mensajeEstado");*/

btonAgregarVeterinario.addEventListener('click', () => {
    resetForm();
    modalVeterinario.show();
    matriculaEditar = null;
});

function obtenerVeterinarios() {
    try {
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios") || "[]");
        return Array.isArray(veterinarios) ? veterinarios : [];
    } catch (error) {
        mostrarMensaje("Error al obtener datos almacenados.", "danger");
        return [];
    }
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const alerta = document.getElementById('mensajeEstado');
    alerta.textContent = mensaje;
    alerta.className = `alert alert-${tipo} mx-5 mt-3`;

    setTimeout(() => {
        alerta.classList.add('d-none');
    }, 3000);
}

function obtenerErrorCampo(campo) {
    const veterinarios = obtenerVeterinarios();
    const valor = campo.value.trim();

    if (!valor) {
        if (campo === campoMatricula) {
            return mensajesValidacion.matriculaRequerida;
        }
        if (campo.id === "nombre") {
            return mensajesValidacion.nombreRequerido;
        }
        if (campo.id === "especialidad") {
            return mensajesValidacion.especialidadRequerida;
        }
        return mensajesValidacion.valorConsultaRequerido;
    }

    if (campo === campoMatricula) {
        const matriculaNormalizada = valor.toLocaleLowerCase();
        const matriculaDuplicada = veterinarios.some(
            (v) =>
                v.idVeterinario !== idVeterinarioEdit &&
                v.matricula.trim().toLocaleLowerCase() === matriculaNormalizada
        );

        if (matriculaDuplicada) {
            return mensajesValidacion.matriculaDuplicada;
        }
    }

    if (campo.id === "valorConsulta") {
        const esNumeroValido = /^\d+(?:[.,]\d+)?$/.test(valor);
        const valorNumerico = Number(valor.replace(",", "."));

        if (!esNumeroValido || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            return mensajesValidacion.valorConsultaInvalido;
        }
    }

    return "";
}

function actualizarEstadoCampo(campo) {
    const mensajeError = obtenerErrorCampo(campo);
    const feedback = document.getElementById(`${campo.id}-feedback`);
    const mostrarError = mostrarErroresRegistro || camposTocados.has(campo);

    campo.classList.toggle("is-invalid", Boolean(mensajeError && mostrarError));
    campo.classList.toggle("is-valid", !mensajeError && campo.value.trim() !== "");
    campo.setAttribute("aria-invalid", String(Boolean(mensajeError && mostrarError)));

    if (feedback) {
        feedback.textContent = mensajeError;
        feedback.classList.toggle("d-block", Boolean(mensajeError && mostrarError));
    }

    return !mensajeError;
}


function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

function render() {
    let veterinarios = obtenerVeterinarios();
    const contadorTotal = document.getElementById("total-veterinarios");
    const inputBuscar = document.getElementById("inputBuscar");
    const textoBusqueda = inputBuscar ? inputBuscar.value.toLowerCase().trim() : '';

    if (textoBusqueda !== '') {
        veterinarios = veterinarios.filter((v) =>
            v.nombre.toLowerCase().includes(textoBusqueda) ||
            v.matricula.toLowerCase().includes(textoBusqueda) ||
            v.especialidad.toLowerCase().includes(textoBusqueda) ||
            String(v.valorConsulta).toLowerCase().includes(textoBusqueda)
        );
    }

    tablaVeterinarios.replaceChildren(); // Limpiar la tabla antes de renderizar

    veterinarios.sort((a, b) => {
        let valorA = a[columnaOrden];
        let valorB = b[columnaOrden];
        let comparacion = 0;

        if (typeof valorA === "number" && typeof valorB === "number") {
            comparacion = valorA - valorB;
        } else {
            comparacion = String(valorA).localeCompare(String(valorB));
        }
        return direccionOrden === "asc" ? comparacion : -comparacion;
    });

    if (contadorTotal) {
        contadorTotal.textContent = veterinarios.length;
    }

    const hayVeterinariosRegistrados = obtenerVeterinarios().length > 0;
    const hayResultados = veterinarios.length > 0;

    contenedorTabla.hidden = !hayResultados;
    contenedorTotal.hidden = !hayResultados;

    alertSinVeterinarios.hidden = hayVeterinariosRegistrados;
    alertSinResultados.hidden = !hayVeterinariosRegistrados || hayResultados;

    if (!hayResultados) {
        return;
    } else {
        veterinarios.forEach((veterinario) => {
            const row = document.createElement("tr");
            row.append(
                createCell(veterinario.matricula),
                createCell(veterinario.nombre),
                createCell(veterinario.especialidad),
                createCell(`$${veterinario.valorConsulta}`)
            );
            const actionsCell = document.createElement("td");
            actionsCell.className = "table-actions text-end pe-4";

            const actions = document.createElement("div");
            actions.className = "d-flex gap-3 justify-content-end flex-nowrap";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-icon btn-icon-primary btn-editar";
            editButton.dataset.id = veterinario.idVeterinario;
            editButton.setAttribute(
                "aria-label",
                `Editar ${veterinario.nombre}`
            );
            editButton.innerHTML =
                '<i class="fa-solid fa-pen" aria-hidden="true"></i>';


            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-icon btn-icon-danger btn-eliminar";
            deleteButton.dataset.id = veterinario.idVeterinario;
            deleteButton.setAttribute(
                "aria-label",
                `Eliminar ${veterinario.nombre}`
            );
            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
            ;

            actions.append(editButton, deleteButton);
            actionsCell.append(actions);
            row.append(actionsCell);
            tablaVeterinarios.append(row);
        });
    };
}


camposRegistro.forEach((campo) => {
    campo.addEventListener("input", () => {
        camposTocados.add(campo);
        validarFormulario();
    });
    campo.addEventListener("change", () => {
        camposTocados.add(campo);
        validarFormulario();
    });
    campo.addEventListener("blur", () => {
        camposTocados.add(campo);
        validarFormulario();
    });
});

function guardarVeterinario(veterinarios) {
    try {
        localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
        return true;
    } catch (error) {
        mostrarMensaje("Error al guardar datos del veterinario.", "danger");
        return false;
    }
}



function eliminarVeterinario(id) {
    const veterinarios = obtenerVeterinarios();
    const veterinario = veterinarios.find((v) => v.idVeterinario === id);

    if (!veterinario) return;

    idVeterinarioEliminar = id;
    nombreVeterinarioEliminar.textContent = veterinario.nombre;
    modalEliminar.show();
}


botonConfirmarEliminar.addEventListener("click", () => {
    if (!idVeterinarioEliminar) return;
    
    const veterinarios = obtenerVeterinarios();
    const indice = veterinarios.findIndex((v) => v.idVeterinario === idVeterinarioEliminar);

    if (indice === -1) return;

    veterinarios.splice(indice, 1);
    if (guardarVeterinario(veterinarios)) {
        modalEliminar.hide();
        mostrarMensaje("El veterinario se eliminó correctamente.", "success");
        render();
    }
    
    idVeterinarioEliminar = null;
});


function editarVeterinario(id) {
    const veterinarios = obtenerVeterinarios();
    const veterinario = veterinarios.find((v) => v.idVeterinario === id);

    if (!veterinario) {
        mostrarMensaje("Veterinario no encontrado.", "danger");
        return;
    }

    document.getElementById("matricula").value = veterinario.matricula;
    document.getElementById("nombre").value = veterinario.nombre;
    document.getElementById("especialidad").value = veterinario.especialidad;
    document.getElementById("valorConsulta").value = veterinario.valorConsulta;
    
    idVeterinarioEdit = id
    titleElement.textContent = "Editar veterinario";
    formStateElement.textContent = "Editar veterinario";
    modalVeterinario.show();
}

function resetForm() {
    idVeterinarioEdit = null;
    formulario.reset();
    titleElement.textContent = "Registrar veterinario";
    formStateElement.textContent = "Nuevo veterinario";

    mostrarErrores = false;
    camposTocados.clear();

    camposRegistro.forEach((campo) => {
        campo.classList.remove("is-valid", "is-invalid");
        campo.removeAttribute("aria-invalid");

        const feedback = document.getElementById(`${campo.id}-feedback`);

        if (feedback) {
            feedback.textContent = "";
            feedback.classList.remove("d-block");
        }
    });
    
    mostrarErroresRegistro = false;
    validarFormulario();
}

function validarFormulario() {
   const formularioValido = camposRegistro
      .map((campo) => actualizarEstadoCampo(campo))
      .every(Boolean);

   saveButton.disabled = !formularioValido;

   return formularioValido;
}

thead.addEventListener('click', (event) => {
    const th = event.target.closest('th');
    if (!th || !th.dataset.columna) return;

    const columnaseleccionada = th.dataset.columna;
    if (columnaOrden === columnaseleccionada) {
        direccionOrden = direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
        columnaOrden = columnaseleccionada;
        direccionOrden = 'asc';
    }
    render();
});

tablaVeterinarios.addEventListener('click', (event) => {
    const botonEditar = event.target.closest('.btn-editar');
    const botonEliminar = event.target.closest('.btn-eliminar');

    if (botonEditar) {
        const id = botonEditar.dataset.id;
        editarVeterinario(id);
    } else if (botonEliminar) {
        const id = botonEliminar.dataset.id;
        eliminarVeterinario(id);
    }
});

formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarErroresRegistro = true;

    if (!validarFormulario()) return;

    const datos = new FormData(formulario);
    const veterinarios = obtenerVeterinarios();

    const datosVeterinario = {
        matricula: datos.get("matricula").trim(),
        nombre: datos.get("nombre").trim(),
        especialidad: datos.get("especialidad").trim(),
        valorConsulta: Number(datos.get("valorConsulta").trim().replace(",", "."))
    };

    if (idVeterinarioEdit) {
        const indice = veterinarios.findIndex((v) => v.idVeterinario === idVeterinarioEdit);
        if (indice !== -1) {
            veterinarios[indice] = { idVeterinario: idVeterinarioEdit, ...datosVeterinario };
        }
    } else {
        const nuevoveterinario = { idVeterinario: crypto.randomUUID(), ...datosVeterinario };
        veterinarios.push(nuevoveterinario);
        mostrarMensaje("El veterinario se registró correctamente.");
    }

    if (guardarVeterinario(veterinarios)) {
        formulario.reset();
        modalVeterinario.hide();
        matriculaEditar = null;
        render();
    }
})

const inputBuscar = document.getElementById('inputBuscar');
if (inputBuscar) {
    inputBuscar.addEventListener('input', render);
}

render();