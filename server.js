import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 7000;
const BASE_URL = 'https://www.albumaty.com';

app.use(cors());

const client = axios.create({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
  },
});

// 1. Manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.albumaty.tunes',
    version: '1.0.0',
    name: 'Albumaty Arabic Music',
    description: 'أرشيف الأغاني والموسيقى العربية من البوماتي',
    resources: ['search', 'stream'],
  });
});

// 2. Search
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ tracks: [] });
    }

    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
    const response = await client.get(searchUrl);
    const $ = cheerio.load(response.data);

    const tracks = [];

    $('a[href*="/song/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const songId = href.match(/\/song\/(\d+)\.html/)?.[1];
      const title = $(el).text().trim();
      const poster = $(el).find('img').attr('src') || '';

      if (songId && title && !tracks.some((t) => t.id === songId)) {
        tracks.push({
          id: songId,
          title: title,
          artist: 'البوماتي',
          album: 'أغاني عربية',
          cover: poster.startsWith('http') ? poster : `${BASE_URL}${poster}`,
        });
      }
    });

    res.json({ tracks });
  } catch (err) {
    console.error('Search error:', err.message);
    res.json({ tracks: [] });
  }
});

// 3. Stream
app.get('/stream/:id', async (req, res) => {
  try {
    const songId = req.params.id;
    const songPageUrl = `${BASE_URL}/song/${songId}.html`;

    const response = await client.get(songPageUrl);
    const $ = cheerio.load(response.data);

    let streamUrl = null;

    const audioSrc = $('audio source').attr('src') || $('audio').attr('src');
    if (audioSrc && audioSrc.includes('.mp3')) {
      streamUrl = audioSrc;
    }

    if (!streamUrl) {
      $('a[href*=".mp3"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          streamUrl = href;
          return false;
        }
      });
    }

    if (!streamUrl) {
      const scriptContent = $('script').text();
      const match = scriptContent.match(/https?:\/\/[^"']+\.mp3/i);
      if (match) {
        streamUrl = match[0];
      }
    }

    if (!streamUrl) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    if (!streamUrl.startsWith('http')) {
      streamUrl = streamUrl.startsWith('/') ? `${BASE_URL}${streamUrl}` : `${BASE_URL}/${streamUrl}`;
    }

    res.json({ url: streamUrl });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Tunes Add-on listening on port ${PORT}`);
});
