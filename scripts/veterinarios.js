const veterinarios = JSON.parse(localStorage.getItem("veterinarios") || "[]");

const formulario = document.getElementById("form-veterinarios");
const listadoVete = document.getElementById("lista-veterinarios");
const total = document.getElementById("total-veterinarios");
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));
const formEditar = document.getElementById("formEditarVeterinario");
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
const nombreVeterinarioEliminar = document.getElementById("nombreVeterinarioEliminar");
const botonConfirmarEliminar = document.getElementById("confirmarEliminar");
let idVeterinarioEliminar = null;

function render(){
    listadoVete.innerHTML = "";

    veterinarios.forEach((veterinario) =>  {
        listadoVete.innerHTML += `
            <tr>
                <td>${veterinario.matricula}</td>
                <td>${veterinario.nombre}</td>
                <td>${veterinario.especializacion}</td> 
                <td>${veterinario.valorConsulta}</td>
                <td scope="col" class="text-end pe-4">
                <button class="btn btn-outline-primary" onclick="editarVeterinario('${veterinario.idVeterinario}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                 <button class="btn btn-outline-danger" onclick="eliminarVeterinario('${veterinario.idVeterinario}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </th>
            </tr>

        `
    })

    total.textContent = veterinarios.length;
};

render();


function guardarVeterinario(){
    localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
}

function eliminarVeterinario(id) {
    const veterinario = veterinarios.find(
        (veterinario) => veterinario.idVeterinario === id
    );

    if (!veterinario) return;

    idVeterinarioEliminar = id;
    nombreVeterinarioEliminar.textContent = veterinario.nombre;
    modalEliminar.show();
}

window.eliminarVeterinario = eliminarVeterinario;

botonConfirmarEliminar.addEventListener("click", () => {
    if (!idVeterinarioEliminar) return;

    const indice = veterinarios.findIndex(
        (veterinario) =>
            veterinario.idVeterinario === idVeterinarioEliminar
    );

    if (indice === -1) return;

    veterinarios.splice(indice, 1);
    guardarVeterinario();
    render();

    idVeterinarioEliminar = null;
    modalEliminar.hide();
});


function editarVeterinario(id) {
    const veterinario = veterinarios.find((veterinario) => veterinario.idVeterinario === id);

    document.getElementById("editarIdVeterinario").value = veterinario.idVeterinario;
    document.getElementById("editarMatricula").value = veterinario.matricula;
    document.getElementById("editarNombre").value = veterinario.nombre;
    document.getElementById("editarEspecializacion").value = veterinario.especializacion;
    document.getElementById("editarValorConsulta").value = veterinario.valorConsulta;

    modalEditar.show();
}


// Hacer que la función sea accesible desde el onclick del htlm
window.editarVeterinario = editarVeterinario;

// GUARDAR LOS CAMBIOS DE LA EDICIÓN
formEditar.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("editarIdVeterinario").value;
    const veterinario = veterinarios.find((veterinario) => veterinario.idVeterinario === id);

    veterinario.matricula = document.getElementById("editarMatricula").value.trim();
    veterinario.nombre = document.getElementById("editarNombre").value.trim();
    veterinario.especializacion = document.getElementById("editarEspecializacion").value;
    veterinario.valorConsulta = Number(document.getElementById("editarValorConsulta").value);

    guardarVeterinario();
    render();
    modalEditar.hide();
});



formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = new FormData(formulario);
    const matricula = datos.get("matricula").trim();
    const nombre = datos.get("nombre").trim();
    const especializacion = datos.get("especializacion").trim();
    const valorConsulta = parseFloat(datos.get("valorConsulta").trim());

    const veterinario = {
        idVeterinario: crypto.randomUUID(),
        matricula,
        nombre, 
        especializacion,
        valorConsulta
    }
    veterinarios.push(veterinario);
    guardarVeterinario();

    render();
    formulario.reset();
})
