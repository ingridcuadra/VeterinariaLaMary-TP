import {
    obtenerMascotas,
    obtenerTurnos,
    obtenerVeterinarios,
    guardarTurnos,
    mostrarMensaje,
    obtenerHistorias,
    guardarHistorias,
    inicializarTooltips
} from "./storage.js";

let idMascotaActual = null;
let ultimoTurnoMascota = null;
let idHistoriaEditando = null;
let idHistoriaEliminar = null;
const thead = document.querySelector('table thead');
let columnaOrden = "diaTurno";
let direccionOrden = 'asc';
const contenedorModal = document.getElementById('contenedorFormulario');
const modalHistoria = contenedorModal ? new bootstrap.Modal(contenedorModal) : null;
const contenedorModalEliminarHistoria = document.getElementById("modalEliminarHistoria");
const modalEliminarHistoria = contenedorModalEliminarHistoria
    ? new bootstrap.Modal(contenedorModalEliminarHistoria)
    : null;
const resumenHistoriaEliminar = document.getElementById("resumenHistoriaEliminar");
const botonConfirmarEliminarHistoria = document.getElementById("confirmarEliminarHistoria");
const formularioHistoria = document.getElementById('formularioHistoria');
const camposTurno = [
    document.getElementById("diaTurno"),
    document.getElementById("horaTurno"),
    document.getElementById("nombreVeterinario")
];
const camposHistoria = [
    document.getElementById("selectTurnoAtencion"),
    document.getElementById("descripcionHistoria")
];
const btnAgregarHistoria = document.getElementById('btnAgregarHistoria');
const btnVolver = document.getElementById('botonVolver');
const btnAgendarTurno = document.getElementById('botonGuardarTurno');
const selectHoraTurno = document.getElementById("horaTurno");
const botonGuardarHistoria = document.getElementById("botonGuardar");
const contenedorTablaHistoria = document.getElementById("contenedor-tabla-historia");
const alertSinHistorias = document.getElementById("alert-sin-historias");
inicializarTooltips(document.getElementById("tablaHistoria"));
const camposTocados = new Set();
let mostrarErroresTurno = false;
let mostrarErroresHistoria = false;
const horariosTurno = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30", "17:00", "17:30", "18:00"
];

document.addEventListener("DOMContentLoaded", () => {
    cargarDesplegableHorarios();
    document.getElementById("diaTurno").min = obtenerFechaLocal();

    const params = new URLSearchParams(window.location.search);
    idMascotaActual = params.get("id");

    if (!idMascotaActual) {
        window.location.href = "./mascotas.html";
        return;
    }

    const mascotas = obtenerMascotas();
    const mascota = mascotas.find(m => m.idMascota === idMascotaActual);

    if (!mascota) {
        mostrarMensaje("Mascota no encontrada.", "danger");
        setTimeout(() => { window.location.href = "./mascotas.html"; }, 1500);
        return;
    }

    document.getElementById("nombreMascota").textContent = mascota.nombreMascota || "-";
    document.getElementById("colorMascota").textContent = mascota.color || "-";
    document.getElementById("edadMascota").textContent = mascota.edad ? `${mascota.edad} años` : "-";
    document.getElementById("pesoMascota").textContent = mascota.peso ? `${mascota.peso} kg` : "-";
    document.getElementById("nombreDuenio").textContent = mascota.nombreDuenio || "-";

    cargarDesplegableVeterinarios();
    validarTurno();

    obtenerUltimoTurno(mascota);
    render();
});

function obtenerFechaLocal() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function obtenerErrorTurno(campo) {
    const valor = campo.value.trim();

    if (!valor) {
        const mensajes = {
            diaTurno: "Seleccioná el día del próximo turno.",
            horaTurno: "Seleccioná un horario.",
            nombreVeterinario: "Seleccioná un veterinario."
        };
        return mensajes[campo.id];
    }

    if (campo.id === "diaTurno") {
        if (Number.isNaN(new Date(`${valor}T00:00:00`).getTime())) {
            return "Ingresá una fecha válida.";
        }
        if (valor < obtenerFechaLocal()) {
            return "El turno no puede ser anterior a hoy.";
        }
    }

    return "";
}

