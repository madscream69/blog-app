// backend/src/index.ts
import express from 'express'; // Импорт Express
import dotenv from 'dotenv'; // Для загрузки .env
import cors from 'cors';
dotenv.config(); // Загружаем env-переменные

const app = express(); // Создаём приложение
const PORT = process.env.PORT || 5000; // Порт из env или дефолт

app.use(cors({
    origin: 'http://localhost:3000', // Разрешаем только этот адрес
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешённые методы
    credentials: true // Если позже добавим куки или авторизацию
}));
app.use(express.json()); // Парсит JSON в запросах (для POST/PUT)

// Тестовый роут
app.get('/', (req, res) => {
    res.send('Hello from backend, motherfucker frontender pies of shit baby lets go!'); // Ответ на GET /
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Лог при запуске
});