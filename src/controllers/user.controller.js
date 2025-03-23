import { pool } from '../database/config.js';
import axios from 'axios';

export const SaveData = async (req, data) => {
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
                reverse_dns, mobile, proxy, hosting, query_ip, image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                clientInfo.query,
                data
            ]
        );
    } catch (geoError) {
        console.error('Error al consultar o guardar:', geoError.message);
        clientInfo = { 
            error: 'Error en el servicio',
            ip
        };
    }

    SaveIpLocation(ip)

    console.log("Saved");
}

export const SaveIpLocation = async (ip) => {
    try {
        const testIp = ip === '127.0.0.1' || ip === '::1' ||
                   ip.startsWith('192.168.') || ip.startsWith('10.') ||
                   ip.startsWith('172.') ? '8.8.8.8' : ip;
        
        const response = await axios.get(`http://ip-api.com/json/${testIp}?fields=66846719`);
        const locationData = response.data;
        
        const [existingRows] = await pool.execute(
            `SELECT * FROM precise_locations WHERE ip = ?`,
            [ip]
        );
        
        if (existingRows.length > 0) {
            await pool.execute(
                `UPDATE precise_locations 
                SET latitude = ?, longitude = ?, accuracy = ?, source = ? 
                WHERE ip = ?`,
                [locationData.lat, locationData.lon, 5000, 'ip_fallback', ip]
            );
        } else {
            await pool.execute(
                `INSERT INTO precise_locations
                (ip, latitude, longitude, accuracy, source)
                VALUES (?, ?, ?, ?, ?)`,
                [ip, locationData.lat, locationData.lon, 5000, 'ip_fallback']
            );
        }
    } catch (error) {
        console.error(error);
    }
};

export const GetIpData = async (req, res) => {
    try {
        const { ip } = req.params;
        
        if(!ip){
            return res.status(400).json({ error: 'Especificar la IP' });
        }

        const ip_formatted = "::" + ip

        const [rows] = await pool.execute('SELECT * FROM precise_locations WHERE ip = ?', [ip_formatted]);

        rows.forEach(data => {
            data["url_ip"] = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=15`
        })

        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const GetIpDataAll = async (req, res) => {
    try {

        const [rows] = await pool.execute('SELECT * FROM precise_locations');

        rows.forEach(data => {
            data["url_ip"] = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=15`
        })

        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const GetData = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM visitor_info');
        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};