function actualizarEstadoCampo(campo, mensajeError, mostrarError) {
    const feedback = document.getElementById(`${campo.id}-feedback`);
    const tieneError = Boolean(mensajeError);

    campo.classList.toggle("is-invalid", tieneError && mostrarError);
    campo.classList.toggle("is-valid", !tieneError && campo.value.trim() !== "");
    campo.setAttribute("aria-invalid", String(tieneError && mostrarError));
    if (feedback) {
        feedback.textContent = mensajeError;
        feedback.classList.toggle("d-block", tieneError && mostrarError);
    }

    return !tieneError;
}

function validarTurno() {
    const valido = camposTurno
        .map(campo => actualizarEstadoCampo(
            campo,
            obtenerErrorTurno(campo),
            mostrarErroresTurno || camposTocados.has(campo)
        ))
        .every(Boolean);

    btnAgendarTurno.disabled = !valido;
    return valido;
}

function obtenerErrorHistoria(campo) {
    if (campo.id === "selectTurnoAtencion" && !campo.value) {
        return "Seleccioná un turno o una atención.";
    }
    if (campo.id === "descripcionHistoria" && !campo.value.trim()) {
        return "La descripción es obligatoria.";
    }
    return "";
}

function validarHistoria() {
    const valido = camposHistoria
        .map(campo => actualizarEstadoCampo(
            campo,
            obtenerErrorHistoria(campo),
            mostrarErroresHistoria || camposTocados.has(campo)
        ))
        .every(Boolean);

    botonGuardarHistoria.disabled = !valido;
    return valido;
}

camposTurno.forEach(campo => {
    ["input", "change", "blur"].forEach(evento => {
        campo.addEventListener(evento, () => {
            camposTocados.add(campo);
            validarTurno();
        });
    });
});

camposHistoria.forEach(campo => {
    ["input", "change", "blur"].forEach(evento => {
        campo.addEventListener(evento, () => {
            camposTocados.add(campo);
            validarHistoria();
        });
    });
});
validarHistoria();

function cargarDesplegableHorarios() {
    if (!selectHoraTurno) return;

    horariosTurno.forEach(horario => {
        const option = document.createElement("option");
        option.value = horario;
        option.textContent = horario;
        selectHoraTurno.appendChild(option);
    });
}

function formatearFechaAR(fechaIso) {
    if (!fechaIso) return '-';
    const partes = fechaIso.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaIso;
}

function cargarDesplegableVeterinarios() {
    const selectVet = document.getElementById("nombreVeterinario");
    if (!selectVet) return;

    let veterinarios = obtenerVeterinarios();

    selectVet.innerHTML = '<option value="" selected disabled hidden>Seleccionar...</option>';

    veterinarios.length === 0 && selectVet.insertAdjacentHTML('beforeend', '<option value="" disabled>No hay veterinarios registrados</option>');

    veterinarios.forEach(vet => {
        const option = document.createElement("option");
        const nombre = typeof vet === "object"
            ? (vet.nombre || vet.nombreVeterinario || vet.nombreCompleto)
            : vet;

        option.value = nombre;
        option.textContent = nombre;
        selectVet.appendChild(option);
    });
}

function obtenerUltimoTurno(mascota) {
    const turnos = obtenerTurnos();

    const turnosMascota = turnos.filter(t =>
        (t.idMascota && t.idMascota === mascota.idMascota) ||
        (t.nombreMascota && t.nombreMascota.toLowerCase().includes(mascota.nombreMascota.toLowerCase()))
    );

    if (turnosMascota.length > 0) {
        turnosMascota.sort((a, b) => b.diaTurno.localeCompare(a.diaTurno));
        ultimoTurnoMascota = turnosMascota[0];
    } else {
        ultimoTurnoMascota = null;
    }
}

