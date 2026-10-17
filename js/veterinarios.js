const veterinarios = [];

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
            </tr>

        `
    })

    total.textContent = veterinarios.length;
};

render();