
const btnAgregarMascota = document.getElementById('btnAgregarMascota');
const contenedorFormulario = document.getElementById('contenedorFormulario');
const modalMascota = new bootstrap.Modal(document.getElementById('contenedorFormulario'));
const formulario = document.getElementById('formularioMascota');
const tablaMascotas = document.getElementById('tablaMascotas');
const thead = document.querySelector('table thead');
const alertSinResultados = document.getElementById("alert-sin-resultados");
const contenedorTabla = document.querySelector("#contenedor-tabla-mascotas");
const alertSinMascotas = document.querySelector("#alert-sin-mascotas");
const modalEliminarMascota = new bootstrap.Modal(document.querySelector("#modalEliminarMascota"));
const nombreMascotaEliminar = document.querySelector("#nombreMascotaEliminar");
const botonConfirmarEliminar = document.querySelector("#confirmarEliminarMascota");
const titleElement = document.querySelector("#tituloFormulario");
const formStateElement = document.querySelector("#estadoFormulario");
const saveButton = document.querySelector("#botonGuardar");
const camposRegistro = [
   formulario.elements.nombreMascota,
   formulario.elements.especieMascota,
   formulario.elements.razaMascota,
   formulario.elements.generoMascota,
   formulario.elements.colorMascota,
   formulario.elements.edadMascota,
   formulario.elements.pesoMascota,
   formulario.elements.nombreDuenio
];

const maxEdadPorEspecie = {
   "Perro": 20,
   "Gato": 25,
   "Ave": 50,
   "Reptil": 100,
   "Roedor": 7,
   "Lagomorfo": 15,
   "Otro": 100
};

const camposTocados = new Set();
let mostrarErrores = false;

let idMascotaEdit = null;
let columnaOrden = "nombreMascota";
let direccionOrden = 'asc';
let idMascotaEliminar = null;


btnAgregarMascota.addEventListener('click', () => {
   resetForm();
   modalMascota.show();
   idMascotaEdit = null;
});

function createCell(text) {
   const cell = document.createElement("td");
   cell.textContent = text;
   return cell;
}

