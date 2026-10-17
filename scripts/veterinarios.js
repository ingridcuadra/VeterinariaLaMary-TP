const veterinarios = JSON.parse(localStorage.getItem("veterinarios") || "[]");

const formulario = document.getElementById("form-veterinarios");

const listadoVete = document.getElementById("lista-veterinarios");

const total = document.getElementById("total-veterinarios");

const modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));

const formEditar = document.getElementById("formEditarVeterinario");

let idVeterinarioEditar;

function render(){
    listadoVete.innerHTML = "";

    veterinarios.forEach((veterinario) =>  {
        listadoVete.innerHTML += `
            <tr>
                <th>${veterinario.matricula}</th>
                <th>${veterinario.nombre}</th>
                <th>${veterinario.especializacion}</th> 
                <th>${veterinario.valorConsulta}</th>
                <th>
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

function eliminarVeterinario(id){
    const indice = veterinarios.findIndex((veterinario)  => veterinario.idVeterinario === id);
    veterinarios.splice(indice, 1);
    guardarVeterinario();
    render();
}
// Hacer que la función sea accesible desde el onclick del htlm
window.eliminarVeterinario = eliminarVeterinario;


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

