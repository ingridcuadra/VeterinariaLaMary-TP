
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
   const alerta = document.getElementById('mensajeEstado');
   alerta.textContent = mensaje;
   alerta.className = `alert alert-${tipo} mx-5 mt-3`;

   setTimeout(() => {
      alerta.classList.add('d-none');
   }, 3000);
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