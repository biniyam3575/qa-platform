// answerRoutes.js
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET ANSWERS BY QUESTION ID
router.get('/question/:questionId', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const [answers] = await promisePool.query(`
            SELECT a.*, u.userName, u.first_name, u.last_name, u.profile_image
            FROM answers a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.question_id = ?
            ORDER BY a.is_accepted DESC, a.upvotes DESC, a.created_at ASC
        `, [questionId]);
        res.json({ success: true, count: answers.length, answers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST NEW ANSWER
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { question_id, content } = req.body;
        const user_id = req.user.userId;
        if (!question_id || !content) return res.status(400).json({ success: false, message: 'Fields missing' });

        const [result] = await promisePool.query(
            'INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)',
            [question_id, user_id, content]
        );
        const [newAnswer] = await promisePool.query(`
            SELECT a.*, u.userName, u.first_name, u.last_name, u.profile_image
            FROM answers a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.answer_id = ?
        `, [result.insertId]);
        res.status(201).json({ success: true, answer: newAnswer[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPVOTE ANSWER
router.put('/:id/upvote', authMiddleware, async (req, res) => {
    try {
        await promisePool.query('UPDATE answers SET upvotes = upvotes + 1 WHERE answer_id = ?', [req.params.id]);
        const [updated] = await promisePool.query(`
            SELECT a.*, u.userName, u.profile_image FROM answers a
            JOIN users u ON a.user_id = u.user_id WHERE a.answer_id = ?
        `, [req.params.id]);
        res.json({ success: true, answer: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ACCEPT ANSWER (toggle) — also keeps the parent question's is_solved in sync
router.put('/:id/accept', authMiddleware, async (req, res) => {
    const connection = await promisePool.getConnection();
    try {
        const userId = req.user.userId;
        const answerId = req.params.id;

        const [rows] = await connection.query(`
            SELECT a.question_id, a.is_accepted, q.user_id as owner_id
            FROM answers a
            JOIN questions q ON a.question_id = q.question_id
            WHERE a.answer_id = ?
        `, [answerId]);

        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        const { question_id, is_accepted, owner_id } = rows[0];

        if (owner_id !== userId) {
            connection.release();
            return res.status(403).json({ success: false, message: 'Only the question author can accept an answer' });
        }

        await connection.beginTransaction();

        if (is_accepted) {
            // Already accepted -> un-accept it and reopen the question
            await connection.query('UPDATE answers SET is_accepted = false WHERE answer_id = ?', [answerId]);
            await connection.query('UPDATE questions SET is_solved = false WHERE question_id = ?', [question_id]);
        } else {
            // Clear any previously accepted answer for this question, then accept this one
            await connection.query('UPDATE answers SET is_accepted = false WHERE question_id = ?', [question_id]);
            await connection.query('UPDATE answers SET is_accepted = true WHERE answer_id = ?', [answerId]);
            await connection.query('UPDATE questions SET is_solved = true WHERE question_id = ?', [question_id]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: is_accepted ? 'Answer unaccepted' : 'Answer accepted',
            is_accepted: !is_accepted,
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// UPDATE ANSWER
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const answerId = req.params.id;
        const { content } = req.body;
        const userId = req.user.userId;

        const [ans] = await promisePool.query('SELECT user_id FROM answers WHERE answer_id = ?', [answerId]);
        if (ans.length === 0) return res.status(404).json({ message: 'Not found' });
        if (ans[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await promisePool.query(
            'UPDATE answers SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE answer_id = ?',
            [content, answerId]
        );
        res.json({ success: true, message: 'Updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE ANSWER
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const answerId = req.params.id;
        const userId = req.user.userId;

        const [ans] = await promisePool.query('SELECT user_id FROM answers WHERE answer_id = ?', [answerId]);

        if (ans.length === 0) {
            return res.status(404).json({ success: false, message: 'Answer target not found' });
        }

        if (Number(ans[0].user_id) !== Number(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized permission state' });
        }

        await promisePool.query('DELETE FROM answers WHERE answer_id = ?', [answerId]);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;