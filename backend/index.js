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

    // Initialize Database Table
    async function initDB() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    phone VARCHAR(50) NOT NULL,
                    date DATE NOT NULL,
                    urgency_number INTEGER NOT NULL,
                    data JSONB NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(phone, date)
                );
            `);
            console.log('[DB] PostgreSQL connected and table verified.');
        } catch (err) {
            console.error('[DB] Failed to initialize database.', err.message);
        }
    }
    initDB();
} else {
    // Ensure data directory exists for local fallback
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
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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
 * Returns all stored conversations seamlessly
 */
app.get('/api/conversations', async (req, res) => {
    try {
        if (usePostgres) {
            const { rows } = await pool.query(`
                SELECT 
                    id, 
                    phone, 
                    to_char(date, 'YYYY-MM-DD') as date, 
                    urgency_number as "urgencyNumber",
                    data,
                    created_at as "receivedAt"
                FROM conversations
                ORDER BY urgency_number DESC, date DESC, created_at DESC;
            `);

            const conversations = rows.map(row => ({
                id: row.id, phone: row.phone, date: row.date,
                urgencyNumber: row.urgencyNumber, receivedAt: row.receivedAt,
                ...row.data
            }));
            return res.json(conversations);
        } else {
            let conversations = readLocalConversations();
            conversations.sort((a, b) => (b.urgencyNumber || 0) - (a.urgencyNumber || 0));
            return res.json(conversations);
        }
    } catch (err) {
        console.error('[GET /api/conversations] Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * POST /api/n8n
 * Upserts conversation data into either PostgreSQL or Local JSON
 */
app.post('/api/n8n', async (req, res) => {
    const { phone, date, intent, urgencyText, urgencyNumber, actionRequired, fullSummary } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'phone is required' });
    }

    const rawUrgency = urgencyText || req.body.urgency || 'Low';
    let normUrgencyText = 'Low';
    let normUrgencyNumber = 1;

    if (rawUrgency.toLowerCase().includes('high')) {
        normUrgencyText = 'High';
        normUrgencyNumber = 3;
    } else if (rawUrgency.toLowerCase().includes('medium')) {
        normUrgencyText = 'Medium';
        normUrgencyNumber = 2;
    }

    const insertDate = date || new Date().toISOString().split('T')[0];
    const finalUrgencyNum = urgencyNumber || normUrgencyNumber;

    const jsonData = {
        intent: (intent || req.body.summary || '').trim(),
        urgencyText: normUrgencyText,
        actionRequired: (actionRequired || '').trim(),
        fullSummary: (fullSummary || '').trim()
    };

    if (usePostgres) {
        try {
            const result = await pool.query(`
                INSERT INTO conversations (phone, date, urgency_number, data, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (phone, date) 
                DO UPDATE SET 
                    urgency_number = EXCLUDED.urgency_number,
                    data = EXCLUDED.data,
                    created_at = NOW()
                RETURNING id;
            `, [phone.trim(), insertDate, finalUrgencyNum, jsonData]);

            console.log(`[POST /api/n8n] Record saved to PostgreSQL: ${phone}`);
            return res.status(200).json({ success: true, id: result.rows[0].id });
        } catch (err) {
            console.error('[POST /api/n8n] DB Error:', err);
            return res.status(500).json({ error: 'Database insert failed' });
        }
    } else {
        const record = {
            id: Date.now(),
            phone: phone.trim(),
            date: insertDate,
            urgencyNumber: finalUrgencyNum,
            receivedAt: new Date().toISOString(),
            ...jsonData
        };

        const conversations = readLocalConversations();
        const existingIndex = conversations.findIndex(c => c.phone === record.phone && c.date === record.date);

        if (existingIndex !== -1) {
            conversations[existingIndex] = { ...conversations[existingIndex], ...record };
            console.log(`[POST /api/n8n] Updated local record: ${record.phone}`);
        } else {
            conversations.push(record);
            console.log(`[POST /api/n8n] New local record saved: ${record.phone}`);
        }

        writeLocalConversations(conversations);
        return res.status(200).json({ success: true, id: record.id });
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
