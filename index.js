const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    // বর্তমান সচল মূল এপিআই এন্ডপয়েন্ট
    const targetApi = 'https://co.wuk.sh/api/json';

    try {
        const response = await fetch(targetApi, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://cobalt.tools',
                'Referer': 'https://cobalt.tools/'
            },
            // এটিই হচ্ছে ইনস্টাগ্রাম রিলসের জন্য বর্তমান নিখুঁত প্যারামিটার ফরমেট
            body: JSON.stringify({
                url: url,
                vQuality: 'max',      // কোয়ালিটি 'max' দিতে হবে, ৭২০ দিলে এরর আসে
                filenamePattern: 'classic',
                isAudioOnly: false,
                isNoTTWatermark: true,
                disableMetadata: false
            })
        });

        if (response.ok) {
            const data = await response.json();
            return res.json(data);
        }

        // যদি কোনো কারণে ফেল করে, তবে এরর কোড সহ ডিটেইলস পাস করবে
        const errText = await response.text();
        console.error('API Error Response:', errText);
        res.status(response.status).json({ status: 'error', text: 'Server response failure. Try another link.' });

    } catch (error) {
        console.error('System Error:', error.message);
        res.status(500).json({ status: 'error', text: 'Bypass engine failed.' });
    }
});

module.exports = app;
