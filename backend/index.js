/**
 * =====================================================
 * Looks Salon – AI Receptionist API Server
 * Architecture: Node.js (Express) + PostgreSQL (JSONB)
 * Environment: Supports both Local JSON and PostgreSQL
 * =====================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Hardcoded Credentials
const VALID_USERS = [
    'dipen.makati@optywise.com',
    'dhruv.vaghasiya@optywise.com'
];
const VALID_PASSWORD = 'Optyw!#3Admin125';

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------
// Storage Configuration (PostgreSQL vs Local JSON)
// ---------------------------------------------------
const usePostgres = !!process.env.DATABASE_URL;
let pool;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'conversations.json');

if (usePostgres) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    async function initDB() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    phone VARCHAR(50) NOT NULL UNIQUE,
                    conversation_id VARCHAR(50),
                    date DATE NOT NULL,
                    urgency_number INTEGER NOT NULL DEFAULT 1,
                    last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(20) NOT NULL DEFAULT 'unattended',
                    data JSONB NOT NULL DEFAULT '{}'::jsonb,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            // Add new columns to existing tables if they don't exist
            await pool.query(`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(50);`);
            await pool.query(`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
            await pool.query(`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'unattended';`);
            console.log('[DB] PostgreSQL connected and table verified.');
        } catch (err) {
            console.error('[DB] Failed to initialize database.', err.message);
        }
    }
    initDB();
} else {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    console.log('[DB] Running in LOCAL mode (saving to data/conversations.json)');
}

function readLocalConversations() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        return [];
    }
}

function writeLocalConversations(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ---------------------------------------------------
// Routes
// ---------------------------------------------------

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Looks Salon API',
        mode: usePostgres ? 'PostgreSQL' : 'Local JSON'
    });
});

/**
 * GET /api/conversations
 * Returns all active + unattended conversations, sorted by last_contact_at DESC
 */
