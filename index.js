const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const FormData = require('form-data');

const app = express();
const PORT = 3000;

const writeFileAsync = promisify(fs.writeFile);
const unlinkFileAsync = promisify(fs.unlink);

app.get('/', (req, res) => {
  res.send('Welcome to the Image Processing API');
});

app.get('/ip', async (req, res) => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    const data = response.data;
    const serverIP = data.ip;
    res.json({ serverIP });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/image/imgtotext', async (req, res) => {
  const imageUrl = req.query.imageUrl;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const imagePath = path.join(__dirname, 'generateImage.png');
    await writeFileAsync(imagePath, buffer);

    const form = new FormData();
    form.append('apikey', 'iz2P3HPSiKV5WQau01jCzCwODVzxRjB1');
    form.append('image', fs.createReadStream(imagePath), 'generateImage.png');

    const apiResponse = await axios.post('https://goatbot.tk/api/image/imgtotext', form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'if-none-match': 'W/"83-xHLLcJsT2lN0RiI9GnijI4GswMQ"',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'cookie': 'connect.sid=s%3AADUDtlzF77nUevirfNv_Hq9iA1-GQ5GC.miSbQuOfGUMmvqHUmO4k60fMsgJSmPhyAT4lV2B0u0Y',
        'Referer': 'https://goatbot.tk/docs',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });

    const data = apiResponse.data;
    await unlinkFileAsync(imagePath);

    res.json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
