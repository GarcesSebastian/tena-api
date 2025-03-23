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
        
        console.log('Información del visitante guardada en la base de datos');
    } catch (geoError) {
        console.error('Error al consultar o guardar:', geoError.message);
        clientInfo = { 
            error: 'Error en el servicio',
            ip
        };
    }

    console.log(clientInfo);
}