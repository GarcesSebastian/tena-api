import { pool } from '../database/config.js';

export const CreateService = async (req, res) => {
    try {
        const { titulo, descripcion, imagen_base64 } = req.body;
        
        if (!titulo || !descripcion || !imagen_base64) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO servicios (titulo, descripcion, imagen_base64) VALUES (?, ?, ?)',
            [titulo, descripcion, imagen_base64]
        );
        
        return res.status(201).json({ 
            message: 'Servicio creado con éxito', 
            servicio: { 
                id: result.insertId,
                titulo,
                descripcion,
                imagen_base64
            } 
        });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const GetAllServices = async (req, res) => {
    try {
        const query = `SELECT * FROM servicios ORDER BY created_at DESC;`;
        const [rows] = await pool.query(query);
        
        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const DeleteService = async (req, res) => {
    try {
        const { id } = req.params;
        
        const serviceId = parseInt(id, 10);
        
        if (isNaN(serviceId)) {
            return res.status(400).json({ error: 'ID de servicio inválido' });
        }
        
        console.log('Eliminando servicio con ID:', serviceId);
        
        const [result] = await pool.execute('DELETE FROM servicios WHERE id = ?', [serviceId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        
        return res.json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}