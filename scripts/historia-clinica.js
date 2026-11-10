import { obtenerMascotas, obtenerTurnos, obtenerVeterinarios, 
    guardarTurnos, mostrarMensaje, obtenerHistorias, guardarHistorias } from "./storage.js";

let idMascotaActual = null;
let ultimoTurnoMascota = null;
let idHistoriaEditando = null;
const thead = document.querySelector('table thead');
let columnaOrden = "diaTurno";
let direccionOrden = 'asc';
const contenedorModal = document.getElementById('contenedorFormulario');
const modalHistoria = contenedorModal ? new bootstrap.Modal(contenedorModal) : null;
const formularioHistoria = document.getElementById('formularioHistoria');
const btnAgregarHistoria = document.getElementById('btnAgregarHistoria');
const btnVolver = document.getElementById('botonVolver');
const btnAgendarTurno = document.getElementById('botonGuardarTurno');
const selectHoraTurno = document.getElementById("horaTurno");
const horariosTurno = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30", "17:00", "17:30", "18:00"
];

document.addEventListener("DOMContentLoaded", () => {
    cargarDesplegableHorarios();

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

    obtenerUltimoTurno(mascota);
    render();
});

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

if (btnAgendarTurno) {
    btnAgendarTurno.addEventListener("click", (e) => {
        e.preventDefault();

        const dia = document.getElementById("diaTurno").value;
        const hora = document.getElementById("horaTurno").value;
        const vet = document.getElementById("nombreVeterinario").value;
        const nombreMascota = document.getElementById("nombreMascota").textContent;

        if (!dia || !hora || !vet) {
            mostrarMensaje("Por favor elegí el día, la hora y el veterinario para agendar el nuevo turno.", "danger");
            return;
        }

        const turnos = obtenerTurnos();

        const nuevoTurno = {
            idTurno: crypto.randomUUID(),
            idMascota: idMascotaActual,
            nombreMascota: nombreMascota,
            diaTurno: dia,
            horaTurno: hora,
            nombreVeterinario: vet
        };

        turnos.push(nuevoTurno);
        guardarTurnos(turnos);

        mostrarMensaje("¡Próximo turno agendado con éxito!", "success");

        // Limpiar inputs de la sección de turno
        document.getElementById("diaTurno").value = "";
        document.getElementById("horaTurno").value = "";
        document.getElementById("nombreVeterinario").value = "";
    });
}

if (btnAgregarHistoria) {
    btnAgregarHistoria.addEventListener('click', (e) => {
        e.preventDefault();
        idHistoriaEditando = null;

        const selectTurnos = document.getElementById("selectTurnoAtencion");
        const turnos = obtenerTurnos();

        const turnosMascota = turnos.filter(t =>
            (t.idMascota && t.idMascota === idMascotaActual) ||
            (t.nombreMascota && t.nombreMascota.toLowerCase().includes(document.getElementById("nombreMascota").textContent.toLowerCase()))
        );

        selectTurnos.innerHTML = "";

        if (turnosMascota.length > 0) {
            turnosMascota.forEach(t => {
                const option = document.createElement("option");
                option.value = JSON.stringify({ diaTurno: t.diaTurno, nombreVeterinario: t.nombreVeterinario });
                option.textContent = `${formatearFechaAR(t.diaTurno)} ${t.horaTurno} hs - Vet: ${t.nombreVeterinario || 'Sin asignar'}`;
                selectTurnos.appendChild(option);
            });
        } else {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Sin turnos registrados";
            selectTurnos.appendChild(option);
        }

        document.getElementById("descripcionHistoria").value = "";
        if (modalHistoria) modalHistoria.show();
    });
}

