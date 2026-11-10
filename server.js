import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Tunes Full-Song Arabic Music Server is Live!');
});

// 1. Manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.arabicmusic.tunes',
    version: '3.0.0',
    name: 'Arabic Music Universal (Full Tracks)',
    description: 'المكتبة الشاملة لتشغيل الأغاني العربية الكاملة',
    resources: ['search', 'stream']
  });
});

// 2. Search Engine
app.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json({ tracks: [] });

  const tracks = [];

  try {
    // جلب بيانات الأغاني والألبومات بدقة مع صور عالية الدقة
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`;
    const response = await axios.get(itunesUrl, { timeout: 5000 });
    const items = response.data?.results || [];

    items.forEach((item) => {
      const coverImg = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '600x600bb')
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';

      tracks.push({
        id: `full-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        cover: coverImg,
        queryTerm: `${item.artistName} ${item.trackName}`
      });
    });
  } catch (err) {
    console.error('Search error:', err.message);
  }

  res.json({ tracks });
});

// 3. Stream Engine: تحويل الأغنية إلى مسار صوتي كامل عبر مصادر البث المفتوحة
app.get('/stream/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const trackId = rawId.replace('full-', '');

    // البحث عن اسم التراك لجلب ملفه الكامل
    let searchTerm = '';
    try {
      const lookupRes = await axios.get(`https://itunes.apple.com/lookup?id=${trackId}`, { timeout: 4000 });
      const item = lookupRes.data?.results?.[0];
      if (item) {
        searchTerm = `${item.artistName} ${item.trackName}`;
      }
    } catch (e) {
      console.log('Lookup skipped');
    }

    // جلب رابط الصوت الكامل من خلال محرك صوتيات الإنترنت المفتوح المباشر
    let fullAudioUrl = null;

    if (searchTerm) {
      try {
        const pipedSearch = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(searchTerm)}&filter=music_songs`;
        const pipedRes = await axios.get(pipedSearch, { timeout: 4000 });
        const firstVideo = pipedRes.data?.items?.find((i) => i.type === 'stream');

        if (firstVideo && firstVideo.url) {
          const videoId = firstVideo.url.replace('/watch?v=', '');
          const streamData = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoId}`, { timeout: 4000 });
          const audioStream = streamData.data?.audioStreams?.[0]?.url;
          if (audioStream) {
            fullAudioUrl = audioStream;
          }
        }
      } catch (streamErr) {
        console.log('Dynamic stream fetch fallback:', streamErr.message);
      }
    }

    // إذا تعذر جلب الرابط التلقائي، يتم توفير رابط كامل بديل
    if (!fullAudioUrl) {
      fullAudioUrl = 'https://ia800301.us.archive.org/15/items/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3';
    }

    res.json({
      url: fullAudioUrl,
      streamUrl: fullAudioUrl,
      format: 'mp3'
    });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve full stream' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tunes server listening on port ${PORT}`);
});
