import {
    obtenerMascotas,
    obtenerVeterinarios,
    mostrarMensaje,
    obtenerTurnos,
    guardarTurnos,
    inicializarTooltips
} from "./storage.js";

const btnAgregarTurno = document.getElementById('btnAgregarTurno');
const contenedorFormulario = document.getElementById('contenedorFormulario');
const modalTurno = new bootstrap.Modal(contenedorFormulario);
const formulario = document.getElementById('formularioTurno');
const tablaTurnos = document.getElementById('tablaTurnos');
inicializarTooltips(tablaTurnos);
const thead = document.querySelector('table thead');
const alertSinResultados = document.getElementById("alert-sin-resultados");
const contenedorTabla = document.querySelector("#contenedor-tabla-turnos");
const alertSinTurnos = document.querySelector("#alert-sin-turnos");
const modalEliminarTurno = new bootstrap.Modal(document.querySelector("#modalEliminarTurno"));
const diaTurnoEliminar = document.querySelector("#diaTurnoEliminar");
const botonConfirmarEliminar = document.querySelector("#confirmarEliminarTurno");
const titleElement = document.querySelector("#tituloFormulario");
const saveButton = document.querySelector("#botonGuardar");
const camposRegistro = [
    formulario.elements.diaTurno,
    formulario.elements.horaTurno,
    formulario.elements.nombreMascota,
    formulario.elements.nombreVeterinario
];
const horariosTurno = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30", "17:00", "17:30", "18:00"
];

const camposTocados = new Set();
let mostrarErrores = false;

let idTurnoEdit = null;
let columnaOrden = "diaTurno";
let direccionOrden = 'asc';
let idTurnoEliminar = null;

cargarDesplegableHorarios();

btnAgregarTurno.addEventListener('click', () => {
    resetForm();
    obtenerExternos();
    actualizarHorasDisponibles();
    validarFormulario();
    modalTurno.show();
    idTurnoEdit = null;
});

function cargarDesplegableHorarios() {
    const selectHora = formulario.elements.horaTurno;
    horariosTurno.forEach(horario => {
        const option = document.createElement("option");
        option.value = horario;
        option.textContent = `${horario} hs`;
        selectHora.appendChild(option);
    });
}

function obtenerFechaLocal() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}


function obtenerExternos() {
    const selectMascotas = document.getElementById('nombreMascota')
    const selectVets = document.getElementById('nombreVeterinario')

    const mascotas = obtenerMascotas();
    const veterinarios = obtenerVeterinarios();

    selectMascotas.innerHTML = '<option value="" selected hidden>Seleccionar...</option>';
    mascotas.forEach(m => {
        const option = document.createElement('option');
        const nombre = m.nombreMascota || m.nombre || 'Sin nombre';
        const duenio = m.nombreDuenio || (typeof m.duenio === 'string' ? m.duenio : '') || 'Sin dueño';

        option.value = m.idMascota || nombre;
        option.dataset.nombreMascota = nombre;
        option.dataset.nombreDuenio = duenio;
        option.textContent = `${nombre} (Dueño: ${duenio})`;
        selectMascotas.appendChild(option);
    });

    selectVets.innerHTML = '<option value="" selected hidden>Seleccionar...</option>';
    veterinarios.forEach(v => {
        const option = document.createElement('option');
        const nombreCompleto = (v.nombre
            ? `${v.nombre} ${v.apellido || ''}`
            : v.nombreVeterinario || '').trim();
        option.value = nombreCompleto;
        option.textContent = nombreCompleto;
        selectVets.appendChild(option);
    });
}