if (formularioHistoria) {
    formularioHistoria.addEventListener('submit', (event) => {
        event.preventDefault();

        let historias = obtenerHistorias();
        const descripcion = document.getElementById("descripcionHistoria").value.trim();
        const selectTurnos = document.getElementById("selectTurnoAtencion");
        const tituloModal = document.getElementById("tituloFormulario");
        const estadoForm = document.getElementById("estadoFormulario");


        if (tituloModal) tituloModal.textContent = "Cargar historia clínica";
        if (estadoForm) {
            estadoForm.className = "badge text-bg-light estado-formulario";
        }

        if (!descripcion) return;

        let datosTurno = { diaTurno: "", nombreVeterinario: "" };
        if (selectTurnos && selectTurnos.value) {
            try {
                datosTurno = JSON.parse(selectTurnos.value);
            } catch (e) {
                console.error("Error al leer el turno seleccionado:", e);
            }
        }

        if (idHistoriaEditando) {
            // EDITAR REGISTRO EXISTENTE
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
            mostrarMensaje("Historia clínica actualizada correctamente", "success");
        } else {
            // CREAR NUEVO REGISTRO
            const nuevaHistoria = {
                idHistoria: crypto.randomUUID(),
                idMascota: idMascotaActual,
                diaTurno: datosTurno.diaTurno || new Date().toISOString().split('T')[0],
                nombreVeterinario: datosTurno.nombreVeterinario || "Atención General",
                descripcionHistoria: descripcion
            };
            historias.push(nuevaHistoria);
            mostrarMensaje("Historia clínica registrada correctamente", "success");
        }

        guardarHistorias(historias);
        idHistoriaEditando = null;

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

    if (historiasMascota.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" class="text-center text-secondary py-4">No hay atenciones clínicas registradas para esta mascota.</td>`;
        tabla.append(row);
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

        const editButton = document.createElement("button");
        editButton.className = "btn btn-icon btn-icon-primary btn-editar";
        editButton.innerHTML = `<i class="fa-solid fa-pen" aria-hidden="true"></i>`;
        editButton.addEventListener("click", () => editarHistoria(h));
        colAcciones.append(editButton);

        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-icon btn-icon-danger btn-sm";
        btnEliminar.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
        btnEliminar.addEventListener("click", () => eliminarHistoria(h.idHistoria));
        colAcciones.append(btnEliminar);

        row.append(colDia, colVet, colDesc, colAcciones);
        tabla.append(row);
    });
}

function eliminarHistoria(idHistoria) {
    let historias = obtenerHistorias();
    historias = historias.filter(h => h.idHistoria !== idHistoria);
    guardarHistorias(historias);
    render();
}

function editarHistoria(historia) {
    idHistoriaEditando = historia.idHistoria;

    const tituloModal = document.getElementById("tituloFormulario");
    const estadoForm = document.getElementById("estadoFormulario");
    const selectTurnos = document.getElementById("selectTurnoAtencion");
    const inputDesc = document.getElementById("descripcionHistoria");

    if (tituloModal) tituloModal.textContent = "Editar historia clínica 111";
    if (estadoForm) {
        estadoForm.textContent = "Editando registro";
        estadoForm.className = "badge text-bg-light estado-formulario";
    }

    // Cargar los turnos y preseleccionar el del registro
    cargarDesplegableTurnosModal();
    if (selectTurnos) {
        // Buscar la opción que coincida con la fecha y veterinario guardados
        Array.from(selectTurnos.options).forEach(opt => {
            if (opt.value) {
                try {
                    const datos = JSON.parse(opt.value);
                    if (datos.diaTurno === historia.diaTurno && datos.nombreVeterinario === historia.nombreVeterinario) {
                        opt.selected = true;
                    }
                } catch (e) { }
            }
        });
    }

    if (inputDesc) inputDesc.value = historia.descripcionHistoria || "";

    if (modalHistoria) modalHistoria.show();
}

function cargarDesplegableTurnosModal() {
    const selectTurnos = document.getElementById("selectTurnoAtencion");
    if (!selectTurnos) return;

    const turnos = obtenerTurnos();
    const nombreMascota = document.getElementById("nombreMascota")?.textContent || "";

    const turnosMascota = turnos.filter(t =>
        (t.idMascota && t.idMascota === idMascotaActual) ||
        (t.nombreMascota && t.nombreMascota.toLowerCase().includes(nombreMascota.toLowerCase()))
    );

    selectTurnos.innerHTML = "";

    if (turnosMascota.length > 0) {
        turnosMascota.forEach(t => {
            const option = document.createElement("option");
            option.value = JSON.stringify({ diaTurno: t.diaTurno, nombreVeterinario: t.nombreVeterinario });
            option.textContent = `${formatearFechaAR(t.diaTurno)} ${t.horaTurno} hs - Vet: ${t.nombreVeterinario || 'Sin asignar'}`;
            selectTurnos.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Sin turnos registrados";
        selectTurnos.appendChild(option);
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