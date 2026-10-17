const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Conexión a la base de datos MySQL en Aiven usando un Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }, // Requerido por Aiven
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos de Aiven:', err.message);
    } else {
        console.log('✅ Conectado exitosamente a la base de datos MySQL en Aiven');
        connection.release();
    }
});

// --- API REST CRUD ---

// 1. OBTENER TODAS LAS PELÍCULAS (con paginación básica opcional)
app.get('/api/movies', (req, res) => {
    const query = 'SELECT * FROM movies ORDER BY created_at DESC';
    pool.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener las películas' });
        }
        res.json(results);
    });
});

// 2. OBTENER UNA PELÍCULA POR ID (para consultar detalle o editar)
app.get('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM movies WHERE id = ?';
    pool.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la película' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }
        res.json(results[0]);
    });
});

// 3. CREAR UNA NUEVA PELÍCULA
app.post('/api/movies', (req, res) => {
    const { title, synopsis, year, cover } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const query = 'INSERT INTO movies (title, synopsis, year, cover) VALUES (?, ?, ?, ?)';
    pool.query(query, [title, synopsis, year, cover], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al crear la película' });
        }
        res.status(201).json({ id: results.insertId, message: 'Película creada exitosamente' });
    });
});

// 4. ACTUALIZAR UNA PELÍCULA
app.put('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const { title, synopsis, year, cover } = req.body;

    const query = 'UPDATE movies SET title = ?, synopsis = ?, year = ?, cover = ? WHERE id = ?';
    pool.query(query, [title, synopsis, year, cover, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar la película' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }
        res.json({ message: 'Película actualizada correctamente' });
    });
});

// 5. ELIMINAR UNA PELÍCULA
app.delete('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM movies WHERE id = ?';
    pool.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar la película' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }
        res.json({ message: 'Película eliminada correctamente' });
    });
});

// Arrancar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});