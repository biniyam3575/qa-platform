// questionRoutes.js
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET ALL QUESTIONS
router.get('/', async (req, res) => {
    try {
        const [questions] = await promisePool.query(`
            SELECT q.*, u.userName, u.first_name, u.last_name, u.profile_image,
                   (SELECT COUNT(*) FROM answers WHERE question_id = q.question_id) as answer_count
            FROM questions q
            JOIN users u ON q.user_id = u.user_id
            ORDER BY q.created_at DESC
        `);
        res.json({ success: true, count: questions.length, questions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET USER'S OWN QUESTIONS
router.get('/user/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [questions] = await promisePool.query(
            'SELECT * FROM questions WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CREATE QUESTION
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId;
        if (!title || !content) return res.status(400).json({ success: false, message: 'Required fields missing' });

        const [result] = await promisePool.query(
            'INSERT INTO questions (user_id, title, content) VALUES (?, ?, ?)',
            [userId, title, content]
        );
        res.status(201).json({ success: true, message: 'Question created', questionId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE QUESTION
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const questionId = req.params.id;
        const { title, content } = req.body;
        const userId = req.user.userId;

        const [question] = await promisePool.query('SELECT user_id FROM questions WHERE question_id = ?', [questionId]);
        if (question.length === 0) return res.status(404).json({ message: 'Not found' });
        if (question[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await promisePool.query(
            'UPDATE questions SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE question_id = ?',
            [title, content, questionId]
        );
        res.json({ success: true, message: 'Updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE QUESTION
router.delete('/:id', authMiddleware, async (req, res) => {
    const connection = await promisePool.getConnection();
    try {
        const questionId = req.params.id;
        const userId = req.user.userId;

        const [question] = await connection.query('SELECT user_id FROM questions WHERE question_id = ?', [questionId]);
        if (question.length === 0) return res.status(404).json({ message: 'Not found' });
        if (question[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await connection.beginTransaction();
        await connection.query('DELETE FROM answers WHERE question_id = ?', [questionId]);
        await connection.query('DELETE FROM questions WHERE question_id = ?', [questionId]);
        await connection.commit();

        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// GET SINGLE QUESTION (does NOT increment views anymore)
router.get('/:id', async (req, res) => {
    try {
        const questionId = req.params.id;

        const [question] = await promisePool.query(`
            SELECT q.*, u.userName, u.first_name, u.last_name, u.profile_image
            FROM questions q
            JOIN users u ON q.user_id = u.user_id
            WHERE q.question_id = ?
        `, [questionId]);

        if (question.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, question: question[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// INCREMENT VIEW COUNT (separate, explicit endpoint — called once per visit)
router.post('/:id/view', async (req, res) => {
    try {
        const questionId = req.params.id;
        await promisePool.query(
            'UPDATE questions SET views = views + 1 WHERE question_id = ?',
            [questionId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;