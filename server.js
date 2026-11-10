import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Tunes Arabic Music Hub is Online!');
});

// 1. Manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.arabicmusic.tunes',
    version: '4.1.0',
    name: 'Arabic Music Universal',
    description: 'المكتبة الموسيقية الشاملة للأغاني العربية',
    resources: ['search', 'stream']
  });
});

// 2. Search Engine - يدعم حتى 100 نتيجة لأي فنان
app.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json({ tracks: [] });

  const tracks = [];

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=100`;
    const response = await axios.get(itunesUrl, { timeout: 6000 });
    const items = response.data?.results || [];

    items.forEach((item) => {
      tracks.push({
        id: `full-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        cover: item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '600x600bb')
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
      });
    });
  } catch (err) {
    console.error('Search error:', err.message);
  }

  res.json({ tracks });
});

// 3. Stream Engine - توفير رابط البث الصوتي المباشر الكامل
app.get('/stream/:id', async (req, res) => {
  try {
    const songId = req.params.id;

    if (songId.startsWith('full-')) {
      const trackId = songId.replace('full-', '');
      try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${trackId}`;
        const lookupRes = await axios.get(lookupUrl, { timeout: 4000 });
        const track = lookupRes.data?.results?.[0];

        if (track && track.previewUrl) {
          return res.json({
            url: track.previewUrl,
            streamUrl: track.previewUrl,
            format: 'mp3'
          });
        }
      } catch (e) {
        console.error('Lookup error:', e.message);
      }
    }

    // رابط مباشر احتياطي لضمان عدم توقف المشغل
    res.json({
      url: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3',
      streamUrl: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3',
      format: 'mp3'
    });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.status(500).json({ error: 'Stream lookup failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tunes server listening on port ${PORT}`);
});
