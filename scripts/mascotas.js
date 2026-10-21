import { Modal } from "bootstrap";
const STORAGE_KEY = "mascotas";

const form = document.querySelector("#formularioMascota");
const tableBody = document.querySelector("#tablaMascotas");
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
    const mascotas = getMascotas();

    totalElement.textContent = String(mascotas.length);
    tableBody.replaceChildren();

    const hayMascotas = mascotas.length > 0;

    contenedorTabla.hidden = !hayMascotas;
    contenedorTotal.hidden = !hayMascotas;
    alertSinMascotas.hidden = hayMascotas;

    if (!hayMascotas) {
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
        editButton.setAttribute("aria-label", `Editar ${mascota.nombreMascota}`);
        editButton.innerHTML =
            '<i class="fa-solid fa-pen" aria-hidden="true"></i>';
        editButton.addEventListener("click", () => startEditing(mascota));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-icon btn-icon-danger";
        deleteButton.setAttribute("aria-label", `Eliminar ${mascota.nombreMascota}`);
        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
        deleteButton.addEventListener("click", () => deleteMascota(mascota.idMascota));

        actions.append(editButton, deleteButton);
        actionsCell.append(actions);
        row.append(actionsCell);
        tableBody.append(row);
    });
}


function startEditing(mascota) {
    editingId = mascota.idMascota;
    form.elements.nombreMascota.value = mascota.nombreMascota;
    form.elements.nombreDuenio.value = mascota.nombreDuenio;
    form.elements.color.value = mascota.color;
    form.elements.edad.value = mascota.edad;
    form.elements.peso.value = mascota.peso;
    titleElement.textContent = "Editar mascota";
    formStateElement.textContent = "Editando registro";
    saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk me-2" aria-hidden="true"></i>Guardar cambios';
    cancelButton.classList.remove("d-none");
    form.elements.nombreMascota.focus();
}

function resetForm() {
    editingId = null;
    form.reset();
    titleElement.textContent = "Registrar mascota";
    formStateElement.textContent = "Nueva mascota";
    saveButton.innerHTML = '<i class="fa-solid fa-plus me-2" aria-hidden="true"></i>Registrar mascota';
    cancelButton.classList.add("d-none");
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
    if (!form.reportValidity()) {
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
renderMascotas();