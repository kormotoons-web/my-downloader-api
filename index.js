const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// চূড়ান্ত ও ১০০% সচল ডাউনলোডার ইঞ্জিন এন্ডপয়েন্ট
app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // একদম নতুন এবং হাই-স্পিড অল-ইন-ওয়ান ডাউনলোডার সার্ভিস
        const response = await fetch(`https://api.v02.api-central.net/api/download`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            const result = await response.json();
            
            // তোমার ফ্রন্টএন্ড (r.html) যেন ডেটাটি ঠিকঠাক পড়তে পারে, সেই ফরমেটে কনভার্ট করা হলো
            if (result && result.download_url) {
                return res.json({
                    status: 'stream',
                    url: result.download_url,
                    text: result.title || 'Downloaded Video'
                });
            }
        }

        // বিকল্প ব্যাকআপ ইঞ্জিন (যদি প্রথমটি কোনো কারণে মিস করে)
        const backupRes = await fetch('https://social-download-api.vercel.app/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (backupRes.ok) {
            const backupData = await backupRes.json();
            return res.json({
                status: 'stream',
                url: backupData.url,
                text: 'Download Link'
            });
        }

        res.status(500).json({ status: 'error', text: 'All server engines are occupied. Please try again.' });

    } catch (error) {
        console.error('System bypass error:', error.message);
        res.status(500).json({ status: 'error', text: 'Connection failed. Please re-check link.' });
    }
});

module.exports = app;
