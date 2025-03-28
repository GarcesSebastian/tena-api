import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import formRoutes from './routes/forms.routes.js';
import servicesRoutes from './routes/services.routes.js';
import userRoutes from './routes/user.routes.js';

config();
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '100mb' }));
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

const PORT = process.env.PORT || 3000;

app.use('/user', userRoutes);
app.use('/forms', formRoutes);
app.use('/services', servicesRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});