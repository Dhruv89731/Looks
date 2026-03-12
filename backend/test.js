const http = require('http');

const payload = JSON.stringify({
    phone: "+91 99887 76655",
    date: "2026-03-11",
    intent: "Customer wants to book a bridal appointment for March 20th.",
    urgencyText: "High",
    urgencyNumber: 3,
    actionRequired: "Call this customer immediately to confirm the bridal slot.",
    fullSummary: "Customer called at 9PM asking about bridal package for March 20th wedding day. Very urgent."
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/n8n',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('POST /api/n8n response:', body);
        // Now GET conversations
        http.get('http://localhost:3001/api/conversations', res2 => {
            let b2 = '';
            res2.on('data', d => b2 += d);
            res2.on('end', () => {
                const records = JSON.parse(b2);
                console.log('GET /api/conversations count:', records.length);
                records.forEach(r => console.log(' -', r.phone, '/', r.urgencyText, '/', r.date));
            });
        });
    });
});
req.write(payload);
req.end();