const formularioTurno = document.getElementById("formularioMascota");
if (formularioTurno) {
    formularioTurno.addEventListener("submit", (event) => {
        event.preventDefault();
        mostrarErroresTurno = true;

        if (!validarTurno()) return;

        const [campoDia, campoHora, campoVeterinario] = camposTurno;
        const turnos = obtenerTurnos();
        turnos.push({
            idTurno: crypto.randomUUID(),
            idMascota: idMascotaActual,
            nombreMascota: document.getElementById("nombreMascota").textContent,
            diaTurno: campoDia.value,
            horaTurno: campoHora.value,
            nombreVeterinario: campoVeterinario.value
        });

        if (!guardarTurnos(turnos)) return;

        mostrarMensaje("¡Próximo turno agendado con éxito!", "success");
        formularioTurno.reset();
        camposTocados.clear();
        mostrarErroresTurno = false;
        camposTurno.forEach(campo => {
            campo.classList.remove("is-valid", "is-invalid");
            campo.removeAttribute("aria-invalid");
            const feedback = document.getElementById(`${campo.id}-feedback`);
            feedback.textContent = "";
            feedback.classList.remove("d-block");
        });
        validarTurno();
    });
}

if (btnAgregarHistoria) {
    btnAgregarHistoria.addEventListener('click', (e) => {
        e.preventDefault();
        idHistoriaEditando = null;
        document.getElementById("tituloFormulario").textContent = "Registrar historial";
        document.getElementById("estadoFormulario").textContent = "Nueva historia";
        document.getElementById("botonGuardar").textContent = "Registrar";
        cargarDesplegableTurnosModal();
        camposHistoria.forEach(campo => {
            campo.classList.remove("is-valid", "is-invalid");
            campo.removeAttribute("aria-invalid");
            const feedback = document.getElementById(`${campo.id}-feedback`);
            feedback.textContent = "";
            feedback.classList.remove("d-block");
        });
        document.getElementById("descripcionHistoria").value = "";
        camposTocados.clear();
        mostrarErroresHistoria = false;
        validarHistoria();
        if (modalHistoria) modalHistoria.show();
    });
}

if (formularioHistoria) {
    formularioHistoria.addEventListener('submit', (event) => {
        event.preventDefault();
        mostrarErroresHistoria = true;

        if (!validarHistoria()) return;

        let historias = obtenerHistorias();
        const descripcion = document.getElementById("descripcionHistoria").value.trim();
        const selectTurnos = document.getElementById("selectTurnoAtencion");
        let datosTurno;
        try {
            datosTurno = JSON.parse(selectTurnos.value);
        } catch (error) {
            console.error("Error al leer el turno seleccionado:", error);
            mostrarMensaje("No se pudo leer el turno seleccionado.", "danger");
            return;
        }

        let mensajeExito;
        if (idHistoriaEditando) {
            historias = historias.map(h => {
                if (h.idHistoria === idHistoriaEditando) {
                    return {
                        ...h,
                        diaTurno: datosTurno.diaTurno || h.diaTurno,
                        nombreVeterinario: datosTurno.nombreVeterinario || h.nombreVeterinario,
                        descripcionHistoria: descripcion
                    };
                }
                return h;
            });
            mensajeExito = "Historia clínica actualizada correctamente";
        } else {
            const nuevaHistoria = {
                idHistoria: crypto.randomUUID(),
                idMascota: idMascotaActual,
                diaTurno: datosTurno.diaTurno || obtenerFechaLocal(),
                nombreVeterinario: datosTurno.nombreVeterinario || "Atención General",
                descripcionHistoria: descripcion
            };
            historias.push(nuevaHistoria);
            mensajeExito = "Historia clínica registrada correctamente";
        }

        if (!guardarHistorias(historias)) return;

        mostrarMensaje(mensajeExito, "success");
        idHistoriaEditando = null;
        camposTocados.clear();
        mostrarErroresHistoria = false;

        if (modalHistoria) modalHistoria.hide();
        render();
    });
}