function render() {
    let turnos = obtenerTurnos();
    const contadorTurnos = document.getElementById('contadorTurnos');
    const inputBuscar = document.getElementById('inputBuscar');
    const textoBusqueda = inputBuscar ? inputBuscar.value.toLowerCase().trim() : '';

    if (textoBusqueda !== '') {
        turnos = turnos.filter((m) =>
            m.diaTurno.toLowerCase().includes(textoBusqueda) ||
            m.horaTurno.toLowerCase().includes(textoBusqueda) ||
            m.nombreMascota.toLowerCase().includes(textoBusqueda) ||
            m.nombreVeterinario.toLowerCase().includes(textoBusqueda)
        );
    }

    tablaTurnos.replaceChildren(); // Limpiar la tabla antes de renderizar

    turnos.sort((a, b) => {
        let valorA = a[columnaOrden];
        let valorB = b[columnaOrden];
        let comparacion = 0;

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            comparacion = valorA - valorB;
        } else {
            comparacion = String(valorA).localeCompare(String(valorB));
        }
        return direccionOrden === 'asc' ? comparacion : -comparacion;
    });

    if (contadorTurnos) {
        contadorTurnos.textContent = turnos.length;
    }

    const hayTurnosRegistradas = obtenerTurnos().length > 0;
    const hayResultados = turnos.length > 0;

    contenedorTabla.hidden = !hayResultados;
    document.getElementById("total-turnos-contenedor").hidden = !hayResultados;

    alertSinTurnos.hidden = hayTurnosRegistradas;
    alertSinResultados.hidden =
        !hayTurnosRegistradas || hayResultados;

    if (!hayResultados) {
        return;
    } else {
        turnos.forEach((turno) => {
            const row = document.createElement("tr");
            row.append(
                createCell(formatearFechaAR(turno.diaTurno)),
                createCell(turno.horaTurno),
                createCell(turno.nombreMascota),
                createCell(turno.nombreVeterinario),
            );

            const actionsCell = document.createElement("td");
            actionsCell.className = "table-actions text-end pe-4";

            const actions = document.createElement("div");
            actions.className = "d-flex gap-3 justify-content-end flex-nowrap";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-icon btn-icon-primary btn-editar";
            editButton.dataset.bsToggle = "tooltip";
            editButton.dataset.bsTitle = "Editar turno";
            editButton.dataset.id = turno.idTurno;
            editButton.setAttribute(
                "aria-label",
                `Editar ${turno.diaTurno}`
            );
            editButton.innerHTML =
                '<i class="fa-solid fa-pen" aria-hidden="true"></i>';


            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-icon btn-icon-danger btn-eliminar";
            deleteButton.dataset.bsToggle = "tooltip";
            deleteButton.dataset.bsTitle = "Eliminar";
            deleteButton.dataset.id = turno.idTurno;
            deleteButton.setAttribute(
                "aria-label",
                `Eliminar ${turno.diaTurno}`
            );
            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
            ;

            actions.append(editButton, deleteButton);
            actionsCell.append(actions);
            row.append(actionsCell);
            tablaTurnos.append(row);
        });
    };
}

function formatearFechaAR(fechaIso) {
    if (!fechaIso) return '';
    const [anio, mes, dia] = fechaIso.split('-');
    return `${dia}/${mes}/${anio}`;
}

function editarTurno(id) {
    const turnos = obtenerTurnos();
    const turno = turnos.find((m) => m.idTurno === id);

    if (!turno) {
        mostrarMensaje('Turno no encontrado.', 'danger');
        return;
    }

    // 1. Asignar el ID al principio para que actualizarHorasDisponibles sepa cuál ignorar
    idTurnoEdit = id;

    // 2. Cargar datos y selects
    obtenerExternos();
    const mascotas = obtenerMascotas();
    const mascotaDelTurno = mascotas.find(m => m.idMascota === turno.idMascota)
        || mascotas.find(m => (m.nombreMascota || m.nombre) === turno.nombreMascota);
    document.getElementById("diaTurno").value = turno.diaTurno;
    actualizarHorasDisponibles();
    document.getElementById("horaTurno").value = turno.horaTurno;
    document.getElementById("nombreMascota").value = mascotaDelTurno
        ? (mascotaDelTurno.idMascota || mascotaDelTurno.nombreMascota || mascotaDelTurno.nombre)
        : "";
    document.getElementById("nombreVeterinario").value = turno.nombreVeterinario;

    titleElement.textContent = "Editar turno";
    validarFormulario();
    modalTurno.show();
}

function eliminarTurno(id) {
    const turnos = obtenerTurnos();
    const turno = turnos.find((m) => m.idTurno === id);

    if (!turno) {
        mostrarMensaje('Turno no encontrado.', 'danger');
        return;
    } else {
        idTurnoEliminar = id;
        diaTurnoEliminar.textContent = turno.diaTurno;

        modalEliminarTurno.show();
    }
}

botonConfirmarEliminar.addEventListener("click", () => {
    const turnos = obtenerTurnos();
    const indice = turnos.findIndex(
        (turno) => turno.idTurno === idTurnoEliminar
    );

    if (indice === -1) return;

    turnos.splice(indice, 1);
    if (guardarTurnos(turnos)) {
        modalEliminarTurno.hide();
        mostrarMensaje('Turno eliminada correctamente.', 'success');
        render();
    }

    idTurnoEliminar = null;

});

function obtenerErrorCampo(campo) {
    const valor = campo.value.trim();
    if (!valor) {
        const mensajes = {
            diaTurno: "Seleccioná el día del turno.",
            horaTurno: "Seleccioná un horario.",
            nombreMascota: "Seleccioná una mascota.",
            nombreVeterinario: "Seleccioná un veterinario."
        };
        return mensajes[campo.id] || "Este campo es obligatorio.";
    }

    if (campo.id === "diaTurno") {
        if (Number.isNaN(new Date(`${valor}T00:00:00`).getTime())) {
            return "Ingresá una fecha válida.";
        }
        if (valor < obtenerFechaLocal()) {
            return "El turno no puede ser anterior a hoy.";
        }
    }

    if (campo.id === "horaTurno" && campo.selectedOptions[0]?.disabled) {
        return "Ese horario ya está ocupado para la fecha seleccionada.";
    }

    return "";
}

