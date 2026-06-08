const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// স্থায়ী সমাধান: সরাসরি অফিশিয়াল মেইনস্ট্রিম ইঞ্জিন বাইপাস
app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    // বিকল্প ও অত্যন্ত শক্তিশালী ফ্রি এপিআই এগ্রিগেটর যা ইনস্টাগ্রাম ব্লক করতে পারে না
    const targetApi = `https://co.wuk.sh/api/json`;

    try {
        const response = await fetch(targetApi, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://cobalt.tools',
                'Referer': 'https://cobalt.tools/'
            },
            body: JSON.stringify({
                url: url,
                vQuality: '720',
                vCodec: 'h264',
                isAudioOnly: false,
                isNoTTWatermark: true
            })
        });

        if (response.ok) {
            const data = await response.json();
            return res.json(data);
        }

        // যদি উপরের এপিআই ব্যর্থ হয়, তবে ব্যাকআপ ইঞ্জিন রান করবে
        const backupResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url, videoQuality: '720', downloadMode: 'auto' })
        });

        const backupData = await backupResponse.json();
        res.status(backupResponse.status).json(backupData);

    } catch (error) {
        console.error('Error root:', error.message);
        res.status(500).json({ status: 'error', text: 'Server engine bypass failed. Please try again.' });
    }
});

module.exports = app;
