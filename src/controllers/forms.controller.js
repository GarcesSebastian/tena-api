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
        let clientIp = requestIp.getClientIp(req);
        
        if (clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
            clientIp = '8.8.8.8';
        }
        
        let ipInfo = {};
        try {
            const response = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,message,country,regionName,city,district,zip,timezone,isp,org,as,lat,lon,mobile,proxy,hosting`);
            ipInfo = response.data;
            
            if (ipInfo.status !== 'success') {
                console.error('Error al obtener información de IP:', ipInfo.message);
                ipInfo = { error: 'No se pudo obtener información de geolocalización' };
            }
        } catch (geoError) {
            console.error('Error al consultar el servicio de geolocalización:', geoError.message);
            ipInfo = { error: 'Error en el servicio de geolocalización' };
        }

        const [rows] = await pool.execute('SELECT * FROM mensajes ORDER BY fecha DESC');
        
        return res.json({
            messages: rows,
            clientInfo: {
                ip: clientIp,
                country: ipInfo.country || 'No disponible',
                region: ipInfo.regionName || 'No disponible',
                city: ipInfo.city || 'No disponible',
                district: ipInfo.district || 'No disponible',
                zipCode: ipInfo.zip || 'No disponible',
                timezone: ipInfo.timezone || 'No disponible',
                isp: ipInfo.isp || 'No disponible',
                coordinates: {
                    latitude: ipInfo.lat || null,
                    longitude: ipInfo.lon || null
                },
                organization: ipInfo.org || 'No disponible',
                connectionType: ipInfo.mobile ? 'Móvil' : 'Fijo',
                as: ipInfo.as || 'No disponible',
                proxy: ipInfo.proxy || false,
                hosting: ipInfo.hosting || false
            }
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
