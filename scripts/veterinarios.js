const veterinarios = JSON.parse(localStorage.getItem("veterinarios") || "[]");

const formulario = document.getElementById("form-veterinarios");

const listadoVeterinarios = document.getElementById("lista-veterinarios");

const total = document.getElementById("total-veterinarios");

function render(){
    listadoVeterinarios.innerHTML = "";

    veterinarios.forEach((veterinario) =>  {
        listadoVeterinarios.innerHTML += `
            <tr>
                <th>${veterinario.matricula}</th>
                <th>${veterinario.nombre}</th>
                <th>${veterinario.especializacion}</th> 
                <th>${veterinario.valorConsulta}</th>
                <th>
                <button class="btn btn-outline-primary btn-sm">
                    <i class="fa-solid fa-pen"></i>
                </button>
                 <button class="btn btn-outline-danger btn-sm" onclick="eliminarVeterinario('${veterinario.idVeterinario}')">
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
    //guardar en localstorage, convirtiendo el array veterinarios a un json
    localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
}

function eliminarVeterinario(id){
    const indice = veterinarios.findIndex((veterinario)  => veterinario.idVeterinario === id);
    veterinarios.splice(indice, 1);
    guardarVeterinario();
    render();
}
// Hacer que la función sea accesible desde el onclick del HTML
window.eliminarVeterinario = eliminarVeterinario;


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