function render() {
   let mascotas = obtenerMascotas();
   const contadorMascotas = document.getElementById('contadorMascotas');
   const inputBuscar = document.getElementById('inputBuscar');
   const textoBusqueda = inputBuscar ? inputBuscar.value.toLowerCase().trim() : '';

   if (textoBusqueda !== '') {
      mascotas = mascotas.filter((m) =>
         m.nombreMascota.toLowerCase().includes(textoBusqueda) ||
         m.nombreDuenio.toLowerCase().includes(textoBusqueda) ||
         m.especieMascota.toLowerCase().includes(textoBusqueda) ||
         m.razaMascota.toLowerCase().includes(textoBusqueda)
      );
   }

   tablaMascotas.replaceChildren(); // Limpiar la tabla antes de renderizar

   mascotas.sort((a, b) => {
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

   if (contadorMascotas) {
      contadorMascotas.textContent = mascotas.length;
   }

   const hayMascotasRegistradas = obtenerMascotas().length > 0;
   const hayResultados = mascotas.length > 0;

   contenedorTabla.hidden = !hayResultados;

   alertSinMascotas.hidden = hayMascotasRegistradas;
   alertSinResultados.hidden =
      !hayMascotasRegistradas || hayResultados;

   if (!hayResultados) {
      return;
   } else {
      mascotas.forEach((mascota) => {
         const row = document.createElement("tr");
         row.append(
            createCell(mascota.nombreMascota),
            createCell(mascota.especieMascota),
            createCell(mascota.razaMascota),
            createCell(mascota.generoMascota),
            createCell(mascota.colorMascota),
            createCell(mascota.edadMascota),
            createCell(mascota.pesoMascota),
            createCell(mascota.nombreDuenio),
         );

         const actionsCell = document.createElement("td");
         actionsCell.className = "table-actions text-end pe-4";

         const actions = document.createElement("div");
         actions.className = "d-flex gap-3 justify-content-end flex-nowrap";

         const editButton = document.createElement("button");
         editButton.type = "button";
         editButton.className = "btn btn-icon btn-icon-primary btn-editar";
         editButton.dataset.id = mascota.idMascota;
         editButton.setAttribute(
            "aria-label",
            `Editar ${mascota.nombreMascota}`
         );
         editButton.innerHTML =
            '<i class="fa-solid fa-pen" aria-hidden="true"></i>';


         const deleteButton = document.createElement("button");
         deleteButton.type = "button";
         deleteButton.className = "btn btn-icon btn-icon-danger btn-eliminar";
         deleteButton.dataset.id = mascota.idMascota;
         deleteButton.setAttribute(
            "aria-label",
            `Eliminar ${mascota.nombreMascota}`
         );
         deleteButton.innerHTML =
            '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
         ;

         actions.append(editButton, deleteButton);
         actionsCell.append(actions);
         row.append(actionsCell);
         tablaMascotas.append(row);
      });
   };
}


function obtenerMascotas() {
   try {
      const mascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
      return Array.isArray(mascotas) ? mascotas : [];
   } catch (error) {
      mostrarMensaje('Error al obtener datos almacenados.', 'danger');
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

function guardarMascotas(mascotas) {
   try {
      localStorage.setItem('mascotas', JSON.stringify(mascotas));
      return true;
   } catch (error) {
      mostrarMensaje('Error al guardar datos de la mascota.', 'danger');
      return false;
   }
}

function editarMascota(id) {
   const mascotas = obtenerMascotas();
   const mascota = mascotas.find((m) => m.idMascota === id);

   if (!mascota) {
      mostrarMensaje('Mascota no encontrada.', 'danger');
      return;
   }

   document.getElementById("nombreMascota").value = mascota.nombreMascota;
   document.getElementById("especieMascota").value = mascota.especieMascota;
   document.getElementById("razaMascota").value = mascota.razaMascota;
   document.getElementById("generoMascota").value = mascota.generoMascota;
   document.getElementById("colorMascota").value = mascota.colorMascota;
   document.getElementById("edadMascota").value = mascota.edadMascota;
   document.getElementById("pesoMascota").value = mascota.pesoMascota;
   document.getElementById("nombreDuenio").value = mascota.nombreDuenio;

   idMascotaEdit = id;
   titleElement.textContent = "Editar mascota";
   formStateElement.textContent = "Editar mascota";

   modalMascota.show();
}

function eliminarMascota(id) {
   const mascotas = obtenerMascotas();
   const mascota = mascotas.find((m) => m.idMascota === id);

   if (!mascota) {
      mostrarMensaje('Mascota no encontrada.', 'danger');
      return;
   } else {
      idMascotaEliminar = id;
      nombreMascotaEliminar.textContent = mascota.nombreMascota;

      modalEliminarMascota.show();
   }
}

botonConfirmarEliminar.addEventListener("click", () => {
   const mascotas = obtenerMascotas();
   const indice = mascotas.findIndex(
      (mascota) => mascota.idMascota === idMascotaEliminar
   );

   if (indice === -1) return;

   mascotas.splice(indice, 1);
   if (guardarMascotas(mascotas)) {
      modalEliminarMascota.hide();
      mostrarMensaje('Mascota eliminada correctamente.', 'success');
      render();
   }

   idMascotaEliminar = null;

});

function obtenerErrorCampo(campo) {
   const valor = campo.value.trim();
   const camposSoloTexto = ["razaMascota", "colorMascota", "nombreDuenio"];
   const especie = document.getElementById("especieMascota").value;
   const maxEdad = maxEdadPorEspecie[especie] || 100

   if (!valor) {
      return "Este campo es obligatorio.";
   }

   if (campo.id === "edadMascota") {
      const edad = Number(valor);

      if (!Number.isInteger(edad) || edad < 0 || edad > maxEdad) {
         return `Ingresá una edad entera entre 0 y ${maxEdad} años.`;
      }
   }

   if (campo.id === "pesoMascota") {
      const peso = Number(valor);

      if (!Number.isFinite(peso) || peso <= 0) {
         return "Ingresá un peso mayor a 0.";
      }
   }

   if (camposSoloTexto.includes(campo.id)) {
      // /\d/ busca si hay al menos un dígito (0-9) en el texto
      if (/\d/.test(valor)) {
         return "Este campo no puede contener números.";
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

function resetForm() {
   idMascotaEdit = null;
   formulario.reset();
   titleElement.textContent = "Registrar mascota";
   formStateElement.textContent = "Nueva mascota";

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

tablaMascotas.addEventListener('click', (event) => {
   const botonEditar = event.target.closest('.btn-editar');
   const botonEliminar = event.target.closest('.btn-eliminar');

   if (botonEditar) {
      const id = botonEditar.dataset.id;
      editarMascota(id);
   } else if (botonEliminar) {
      const id = botonEliminar.dataset.id;
      eliminarMascota(id);
   }
});


formulario.addEventListener('submit', (event) => {
   event.preventDefault();

   mostrarErrores = true;

   if (!validarFormulario()) {
      return;
   }

   const datos = new FormData(formulario);
   const mascotas = obtenerMascotas();

   const datosMascota = {
      nombreMascota: datos.get('nombreMascota').trim(),
      especieMascota: datos.get('especieMascota').trim(),
      razaMascota: datos.get('razaMascota').trim(),
      generoMascota: datos.get('generoMascota').trim(),
      colorMascota: datos.get('colorMascota').trim(),
      edadMascota: Number(datos.get('edadMascota')),
      pesoMascota: parseFloat(datos.get('pesoMascota')),
      nombreDuenio: datos.get('nombreDuenio').trim(),
   }

   if (idMascotaEdit) {
      const indice = mascotas.findIndex((m) => m.idMascota === idMascotaEdit);
      if (indice !== -1) {
         mascotas[indice] = { idMascota: idMascotaEdit, ...datosMascota };
         mostrarMensaje('¡Mascota actualizada con éxito!');
      }
   } else {
      const nuevaMascota = { idMascota: crypto.randomUUID(), ...datosMascota };
      mascotas.push(nuevaMascota);
      mostrarMensaje('Mascota registrada correctamente.', 'success');
   }
   if (guardarMascotas(mascotas)) {
      formulario.reset();
      modalMascota.hide();
      idMascotaEdit = null;
      render();
   }
});

const inputBuscar = document.getElementById('inputBuscar');
if (inputBuscar) {
   inputBuscar.addEventListener('input', render);
}

render();