let libros = JSON.parse(localStorage.getItem('libros')) || []
let editando = false;
let indiceEditar = null;

const agregarLibro = () => {
    const titulo = document.getElementById('titulo').value.trim()
    const autor = document.getElementById('autor').value.trim()
    const anio = Number(document.getElementById('anio').value)
    const genero = document.getElementById('genero').value.trim()

    const tituloValido = titulo !== ''
    const autorValido = autor !== ''
    const generoValido = genero !== ''
    const anioActual = new Date().getFullYear()

    if (tituloValido && autorValido && generoValido) {
        if (editando) {
            if (isNaN(anio) || anio < 1900 || anio > anioActual) {
                alert('El año debe estar entre 1900 y ' + anioActual)
                return
            }
            libros[indiceEditar] = { titulo, autor, anio, genero }
            editando = false
            indiceEditar = null
            document.querySelector('button[type="submit"]').innerText = 'Agregar'
        } else {
            const anioValido = !isNaN(anio) && anio >= 1900 && anio <= anioActual
            if (!anioValido) {
                alert('El año debe estar entre 1900 y ' + anioActual)
                return
            }

            const existe = libros.some(libro => libro.titulo.toLowerCase() === titulo.toLowerCase() && libro.autor.toLowerCase() === autor.toLowerCase())
            if (existe) {
                alert('El libro ya existe')
                return
            }

            libros.push({ titulo, autor, anio, genero })
        }

        localStorage.setItem('libros', JSON.stringify(libros))
        renderizarLibros()
        mostrarResumen(libros)
        actualizarSelectGenero()
    } else {
        alert('Todos los campos deben estar completos')
    }

    document.getElementById('titulo').value = ''
    document.getElementById('autor').value = ''
    document.getElementById('anio').value = ''
    document.getElementById('genero').value = ''
}


const filtrarLibros = () => {
    const texto = document.getElementById('busqueda').value.toLowerCase()
    const librosFiltrados = libros.filter(libro => libro.titulo.toLowerCase().includes(texto))
    renderizarLibros(librosFiltrados)
    mostrarResumen(librosFiltrados)
}

const renderizarLibros = (lista = libros) => {
    const tabla = document.getElementById('tablaLibros').querySelector('tbody')
    tabla.innerText = ''
   
    lista.forEach(libro => {
        const indexReal = libros.indexOf(libro)
        const fila = document.createElement('tr')
        fila.innerHTML = `
            <td>${indexReal + 1}</td>
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>${libro.anio}</td>
            <td>${libro.genero}</td>
            <td>
                <button onclick="eliminarLibro(${indexReal})">Eliminar</button>
                <button onclick="editarLibro(${indexReal})">Editar</button>
            </td>
        `
        tabla.appendChild(fila)
    })
}

const editarLibro = (index) => {
    const libro = libros[index]
    document.getElementById('titulo').value = libro.titulo
    document.getElementById('autor').value = libro.autor
    document.getElementById('genero').value = libro.genero
    document.getElementById('anio').value = libro.anio
    document.querySelector('button[type="submit"]').innerText = 'Actualizar libro'
    editando = true
    indiceEditar = index
}

const mostrarResumen = (libros = libros) => {
    const resumen = document.getElementById('resumenLibros')

    if (libros.length === 0) {
        resumen.innerText = "No existen libros cargados"
        return
    }

    const total = libros.length
    const sumaAnios = libros.reduce((acumulador, libro) => acumulador + parseInt(libro.anio), 0) 
    const promedio = Math.round(sumaAnios / total)
    const posterioresA2010 = libros.filter(libro => libro.anio > 2010).length
    const libroNuevo = libros.reduce((nuevo, libro) => (libro.anio > nuevo.anio ? libro : nuevo), libros[0])
    const libroViejo = libros.reduce((viejo, libro) => (libro.anio < viejo.anio ? libro : viejo), libros[0])

    resumen.innerHTML = `
        <p>Total de libros: ${total}</p>
        <p>Promedio de año de edición: ${promedio}</p>
        <p>Libros posteriores a 2010: ${posterioresA2010}</p>
        <p>Libro más nuevo: ${libroNuevo.titulo} de ${libroNuevo.autor}, ${libroNuevo.anio}</p>
        <p>Libro más viejo: ${libroViejo.titulo} de ${libroViejo.autor}, ${libroViejo.anio}</p>
    `
}

const filtrarPorGenero = () => {
    const genero = document.getElementById('filtroGenero').value
    if (genero === 'todos') {
        renderizarLibros()
        mostrarResumen(libros)
    } else {
        const librosFiltrados = libros.filter(libro => libro.genero === genero)
        renderizarLibros(librosFiltrados)
        mostrarResumen(librosFiltrados)
    }
}


const actualizarSelectGenero = () => {
    const select = document.getElementById('filtroGenero')
    const generosUnicos = [...new Set(libros.map(libro => libro.genero))]
    select.innerHTML = `<option value="todos">Todos</option>`
    generosUnicos.forEach(genero => {
        const option = document.createElement('option')
        option.value = genero
        option.text = genero
        select.appendChild(option)
    })  
}

const eliminarLibro = (index) => {
    libros.splice(index, 1)
    localStorage.setItem('libros', JSON.stringify(libros))
    renderizarLibros()
    mostrarResumen(libros)
    actualizarSelectGenero()
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarLibros()
    mostrarResumen(libros)
    actualizarSelectGenero()
})



/* Falta agregar funcion de ordenar por año de publicacion
Y tambien hacer el bonus
*** chebox (leido)
*** Mostrar en el resumen cuántos libros fueron leídos / no leídos
*** Filtro adicional para mostrar solo leídos / no leídos
*/