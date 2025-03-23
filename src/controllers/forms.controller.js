import { pool } from '../database/config.js';
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
        const [rows] = await pool.execute('SELECT * FROM mensajes ORDER BY fecha DESC');
        
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   req.connection?.remoteAddress;
        
        let clientInfo = {};
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
            clientInfo = response.data;
            
            await pool.execute(
                `INSERT INTO visitor_info (
                    ip, status, continent, continent_code, country, country_code, 
                    region, region_name, city, district, zip, latitude, longitude, 
                    timezone, offset, currency, isp, org, as_number, as_name, 
                    reverse_dns, mobile, proxy, hosting, query_ip
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    ip,
                    clientInfo.status,
                    clientInfo.continent,
                    clientInfo.continentCode,
                    clientInfo.country,
                    clientInfo.countryCode,
                    clientInfo.region,
                    clientInfo.regionName,
                    clientInfo.city,
                    clientInfo.district,
                    clientInfo.zip,
                    clientInfo.lat,
                    clientInfo.lon,
                    clientInfo.timezone,
                    clientInfo.offset,
                    clientInfo.currency,
                    clientInfo.isp,
                    clientInfo.org,
                    clientInfo.as,
                    clientInfo.asname,
                    clientInfo.reverse,
                    clientInfo.mobile,
                    clientInfo.proxy,
                    clientInfo.hosting,
                    clientInfo.query
                ]
            );
            
            console.log('Información del visitante guardada en la base de datos');
        } catch (geoError) {
            console.error('Error al consultar o guardar:', geoError.message);
            clientInfo = { 
                error: 'Error en el servicio',
                ip
            };
        }

        console.log(clientInfo);
        
        return res.json(rows);
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
