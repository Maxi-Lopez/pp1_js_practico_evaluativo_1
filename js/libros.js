let libros = JSON.parse(localStorage.getItem('libros')) || []
let editando = false;
let indiceEditar = null;
let orden = true;

const capitalizarPrimerLetra = (str) => {
    return str
        .toLowerCase() 
        .replace(/\b\w/g, (letra) => letra.toUpperCase()); 
}

const agregarLibro = () => {
    const titulo = capitalizarPrimerLetra(document.getElementById('titulo').value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    const autor = capitalizarPrimerLetra(document.getElementById('autor').value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    const anio = Number(document.getElementById('anio').value)
    const genero = document.getElementById('genero').value.trim()

    const anioActual = new Date().getFullYear()

    if (anio < 1900 || anio > anioActual) {
        alert('El año debe estar entre 1900 y ' + anioActual)
        return
    }
    if (editando) {
        libros[indiceEditar] = { titulo, autor, anio, genero, leido: libros[indiceEditar].leido }
        editando = false
        indiceEditar = null
        document.querySelector('button[type="submit"]').innerText = 'Agregar'
    } else {
        const existe = libros.some(libro =>
            libro.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") &&
            libro.autor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === autor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        )
        if (existe) {
            alert('El libro ya existe')
            return
        }

        libros.push({ titulo, autor, anio, genero, leido: false })
    }

    localStorage.setItem('libros', JSON.stringify(libros))
    renderizarLibros()
    mostrarResumen(libros)
    actualizarSelectGenero()

    document.getElementById('titulo').value = ''
    document.getElementById('autor').value = ''
    document.getElementById('anio').value = ''
    document.getElementById('genero').value = ''
}

const buscarLibros = () => {
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
            <td>
            <label>
                <input type="checkbox" class="leido-checkbox" data-index="${indexReal}" ${libro.leido ? 'checked' : ''}>
                Leído
            </label>
            </td>
        `
        tabla.appendChild(fila)
        const checkbox = fila.querySelector('.leido-checkbox')
        checkbox.addEventListener('change', (e) => {
            const i = parseInt(e.target.dataset.index)
            libros[i].leido = e.target.checked
            localStorage.setItem('libros', JSON.stringify(libros))
            mostrarResumen(libros)
    })
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
    const leidos = libros.filter(libro => libro.leido).length
    const noLeidos = libros.filter(libro => !libro.leido).length

    resumen.innerHTML = `
        <p><strong>Total de libros: </strong>${total}</p>
        <p><strong>Promedio de año de edición: </strong>${promedio}</p>
        <p><strong>Libros posteriores a 2010: </strong>${posterioresA2010}</p>
        <p><strong>Libro más nuevo: </strong>${libroNuevo.titulo} de ${libroNuevo.autor}, ${libroNuevo.anio}</p>
        <p><strong>Libro más viejo: </strong>${libroViejo.titulo} de ${libroViejo.autor}, ${libroViejo.anio}</p>
        <p><strong>Cantidad de libros leídos: </strong>${leidos}</p>
        <p><strong>Cantidad de libros no leídos: </strong>${noLeidos}</p>
    `
}


const filtrarLibros = () => {
    const genero = document.getElementById('filtroGenero').value
    const leido = document.getElementById('filtroLeido').value

    let librosFiltrados = [...libros]; 

    if (genero !== 'todos') {
        librosFiltrados = librosFiltrados.filter(libro => libro.genero === genero)
    }

    if (leido !== 'todos') {
        let esLeido
        if (leido === 'leidos') {
            esLeido = true
        } else {
            esLeido = false
        }
        librosFiltrados = librosFiltrados.filter(libro => libro.leido === esLeido);
    }

    renderizarLibros(librosFiltrados);
    mostrarResumen(librosFiltrados);
}



const ordenarLibro = () => {
    if (orden) {
        const ordenar = libros.sort((a, b) => a.anio - b.anio)
        orden = false
    } else {
        const ordenar = libros.sort((a, b) => b.anio - a.anio)
        orden = true
    }
    renderizarLibros()
    mostrarResumen(libros)
    actualizarSelectGenero()
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
