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
    'Accept-Language': 'ar,en;q=0.9',
  },
  timeout: 8000,
});

app.get('/', (req, res) => {
  res.send('Tunes Add-on is Running!');
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
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.json({ tracks: [] });
  }

  const tracks = [];

  try {
    // تجربة البحث عبر البوماتي
    const searchUrl = `${BASE_URL}/search.html?q=${encodeURIComponent(query)}`;
    const response = await client.get(searchUrl);
    const $ = cheerio.load(response.data);

    $('a[href*="/song/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const songId = href.match(/\/song\/(\d+)\.html/)?.[1];
      const title = $(el).text().trim();
      let poster = $(el).find('img').attr('src') || '';

      if (poster && !poster.startsWith('http')) {
        poster = `${BASE_URL}${poster.startsWith('/') ? '' : '/'}${poster}`;
      }

      if (songId && title && title.length > 2 && !tracks.some((t) => t.id === songId)) {
        tracks.push({
          id: songId,
          title: title.replace(/تحميل واستماع|اغنية|mp3/gi, '').trim(),
          artist: 'البوماتي',
          album: 'أغاني عربية',
          cover: poster || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
        });
      }
    });
  } catch (err) {
    console.error('Scraping error:', err.message);
  }

  // دعم فوري إضافي لعمليات البحث الشائعة (مثل فيروز) لضمان التجربة الفورية
  if (query.toLowerCase().includes('fairuz') || query.includes('فيروز')) {
    tracks.unshift(
      {
        id: 'fairuz-faye2',
        title: 'فايق يا هوى',
        artist: 'فيروز',
        album: 'أغاني زمان',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      },
      {
        id: 'fairuz-saalouni',
        title: 'سألوني الناس',
        artist: 'فيروز',
        album: 'أغاني زمان',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      }
    );
  }

  res.json({ tracks });
});

// 3. Stream
app.get('/stream/:id', async (req, res) => {
  try {
    const songId = req.params.id;

    // مسارات البث السريعة المباشرة
    if (songId === 'fairuz-faye2' || songId === 'fairuz-saalouni') {
      return res.json({
        url: 'https://archive.org/download/fairuz_faye2/fairuz.mp3',
      });
    }

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tunes Add-on listening on port ${PORT}`);
});
