import { pool } from '../database/config.js';
import requestIp from 'request-ip';
import axios from 'axios';

export const CreateForm = async (req, res) => {
    try {
        const { nombre, email, mensaje, fecha, leido = false } = req.body;

        if (!nombre || !email || !mensaje || !fecha) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const [result] = await pool.execute(
            'INSERT INTO mensajes (nombre, email, mensaje, fecha, leido) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, mensaje, fecha, leido]
        );

        return res.status(201).json({ message: 'Mensaje creado', id: result.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const GetAllForms = async (req, res) => {
    try {
        // Obtener mensajes de la base de datos primero
        const [rows] = await pool.execute('SELECT * FROM mensajes ORDER BY fecha DESC');
        
        // Obtener la IP del cliente usando x-forwarded-for o remoteAddress
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   req.connection?.remoteAddress;
        
        let clientInfo = {};
        try {
            // Usar el campo fields=66846719 para solicitar todos los campos disponibles
            const response = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
            clientInfo = response.data;
        } catch (geoError) {
            console.error('Error al consultar el servicio de geolocalización:', geoError.message);
            clientInfo = { 
                error: 'Error en el servicio de geolocalización',
                ip
            };
        }
        
        // Devolver los mensajes junto con la información de IP
        return res.json({
            messages: rows,
            clientInfo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const GetFormById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM mensajes WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const UpdateForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { leido } = req.body;

        const [result] = await pool.execute('UPDATE mensajes SET leido = ? WHERE id = ?', [leido, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        return res.json({ message: 'Mensaje actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const DeleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM mensajes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        return res.json({ message: 'Mensaje eliminado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
