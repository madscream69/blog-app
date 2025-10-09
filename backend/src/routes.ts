import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Храни в .env!

// Регистрация
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Логин
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Middleware для проверки JWT
const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Создание поста
router.post('/posts', authMiddleware, async (req: any, res) => {
    const { title, content } = req.body;
    try {
        const post = await db.one(
            'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, title, content]
        );
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Получение всех постов
router.get('/posts', async (req, res) => {
    try {
        const posts = await db.any('SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Получение поста по ID
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await db.oneOrNone(
            'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1',
            [req.params.id]
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Обновление поста
router.put('/posts/:id', authMiddleware, async (req: any, res) => {
    const { title, content } = req.body;
    try {
        const post = await db.oneOrNone('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        if (!post) return res.status(403).json({ error: 'Not authorized or post not found' });
        await db.none('UPDATE posts SET title = $1, content = $2 WHERE id = $3', [title, content, req.params.id]);
        res.json({ message: 'Post updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Удаление поста
router.delete('/posts/:id', authMiddleware, async (req: any, res) => {
    try {
        const post = await db.oneOrNone('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        if (!post) return res.status(403).json({ error: 'Not authorized or post not found' });
        await db.none('DELETE FROM posts WHERE id = $1', [req.params.id]);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Создание комментария
router.post('/posts/:id/comments', authMiddleware, async (req: any, res) => {
    const { content } = req.body;
    try {
        const comment = await db.one(
            'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, req.user.userId, content]
        );
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Получение комментариев к посту
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const comments = await db.any(
            'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1',
            [req.params.id]
        );
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

export default router;