app.get('/api/conversations', async (req, res) => {
    try {
        if (usePostgres) {
            const { rows } = await pool.query(`
                SELECT 
                    id, 
                    phone, 
                    conversation_id,
                    to_char(date, 'YYYY-MM-DD') as date, 
                    urgency_number as "urgencyNumber",
                    last_contact_at as "lastContactAt",
                    status,
                    data,
                    created_at as "receivedAt"
                FROM conversations
                WHERE status != 'resolved'
                ORDER BY last_contact_at DESC;
            `);
            const conversations = rows.map(row => ({
                id: row.id, phone: row.phone,
                conversationId: row.conversation_id,
                date: row.date,
                urgencyNumber: row.urgencyNumber,
                lastContactAt: row.lastContactAt,
                receivedAt: row.receivedAt,
                status: row.status,
                ...row.data
            }));
            return res.json(conversations);
        } else {
            let conversations = readLocalConversations();
            // Backfill missing fields for legacy records
            conversations = conversations.map(c => ({
                ...c,
                status: c.status || 'unattended',
                lastContactAt: c.lastContactAt || c.receivedAt,
                summaryHistory: (Array.isArray(c.summaryHistory) && c.summaryHistory.length > 0)
                    ? c.summaryHistory
                    : [{
                        timestamp: c.receivedAt || c.lastContactAt,
                        intent: c.intent,
                        urgencyText: c.urgencyText,
                        actionRequired: c.actionRequired,
                        fullSummary: c.fullSummary,
                    }]
            }));
            // Only return non-resolved, sorted by lastContactAt descending
            conversations = conversations
                .filter(c => c.status !== 'resolved')
                .sort((a, b) => new Date(b.lastContactAt || b.receivedAt || 0) - new Date(a.lastContactAt || a.receivedAt || 0));
            return res.json(conversations);
        }
    } catch (err) {
        console.error('[GET /api/conversations] Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * GET /api/conversations/resolved
 * Returns resolved conversations for analytics
 */
app.get('/api/conversations/resolved', async (req, res) => {
    try {
        if (usePostgres) {
            const { rows } = await pool.query(`
                SELECT id, phone, to_char(date, 'YYYY-MM-DD') as date,
                    urgency_number as "urgencyNumber", last_contact_at as "lastContactAt",
                    status, data, created_at as "receivedAt"
                FROM conversations WHERE status = 'resolved'
                ORDER BY last_contact_at DESC;
            `);
            const conversations = rows.map(row => ({
                id: row.id, phone: row.phone, date: row.date,
                urgencyNumber: row.urgencyNumber, lastContactAt: row.lastContactAt,
                receivedAt: row.receivedAt, status: row.status, ...row.data
            }));
            return res.json(conversations);
        } else {
            const conversations = readLocalConversations()
                .filter(c => c.status === 'resolved')
                .sort((a, b) => new Date(b.lastContactAt || 0) - new Date(a.lastContactAt || 0));
            return res.json(conversations);
        }
    } catch (err) {
        console.error('[GET /api/conversations/resolved] Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * POST /api/n8n
 * Upserts conversation by phone number.
 * On re-contact: appends new summary to history, updates last_contact_at, sets status to unattended.
 * On new contact: creates new record with initial summary history.
 */
app.post('/api/n8n', async (req, res) => {
    const { phone, date, intent, urgencyText, urgencyNumber, actionRequired, fullSummary } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'phone is required' });
    }

    const rawUrgency = urgencyText || req.body.urgency || 'Low';
    let normUrgencyText = 'Low';
    let normUrgencyNumber = 1;

    if (rawUrgency.toLowerCase().includes('high')) { normUrgencyText = 'High'; normUrgencyNumber = 3; }
    else if (rawUrgency.toLowerCase().includes('medium')) { normUrgencyText = 'Medium'; normUrgencyNumber = 2; }

    const insertDate = date || new Date().toISOString().split('T')[0];
    const finalUrgencyNum = urgencyNumber || normUrgencyNumber;
    const now = new Date().toISOString();

    const newSummaryEntry = {
        timestamp: now,
        intent: (intent || req.body.summary || '').trim(),
        urgencyText: normUrgencyText,
        actionRequired: (actionRequired || '').trim(),
        fullSummary: (fullSummary || '').trim(),
    };

    if (usePostgres) {
        try {
            // Try to find existing record for this phone
            const existing = await pool.query(`SELECT id, data FROM conversations WHERE phone = $1`, [phone.trim()]);

            if (existing.rows.length > 0) {
                // Append to history
                const existingData = existing.rows[0].data;
                const summaryHistory = Array.isArray(existingData.summaryHistory)
                    ? [newSummaryEntry, ...existingData.summaryHistory]
                    : [newSummaryEntry];

                const updatedData = {
                    ...existingData,
                    intent: newSummaryEntry.intent,
                    urgencyText: normUrgencyText,
                    actionRequired: newSummaryEntry.actionRequired,
                    fullSummary: newSummaryEntry.fullSummary,
                    summaryHistory,
                };

                await pool.query(`
                    UPDATE conversations SET
                        urgency_number = $1,
                        last_contact_at = $2,
                        status = 'unattended',
                        data = $3
                    WHERE phone = $4
                    RETURNING id;
                `, [finalUrgencyNum, now, updatedData, phone.trim()]);

                console.log(`[POST /api/n8n] Updated thread for: ${phone}`);
                return res.status(200).json({ success: true, action: 'updated', id: existing.rows[0].id });
            } else {
                // New record
                const jsonData = {
                    intent: newSummaryEntry.intent,
                    urgencyText: normUrgencyText,
                    actionRequired: newSummaryEntry.actionRequired,
                    fullSummary: newSummaryEntry.fullSummary,
                    summaryHistory: [newSummaryEntry],
                };

                const result = await pool.query(`
                    INSERT INTO conversations (phone, conversation_id, date, urgency_number, last_contact_at, status, data, created_at)
                    VALUES ($1, $2, $3, $4, $5, 'unattended', $6, NOW())
                    RETURNING id;
                `, [phone.trim(), phone.trim(), insertDate, finalUrgencyNum, now, jsonData]);

                console.log(`[POST /api/n8n] New record saved to PostgreSQL: ${phone}`);
                return res.status(200).json({ success: true, action: 'created', id: result.rows[0].id });
            }
        } catch (err) {
            console.error('[POST /api/n8n] DB Error:', err);
            return res.status(500).json({ error: 'Database insert failed' });
        }
    } else {
        const conversations = readLocalConversations();
        const existingIndex = conversations.findIndex(c => c.phone === phone.trim());

        if (existingIndex !== -1) {
            // Append to existing thread
            const existing = conversations[existingIndex];
            const summaryHistory = Array.isArray(existing.summaryHistory)
                ? [newSummaryEntry, ...existing.summaryHistory]
                : [newSummaryEntry];

            conversations[existingIndex] = {
                ...existing,
                urgencyNumber: finalUrgencyNum,
                lastContactAt: now,
                status: 'unattended',
                intent: newSummaryEntry.intent,
                urgencyText: normUrgencyText,
                actionRequired: newSummaryEntry.actionRequired,
                fullSummary: newSummaryEntry.fullSummary,
                summaryHistory,
            };
            console.log(`[POST /api/n8n] Updated local thread: ${phone}`);
        } else {
            // New record
            const record = {
                id: Date.now(),
                phone: phone.trim(),
                conversationId: phone.trim(),
                date: insertDate,
                urgencyNumber: finalUrgencyNum,
                lastContactAt: now,
                receivedAt: now,
                status: 'unattended',
                intent: newSummaryEntry.intent,
                urgencyText: normUrgencyText,
                actionRequired: newSummaryEntry.actionRequired,
                fullSummary: newSummaryEntry.fullSummary,
                summaryHistory: [newSummaryEntry],
            };
            conversations.push(record);
            console.log(`[POST /api/n8n] New local record saved: ${phone}`);
        }

        writeLocalConversations(conversations);
        return res.status(200).json({ success: true });
    }
});

/**
 * POST /api/login
 * Validates hardcoded credentials
 */
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (VALID_USERS.includes(email.toLowerCase()) && password === VALID_PASSWORD) {
        return res.json({ success: true, token: Buffer.from(email).toString('base64'), user: { email } });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
});

/**
 * PATCH /api/conversations/:id/resolve
 * Marks a conversation as resolved – removed from active list but kept in DB
 */
app.patch('/api/conversations/:id/resolve', async (req, res) => {
    const { id } = req.params;
    if (usePostgres) {
        try {
            const result = await pool.query(
                `UPDATE conversations SET status = 'resolved', data = jsonb_set(data, '{resolved}', 'true'::jsonb) WHERE id = $1 RETURNING id;`,
                [id]
            );
            if (result.rowCount === 0) return res.status(404).json({ error: 'Conversation not found' });
            return res.json({ success: true });
        } catch (err) {
            console.error('[PATCH resolve] DB Error:', err);
            return res.status(500).json({ error: 'Failed to update' });
        }
    } else {
        const conversations = readLocalConversations();
        const idx = conversations.findIndex(c => c.id == id);
        if (idx !== -1) {
            conversations[idx] = { ...conversations[idx], status: 'resolved', resolved: true };
            writeLocalConversations(conversations);
            return res.json({ success: true });
        }
        return res.status(404).json({ error: 'Conversation not found' });
    }
});

/**
 * PATCH /api/conversations/:id/status
 * Updates conversation status (active / unattended)
 */
app.patch('/api/conversations/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'unattended'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    if (usePostgres) {
        try {
            const result = await pool.query(`UPDATE conversations SET status = $1 WHERE id = $2 RETURNING id;`, [status, id]);
            if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Failed to update status' });
        }
    } else {
        const conversations = readLocalConversations();
        const idx = conversations.findIndex(c => c.id == id);
        if (idx !== -1) {
            conversations[idx] = { ...conversations[idx], status };
            writeLocalConversations(conversations);
            return res.json({ success: true });
        }
        return res.status(404).json({ error: 'Not found' });
    }
});

/**
 * DELETE /api/conversations
 * Clears all records
 */
app.delete('/api/conversations', async (req, res) => {
    try {
        if (usePostgres) {
            await pool.query('TRUNCATE TABLE conversations restart identity;');
            return res.json({ success: true, message: 'Cleared PostgreSQL' });
        } else {
            writeLocalConversations([]);
            return res.json({ success: true, message: 'Cleared Local JSON' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// ---------------------------------------------------
// Start server
// ---------------------------------------------------
app.listen(PORT, () => {
    console.log(`\n🌸 Looks Salon API Server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${usePostgres ? 'PostgreSQL 🐘' : 'Local JSON 📁'}`);
});
