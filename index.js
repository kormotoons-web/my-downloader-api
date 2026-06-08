const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// অল-ইন-ওয়ান ডাউনলোডার রাউট (কোবাল্ট ব্যাকএন্ড ফ্রন্ট)
app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                videoQuality: '720',
                downloadMode: 'auto'
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({ status: 'error', text: 'Target server busy' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', text: 'Server processing failed' });
    }
});

module.exports = app;
