const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // Cobalt এপিআই-এর একদম লেটেস্ট ও স্ট্যান্ডার্ড গ্লোবাল এন্ডপয়েন্ট ব্যবহার
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                url: url,
                videoQuality: '720',
                downloadMode: 'auto',
                audioFormat: 'mp3',
                audioBitrate: '320'
            })
        });

        // যদি রেসপন্স ওকে থাকে, ডাটা ফ্রন্টএন্ডে পাঠিয়ে দিবে
        if (response.ok) {
            const data = await response.json();
            return res.json(data);
        }

        // যদি মেইন সার্ভার ফেল করে, ব্যাকআপ হিসেবে wuk.sh ইঞ্জিন রান করবে
        const backupResponse = await fetch('https://co.wuk.sh/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                vQuality: 'max',
                isAudioOnly: false
            })
        });

        if (backupResponse.ok) {
            const backupData = await backupResponse.json();
            return res.json(backupData);
        }

        const errText = await response.text().catch(() => 'Engine busy');
        res.status(500).json({ status: 'error', text: errText });

    } catch (error) {
        console.error('Server execution error:', error.message);
        res.status(500).json({ status: 'error', text: 'Connection timeout or issue' });
    }
});

module.exports = app;