function render() {
    const tabla = document.getElementById("tablaHistoria");
    if (!tabla) return;

    let historias = obtenerHistorias();
    const historiasMascota = historias.filter(h => h.idMascota === idMascotaActual);

    historiasMascota.sort((a, b) => {
        let valorA = a[columnaOrden] || "";
        let valorB = b[columnaOrden] || "";
        let comparacion = 0;

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            comparacion = valorA - valorB;
        } else {
            comparacion = String(valorA).localeCompare(String(valorB));
        }
        return direccionOrden === 'asc' ? comparacion : -comparacion;
    })

    tabla.replaceChildren();

    const hayHistorias = historiasMascota.length > 0;
    contenedorTablaHistoria.hidden = !hayHistorias;
    alertSinHistorias.hidden = hayHistorias;

    if (!hayHistorias) {
        return;
    }

    historiasMascota.forEach(h => {
        const row = document.createElement("tr");

        const colDia = document.createElement("td");
        colDia.textContent = formatearFechaAR(h.diaTurno);

        const colVet = document.createElement("td");
        colVet.textContent = h.nombreVeterinario || "-";

        const colDesc = document.createElement("td");
        colDesc.textContent = h.descripcionHistoria || "-";

        const colAcciones = document.createElement("td");
        colAcciones.className = "text-end";
        const acciones = document.createElement("div");
        acciones.className = "d-flex gap-3 justify-content-end flex-nowrap";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-icon btn-icon-primary";
        editButton.dataset.bsToggle = "tooltip";
        editButton.dataset.bsTitle = "Editar historia clínica";
        editButton.setAttribute("aria-label", "Editar historia clínica");
        editButton.innerHTML = `<i class="fa-solid fa-pen" aria-hidden="true"></i>`;
        editButton.addEventListener("click", () => editarHistoria(h));
        colAcciones.append(editButton);

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn-icon btn-icon-danger";
        btnEliminar.dataset.bsToggle = "tooltip";
        btnEliminar.dataset.bsTitle = "Eliminar";
        btnEliminar.setAttribute("aria-label", "Eliminar historia clínica");
        btnEliminar.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
        btnEliminar.addEventListener("click", () => eliminarHistoria(h.idHistoria));
        
        acciones.append(editButton, btnEliminar);
        colAcciones.append(acciones);
        row.append(colDia, colVet, colDesc, colAcciones);
        tabla.append(row);
    });
}

function eliminarHistoria(idHistoria) {
    const historia = obtenerHistorias().find(h => h.idHistoria === idHistoria);
    if (!historia) {
        mostrarMensaje("La historia clínica que querés eliminar ya no está disponible.", "danger");
        return;
    }

    idHistoriaEliminar = idHistoria;
    resumenHistoriaEliminar.textContent =
        `${formatearFechaAR(historia.diaTurno)} - ${historia.nombreVeterinario || "Atención General"}`;
    modalEliminarHistoria?.show();
}

if (botonConfirmarEliminarHistoria) {
    botonConfirmarEliminarHistoria.addEventListener("click", () => {
        if (!idHistoriaEliminar) return;

        const historias = obtenerHistorias();
        const historiasActualizadas = historias.filter(
            historia => historia.idHistoria !== idHistoriaEliminar
        );
        if (historiasActualizadas.length === historias.length) {
            mostrarMensaje("La historia clínica que querés eliminar ya no está disponible.", "danger");
            modalEliminarHistoria?.hide();
            return;
        }
        if (!guardarHistorias(historiasActualizadas)) return;

        idHistoriaEliminar = null;
        modalEliminarHistoria?.hide();
        mostrarMensaje("La historia clínica se eliminó correctamente.", "success");
        render();
    });
}

if (contenedorModalEliminarHistoria) {
    contenedorModalEliminarHistoria.addEventListener("hidden.bs.modal", () => {
        idHistoriaEliminar = null;
    });
}

