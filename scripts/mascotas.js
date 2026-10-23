import { Modal } from "bootstrap";
const STORAGE_KEY = "mascotas";

const form = document.querySelector("#formularioMascota");
const tableBody = document.querySelector("#tablaMascotas");
const inputBuscar = document.querySelector("#inputBuscar");
const alertSinResultados = document.getElementById("alert-sin-resultados");
const totalElement = document.querySelector("#totalMascotas");
const titleElement = document.querySelector("#tituloFormulario");
const formStateElement = document.querySelector("#estadoFormulario");
const saveButton = document.querySelector("#botonGuardar");
const cancelButton = document.querySelector("#botonCancelar");
const statusMessage = document.querySelector("#mensajeEstado");
let editingId = null;
const contenedorTabla = document.querySelector("#contenedor-tabla-mascotas");
const alertSinMascotas = document.querySelector("#alert-sin-mascotas");
const contenedorTotal = document.querySelector("#total-mascotas-contenedor");

const modalEliminarMascota = new Modal(
    document.querySelector("#modalEliminarMascota")
);

const nombreMascotaEliminar = document.querySelector("#nombreMascotaEliminar");
const botonConfirmarEliminar = document.querySelector("#confirmarEliminarMascota");
const camposRegistro = [
    form.elements.nombreMascota,
    form.elements.nombreDuenio,
    form.elements.color,
    form.elements.edad,
    form.elements.peso
];

const camposTocados = new Set();
let mostrarErrores = false;

let idMascotaEliminar = null;

function getMascotas() {
    try {
        const storedPets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(storedPets) ? storedPets : [];
    } catch {
        showMessage("No se pudieron leer los registros guardados.", "danger");
        return [];
    }
}

function saveMascotas(mascotas) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mascotas));
        return true;
    } catch {
        showMessage("No se pudieron guardar los cambios en este dispositivo.", "danger");
        return false;
    }
}

function showMessage(message, type = "success") {
    statusMessage.textContent = message;
    statusMessage.className = `alert alert-${type}`;
}

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}


function renderMascotas() {
    const todasLasMascotas = getMascotas();

    const textoBusqueda = inputBuscar
        ? inputBuscar.value.trim().toLocaleLowerCase("es-AR")
        : "";

    const mascotas = todasLasMascotas.filter((mascota) => {
        const camposBuscables = [
            mascota.nombreMascota,
            mascota.nombreDuenio,
            mascota.color,
            mascota.edad,
            mascota.peso
        ];

        return camposBuscables.some((campo) =>
            String(campo ?? "")
                .toLocaleLowerCase("es-AR")
                .includes(textoBusqueda)
        );
    });

    totalElement.textContent = String(mascotas.length);
    tableBody.replaceChildren();

    const hayMascotasRegistradas = todasLasMascotas.length > 0;
    const hayResultados = mascotas.length > 0;

    contenedorTabla.hidden = !hayResultados;
    contenedorTotal.hidden = !hayResultados;

    alertSinMascotas.hidden = hayMascotasRegistradas;
    alertSinResultados.hidden =
        !hayMascotasRegistradas || hayResultados;

    if (!hayResultados) {
        return;
    }

    mascotas.forEach((mascota) => {
        const row = document.createElement("tr");

        row.append(
            createCell(mascota.nombreMascota),
            createCell(mascota.nombreDuenio),
            createCell(mascota.color),
            createCell(`${mascota.edad} años`),
            createCell(`${Number(mascota.peso).toLocaleString("es-AR")} kg`)
        );

        const actionsCell = document.createElement("td");
        actionsCell.className = "table-actions text-end pe-4";

        const actions = document.createElement("div");
        actions.className = "d-flex gap-3 justify-content-end flex-nowrap";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-icon btn-icon-primary";
        editButton.setAttribute(
            "aria-label",
            `Editar ${mascota.nombreMascota}`
        );
        editButton.innerHTML =
            '<i class="fa-solid fa-pen" aria-hidden="true"></i>';
        editButton.addEventListener("click", () => startEditing(mascota));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-icon btn-icon-danger";
        deleteButton.setAttribute(
            "aria-label",
            `Eliminar ${mascota.nombreMascota}`
        );
        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
        deleteButton.addEventListener(
            "click",
            () => deleteMascota(mascota.idMascota)
        );

        actions.append(editButton, deleteButton);
        actionsCell.append(actions);
        row.append(actionsCell);
        tableBody.append(row);
    });
}


