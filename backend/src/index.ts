import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3001', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

// Инициализация БД при старте
initDb().then(() => {
    console.log('Database initialized');
}).catch(err => {
    console.error('Database initialization failed:', err);
});

// Тестовый роут
app.get('/', (req, res) => {
    res.send('Hello from backend!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});