function editarHistoria(historia) {
    idHistoriaEditando = historia.idHistoria;

    const tituloModal = document.getElementById("tituloFormulario");
    const estadoForm = document.getElementById("estadoFormulario");
    const inputDesc = document.getElementById("descripcionHistoria");

    if (tituloModal) tituloModal.textContent = "Editar historia clínica";
    if (estadoForm) {
        estadoForm.textContent = "Editando registro";
        estadoForm.className = "badge text-bg-light estado-formulario";
    }
    botonGuardarHistoria.textContent = "Guardar cambios";

    cargarDesplegableTurnosModal(historia);
    if (inputDesc) inputDesc.value = historia.descripcionHistoria || "";
    camposHistoria.forEach(campo => {
        campo.classList.remove("is-valid", "is-invalid");
        campo.removeAttribute("aria-invalid");
        const feedback = document.getElementById(`${campo.id}-feedback`);
        feedback.textContent = "";
        feedback.classList.remove("d-block");
    });
    camposTocados.clear();
    mostrarErroresHistoria = false;
    validarHistoria();

    if (modalHistoria) modalHistoria.show();
}

function cargarDesplegableTurnosModal(historia = null) {
    const selectTurnos = document.getElementById("selectTurnoAtencion");
    if (!selectTurnos) return;

    const turnos = obtenerTurnos();
    const nombreMascota = document.getElementById("nombreMascota")?.textContent || "";

    const turnosMascota = turnos.filter(t =>
        (t.idMascota && t.idMascota === idMascotaActual) ||
        (t.nombreMascota && t.nombreMascota.toLowerCase().includes(nombreMascota.toLowerCase()))
    );

    selectTurnos.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Seleccionar...";
    placeholder.selected = true;
    placeholder.disabled = true;
    placeholder.hidden = true;
    selectTurnos.appendChild(placeholder);

    turnosMascota.forEach(turno => {
        const datos = {
            diaTurno: turno.diaTurno,
            nombreVeterinario: turno.nombreVeterinario
        };
        const option = document.createElement("option");
        option.value = JSON.stringify(datos);
        option.textContent = `${formatearFechaAR(turno.diaTurno)} ${turno.horaTurno} hs - Vet: ${turno.nombreVeterinario || 'Sin asignar'}`;
        selectTurnos.appendChild(option);
    });

    const atencionSinTurno = document.createElement("option");
    atencionSinTurno.value = JSON.stringify({ diaTurno: "", nombreVeterinario: "" });
    atencionSinTurno.textContent = "Atención sin turno (general)";
    selectTurnos.appendChild(atencionSinTurno);

    if (historia) {
        const valorHistoria = JSON.stringify({
            diaTurno: historia.diaTurno || "",
            nombreVeterinario: historia.nombreVeterinario || ""
        });
        let opcionHistoria = Array.from(selectTurnos.options)
            .find(option => option.value === valorHistoria);

        if (!opcionHistoria) {
            opcionHistoria = document.createElement("option");
            opcionHistoria.value = valorHistoria;
            opcionHistoria.textContent = `${formatearFechaAR(historia.diaTurno)} - Vet: ${historia.nombreVeterinario || 'Sin asignar'}`;
            selectTurnos.appendChild(opcionHistoria);
        }
        opcionHistoria.selected = true;
    }
}

if (btnVolver) {
    btnVolver.addEventListener('click', () => {
        window.location.href = "./mascotas.html";
    });
}

if (thead) {
    thead.addEventListener('click', (event) => {
        const th = event.target.closest('th');
        if (!th || !th.dataset.columna) return;

        const columnaSeleccionada = th.dataset.columna;
        if (columnaOrden === columnaSeleccionada) {
            direccionOrden = direccionOrden === 'asc' ? 'desc' : 'asc';
        } else {
            columnaOrden = columnaSeleccionada;
            direccionOrden = 'asc';
        }
        render();
    });
}

const btnExportarPDF = document.getElementById('btnExportarPDF');

if (btnExportarPDF) {
    btnExportarPDF.addEventListener('click', () => {
        const nombreMascota = document.getElementById('nombreMascota')?.textContent.trim() || 'Mascota';
        const tituloOriginal = document.title;

        // 1. Cambiar el título del documento para sugerir el nombre del archivo
        document.title = `Historia clínica - ${nombreMascota}`;

        // 2. Abrir la ventana nativa de impresión
        window.print();

        // 3. Restablecer el título original de la pestaña
        setTimeout(() => {
            document.title = tituloOriginal;
        }, 500);
    });
}