function actualizarEstadoCampo(campo) {
    const mensajeError = obtenerErrorCampo(campo);
    const feedback = document.getElementById(`${campo.id}-feedback`);
    const mostrarError = mostrarErrores || camposTocados.has(campo);

    campo.classList.toggle(
        "is-invalid",
        Boolean(mensajeError && mostrarError)
    );

    campo.classList.toggle(
        "is-valid",
        !mensajeError && campo.value.trim() !== ""
    );

    campo.setAttribute(
        "aria-invalid",
        String(Boolean(mensajeError && mostrarError))
    );

    if (feedback) {
        feedback.textContent = mensajeError;
        feedback.classList.toggle(
            "d-block",
            Boolean(mensajeError && mostrarError)
        );
    }

    return !mensajeError;
}

function resetForm() {
    idTurnoEdit = null;
    formulario.reset();
    titleElement.textContent = "Registrar turno";

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

    validarFormulario();
}

function validarFormulario() {
    const formularioValido = camposRegistro
        .map((campo) => actualizarEstadoCampo(campo))
        .every(Boolean);

    saveButton.disabled = !formularioValido;

    return formularioValido;
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

tablaTurnos.addEventListener('click', (event) => {
    const botonEditar = event.target.closest('.btn-editar');
    const botonEliminar = event.target.closest('.btn-eliminar');

    if (botonEditar) {
        const id = botonEditar.dataset.id;
        editarTurno(id);
    } else if (botonEliminar) {
        const id = botonEliminar.dataset.id;
        eliminarTurno(id);
    }
});

formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    mostrarErrores = true;

    if (!validarFormulario()) {
        return;
    }

    const datos = new FormData(formulario);
    const turnos = obtenerTurnos();
    const mascotaSeleccionada = formulario.elements.nombreMascota.selectedOptions[0];

    const datosTurno = {
        diaTurno: datos.get('diaTurno').trim(),
        horaTurno: datos.get('horaTurno').trim(),
        idMascota: mascotaSeleccionada.value,
        nombreMascota: mascotaSeleccionada.dataset.nombreMascota,
        nombreDuenio: mascotaSeleccionada.dataset.nombreDuenio,
        nombreVeterinario: datos.get('nombreVeterinario'),
    }

    const esEdicion = Boolean(idTurnoEdit);
    if (esEdicion) {
        const indice = turnos.findIndex((m) => m.idTurno === idTurnoEdit);
        if (indice === -1) {
            mostrarMensaje('Turno no encontrado.', 'danger');
            return;
        }
        turnos[indice] = { idTurno: idTurnoEdit, ...datosTurno };
    } else {
        const nuevoTurno = { idTurno: crypto.randomUUID(), ...datosTurno };
        turnos.push(nuevoTurno);
    }
    if (guardarTurnos(turnos)) {
        mostrarMensaje(
            esEdicion ? '¡Turno actualizado con éxito!' : 'Turno registrado correctamente.',
            'success'
        );
        resetForm();
        modalTurno.hide();
        render();
    }
});

const inputBuscar = document.getElementById('inputBuscar');
if (inputBuscar) {
    inputBuscar.addEventListener('input', render);
}

function actualizarHorasDisponibles() {
    const fechaSeleccionada = document.getElementById("diaTurno").value;
    const selectHora = document.getElementById("horaTurno");

    const turnos = obtenerTurnos();
    const horasOcupadas = turnos
        .filter(t => t.diaTurno === fechaSeleccionada && t.idTurno !== idTurnoEdit)
        .map(t => t.horaTurno);

    Array.from(selectHora.options).forEach(option => {
        if (!option.value) return;

        const estaOcupado = Boolean(fechaSeleccionada) && horasOcupadas.includes(option.value);
        option.disabled = estaOcupado;
        if (estaOcupado) {
            option.textContent = `${option.value} hs (Ocupado)`;
        } else {
            option.textContent = `${option.value} hs`;
        }
    });

    if (horasOcupadas.includes(selectHora.value)) {
        selectHora.value = "";
    }
    validarFormulario();
}

function abrirCalendario() {
    const inputDia = document.getElementById("diaTurno");
    if (typeof inputDia.showPicker === "function") {
        inputDia.showPicker();
    }
}

const inputDia = document.getElementById("diaTurno");
const btnCalendario = document.getElementById("btnCalendario");

if (inputDia) {
    inputDia.setAttribute("min", obtenerFechaLocal());

    inputDia.addEventListener("click", abrirCalendario);
    inputDia.addEventListener("change", actualizarHorasDisponibles);
}

if (btnCalendario) {
    btnCalendario.addEventListener("click", abrirCalendario);
}

render();