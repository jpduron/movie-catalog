const API_URL = '/api/movies';

let moviesData = [];
let currentPage = 1;
const rowsPerPage = 5;

// Elementos del DOM
const tableBody = document.getElementById('moviesTableBody');
const modal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');
const modalTitle = document.getElementById('modalTitle');
const btnOpenCreate = document.getElementById('btnOpenCreate');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnClose = document.getElementById('btnClose');
const paginationControls = document.getElementById('paginationControls');

// Cargar películas al iniciar
document.addEventListener('DOMContentLoaded', fetchMovies);

async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        moviesData = await response.json();
        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Error al cargar las películas:', error);
    }
}

// Renderizar tabla con paginación
function renderTable() {
    tableBody.innerHTML = '';
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = moviesData.slice(start, end);

    if (paginatedItems.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No hay películas registradas.</td></tr>`;
        return;
    }

    paginatedItems.forEach(movie => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${movie.cover || 'https://via.placeholder.com/40x60?text=No+Img'}" class="movie-thumb" alt="Portada"></td>
            <td><strong>${movie.title}</strong></td>
            <td>${movie.year || 'N/D'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openModal(${movie.id}, 'view')">Ver</button>
                <button class="btn btn-success btn-sm" onclick="openModal(${movie.id}, 'edit')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteMovie(${movie.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Renderizar controles de paginación
function renderPagination() {
    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(moviesData.length / rowsPerPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'} btn-sm`;
        btn.style.margin = '0 2px';
        btn.onclick = () => {
            currentPage = i;
            renderTable();
            renderPagination();
        };
        paginationControls.appendChild(btn);
    }
}

// Abrir Modal (Modo: 'create', 'edit', 'view')
async function openModal(id = null, mode = 'create') {
    modal.style.display = 'flex';
    movieForm.reset();
    document.getElementById('movieId').value = '';

    const inputs = movieForm.querySelectorAll('input, textarea');
    inputs.forEach(input => input.disabled = false);
    document.getElementById('btnSave').style.display = 'inline-block';

    if (mode === 'create') {
        modalTitle.innerText = 'Agregar Nueva Película';
    } else {
        // Cargar datos de la película seleccionada
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const movie = await response.json();

            document.getElementById('movieId').value = movie.id;
            document.getElementById('title').value = movie.title;
            document.getElementById('year').value = movie.year || '';
            document.getElementById('cover').value = movie.cover || '';
            document.getElementById('synopsis').value = movie.synopsis || '';

            if (mode === 'view') {
                modalTitle.innerText = 'Consultar Detalle de Película';
                inputs.forEach(input => input.disabled = true);
                document.getElementById('btnSave').style.display = 'none';
            } else {
                modalTitle.innerText = 'Editar Película';
            }
        } catch (error) {
            console.error('Error al obtener la película:', error);
        }
    }
}

// Cerrar Modal
function closeModalFunc() {
    modal.style.display = 'none';
}

btnOpenCreate.onclick = () => openModal(null, 'create');
btnCloseModal.onclick = closeModalFunc;
btnClose.onclick = closeModalFunc;

// Guardar (Crear o Actualizar)
movieForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('movieId').value;
    
    const movieData = {
        title: document.getElementById('title').value,
        year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null,
        cover: document.getElementById('cover').value,
        synopsis: document.getElementById('synopsis').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });

        if (response.ok) {
            closeModalFunc();
            fetchMovies();
        } else {
            alert('Error al guardar la película');
        }
    } catch (error) {
        console.error('Error en la petición:', error);
    }
};

// Eliminar película
async function deleteMovie(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta película?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchMovies();
        } else {
            alert('Error al eliminar');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}