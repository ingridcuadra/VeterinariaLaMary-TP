


const btnAgregarMascota = document.getElementById('btnAgregarMascota');
const contenedorFormulario = document.getElementById('contenedorFormulario');
const modalMascota = new bootstrap.Modal(document.getElementById('contenedorFormulario'));
const formulario = document.getElementById('formularioMascota');
const tablaMascotas = document.getElementById('tablaMascotas');
const thead = document.querySelector('table thead');

let idMascotaEdit = null;
let columnaOrden = "nombreMascota";
let direccionOrden = 'asc';


btnAgregarMascota.addEventListener('click', () => {
   formulario.reset();
   modalMascota.show();
   idMascotaEdit = null;
});

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
  
   tablaMascotas.innerHTML = '';
    
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

   if (mascotas.length === 0) {
      tablaMascotas.innerHTML = '<td colspan="9" class="text-center text-secondary py-4">Todavía no hay mascotas registradas.</td>';
   } else {
      mascotas.forEach((mascota) => {
         tablaMascotas.innerHTML += `
            <tr>
               <td>${mascota.nombreMascota}</td>
               <td>${mascota.especieMascota}</td>
               <td>${mascota.razaMascota}</td>
               <td>${mascota.generoMascota}</td>
               <td>${mascota.colorMascota}</td>
               <td>${mascota.edadMascota}</td>
               <td>${mascota.pesoMascota}</td>
               <td>${mascota.nombreDuenio}</td>
               <td class="text-end">
                     <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${mascota.idMascota}">
                        <i class="fa-solid fa-pen"></i>
                     </button>
                     <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${mascota.idMascota}">
                        <i class="fa-solid fa-trash"></i>
                     </button>
               </td>
            </tr>
         `;
      });
   }
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

   modalMascota.show();
}

function eliminarMascota(id) {
   const mascotas = obtenerMascotas();
   const mascota = mascotas.find((m) => m.idMascota === id);
   
   if (!mascota) {
      mostrarMensaje('Mascota no encontrada.', 'danger');
      return;
   }

   const confirmacion = confirm(`¿Estás seguro de que deseas eliminar a ${mascota.nombreMascota}?`);
   if (!confirmacion) {return;}

   mascotas.splice(mascotas.indexOf(mascota), 1);
   if (guardarMascotas(mascotas)) {
      mostrarMensaje('Mascota eliminada correctamente.', 'success');
      render();
   }
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
         mascotas[indice] = {idMascota: idMascotaEdit, ...datosMascota};
         mostrarMensaje('¡Mascota actualizada con éxito!');
      }
   } else {
      const nuevaMascota = {idMascota: crypto.randomUUID(), ...datosMascota};
      mascotas.push(nuevaMascota);
      mostrarMensaje('Mascota registrada correctamente.', 'success');
   }
   if(guardarMascotas(mascotas)) {
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