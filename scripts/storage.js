
export function obtenerMascotas() {
    try {
        const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        return Array.isArray(mascotas) ? mascotas : [];
    } catch (error) {
        mostrarMensaje('Error al obtener datos almacenados.', 'danger');
        return [];
    }
}

export function mostrarMensaje(mensaje, tipo = 'success') {
    const toast = document.getElementById("toastNotificacion");
    const cuerpo = document.getElementById("toastNotificacionMensaje");
    if (!toast || !cuerpo) {
        console.error(mensaje);
        return;
    }

    const variantes = ["success", "danger", "warning", "info", "primary", "secondary", "dark"];
    const variante = variantes.includes(tipo) ? tipo : "primary";
    toast.classList.remove(...variantes.map(item => `text-bg-${item}`));
    toast.classList.add(`text-bg-${variante}`);
    toast.querySelector(".btn-close")?.classList.toggle(
        "btn-close-white",
        !["warning", "info"].includes(variante)
    );
    cuerpo.textContent = mensaje;
    window.bootstrap.Toast.getOrCreateInstance(toast, { autohide: true, delay: 4000 }).show();
}

export function inicializarTooltips(contenedor) {
    if (!contenedor) return;

    window.bootstrap.Tooltip.getOrCreateInstance(contenedor, {
        selector: '[data-bs-toggle="tooltip"]',
        container: "body"
    });
}

export function guardarMascotas(mascotas) {
    try {
        localStorage.setItem('mascotas', JSON.stringify(mascotas));
        return true;
    } catch (error) {
        mostrarMensaje('Error al guardar datos de la mascota.', 'danger');
        return false;
    }
}

export function obtenerVeterinarios() {
    try {
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios") || "[]");
        return Array.isArray(veterinarios) ? veterinarios : [];
    } catch (error) {
        mostrarMensaje("Error al obtener datos almacenados.", "danger");
        return [];
    }
}

export function guardarVeterinario(veterinarios) {
    try {
        localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
        return true;
    } catch (error) {
        mostrarMensaje("Error al guardar datos del veterinario.", "danger");
        return false;
    }
}

export function obtenerTurnos() {
    try {
        const turnos = JSON.parse(localStorage.getItem('turnos') || '[]');
        return Array.isArray(turnos) ? turnos : [];
    } catch (error) {
        mostrarMensaje('Error al obtener datos almacenados.', 'danger');
        return [];
    }
}

export function obtenerHorasOcupadas(diaTurno, idTurnoIgnorado = null) {
    if (!diaTurno) return [];

    return obtenerTurnos()
        .filter(turno => turno.diaTurno === diaTurno && turno.idTurno !== idTurnoIgnorado)
        .map(turno => turno.horaTurno);
}


export function guardarTurnos(turnos) {
    try {
        localStorage.setItem('turnos', JSON.stringify(turnos));
        return true;
    } catch (error) {
        mostrarMensaje('Error al guardar datos de la turno.', 'danger');
        return false;
    }
}

export function obtenerHistorias() {
    try {
        return JSON.parse(localStorage.getItem("historiasClinicas") || "[]");
    } catch (e) {
        mostrarMensaje("Error al cargar historias clínicas", "danger");
        return [];
    }
}

export function guardarHistorias(historias) {
    try {
        localStorage.setItem('historiasClinicas', JSON.stringify(historias));
        return true;
    } catch (error) {
        mostrarMensaje('Error al guardar datos de la historia.', 'danger');
        return false;
    }
}