function obtenerErrorCampo(campo) {
    const valor = campo.value.trim();

    if (!valor) {
        return "Este campo es obligatorio.";
    }

    if (campo.id === "edad") {
    const edad = Number(valor);

    if (!Number.isInteger(edad) || edad < 0 || edad > 200) {
        return "Ingresá una edad entera entre 0 y 200 años.";
    }
}

    if (campo.id === "peso") {
        const peso = Number(valor);

        if (!Number.isFinite(peso) || peso <= 0) {
            return "Ingresá un peso mayor a 0.";
        }
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

validarFormulario();


function startEditing(mascota) {
    editingId = mascota.idMascota;
    form.elements.nombreMascota.value = mascota.nombreMascota;
    form.elements.nombreDuenio.value = mascota.nombreDuenio;
    form.elements.color.value = mascota.color;
    form.elements.edad.value = mascota.edad;
    form.elements.peso.value = mascota.peso;
    titleElement.textContent = "Editar mascota";
    formStateElement.textContent = "Editando mascota";
    saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk me-2" aria-hidden="true"></i>Guardar cambios';
    cancelButton.classList.remove("d-none");
    form.elements.nombreMascota.focus();
    mostrarErrores = false;
    camposTocados.clear();
    validarFormulario();
}

function resetForm() {
    editingId = null;
    form.reset();
    titleElement.textContent = "Registrar mascota";
    formStateElement.textContent = "Nueva mascota";

    saveButton.innerHTML =
        '<i class="fa-solid fa-plus me-2" aria-hidden="true"></i>Registrar mascota';

    cancelButton.classList.add("d-none");

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



function deleteMascota(idMascota) {
    const mascotas = getMascotas();

    const mascota = mascotas.find(
        (mascota) => mascota.idMascota === idMascota
    );

    if (!mascota) return;

    idMascotaEliminar = idMascota;
    nombreMascotaEliminar.textContent = mascota.nombreMascota;

    modalEliminarMascota.show();
}



botonConfirmarEliminar.addEventListener("click", () => {
    const mascotas = getMascotas();
    const indice = mascotas.findIndex(
        (mascota) => mascota.idMascota === idMascotaEliminar
    );

    if (indice === -1) return;

    mascotas.splice(indice, 1);
    saveMascotas(mascotas);
    renderMascotas();

    idMascotaEliminar = null;
    modalEliminarMascota.hide();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    mostrarErrores = true;

    if (!validarFormulario()) {
        return;
    }

    const mascotas = getMascotas();
    const wasEditing = Boolean(editingId);
    const mascota = {
        idMascota: editingId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        nombreMascota: form.elements.nombreMascota.value.trim(),
        nombreDuenio: form.elements.nombreDuenio.value.trim(),
        color: form.elements.color.value.trim(),
        edad: Number(form.elements.edad.value),
        peso: Number(form.elements.peso.value)
    };

    const updatedMascotas = editingId
        ? mascotas.map((item) => item.idMascota === editingId ? mascota : item)
        : [...mascotas, mascota];

    if (saveMascotas(updatedMascotas)) {
        renderMascotas();
        resetForm();
        showMessage(wasEditing ? "Los cambios se guardaron correctamente." : "La mascota se registró correctamente.");
    }
});

cancelButton.addEventListener("click", resetForm);
inputBuscar.addEventListener("input", renderMascotas);
renderMascotas();