const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// মাল্টি-সার্ভার ডাউনলোডার এপিআই এন্ডপয়েন্ট
app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    // শুধুমাত্র সচল এবং রানিং অফিশিয়াল কোবাল্ট ইনস্ট্যান্স
    const cobaltInstances = [
        'https://api.cobalt.tools/api/json'
    ];

    let success = false;
    let lastError = 'Target server busy';

    for (const apiUrl of cobaltInstances) {
        try {
            // Vercel-এর জন্য টাইমআউট কন্ট্রোল অ্যাড করা হলো যাতে রিকোয়েস্ট ঝুলে না থাকে
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 6000);

            const response = await fetch(apiUrl, {
                method: 'POST',
                signal: controller.signal,
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

            clearTimeout(id);

            if (response.ok) {
                const data = await response.json();
                res.json(data);
                success = true;
                break; // সফল হলে লুপ থেকে বের হয়ে যাবে
            } else {
                const errData = await response.json().catch(() => ({}));
                lastError = errData.text || `Server returned status ${response.status}`;
            }
        } catch (error) {
            console.error(`Failed to fetch from ${apiUrl}:`, error.message);
            lastError = error.message;
        }
    }

    if (!success) {
        res.status(500).json({ status: 'error', text: lastError });
    }
});

module.exports = app;
