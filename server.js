import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

// قائمة تجريبية جاهزة ومباشرة
const LOCAL_SONGS = [
  {
    id: 'fairuz-1',
    title: 'سألوني الناس',
    artist: 'فيروز',
    album: 'أجمل ما غنت فيروز',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
    audioUrl: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3'
  },
  {
    id: 'fairuz-2',
    title: 'فايق يا هوى',
    artist: 'فيروز',
    album: 'أغاني زمان',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    audioUrl: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3'
  },
  {
    id: 'diab-1',
    title: 'تملي معاك',
    artist: 'عمرو دياب',
    album: 'تملي معاك',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    audioUrl: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3'
  },
  {
    id: 'kalthoum-1',
    title: 'أنت عمري',
    artist: 'أم كلثوم',
    album: 'روائع كوكب الشرق',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400',
    audioUrl: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3'
  }
];

// مسار الفحص السريع
app.get('/', (req, res) => {
  res.send('Tunes Arabic Music Server is Live!');
});

// 1. Manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.arabicmusic.tunes',
    version: '2.0.0',
    name: 'Arabic Music Universal',
    description: 'مكتبة الموسيقى والأغاني العربية الشاملة',
    resources: ['search', 'stream']
  });
});

// 2. Search: يبحث في الكتالوج ثم في محرك بحث iTunes لجلب أي فنان في العالم
app.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.json({ tracks: [] });
  }

  const qLower = query.toLowerCase();
  const tracks = [];

  // مطابقة الكتالوج المحلي
  LOCAL_SONGS.forEach((song) => {
    if (
      song.title.toLowerCase().includes(qLower) ||
      song.artist.toLowerCase().includes(qLower) ||
      song.album.toLowerCase().includes(qLower)
    ) {
      tracks.push({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover: song.cover
      });
    }
  });

  // جلب كافة الفنانين والأغاني عبر iTunes API
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=30`;
    const response = await axios.get(itunesUrl, { timeout: 5000 });
    const items = response.data?.results || [];

    items.forEach((item) => {
      const coverImg = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '400x400bb')
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';

      tracks.push({
        id: `itunes-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        cover: coverImg
      });
    });
  } catch (err) {
    console.error('External API search error:', err.message);
  }

  res.json({ tracks });
});

// 3. Stream: يعيد روابط الصوت المباشرة
app.get('/stream/:id', async (req, res) => {
  const songId = req.params.id;

  // 1) فحص الأغاني المحلية
  const localMatch = LOCAL_SONGS.find((s) => s.id === songId);
  if (localMatch) {
    return res.json({ url: localMatch.audioUrl });
  }

  // 2) جلب رابط المعاينة الرسمي الصافي من iTunes (يدعم التشغيل في المتصفحات 100%)
  if (songId.startsWith('itunes-')) {
    const trackId = songId.replace('itunes-', '');
    try {
      const lookupUrl = `https://itunes.apple.com/lookup?id=${trackId}`;
      const lookupRes = await axios.get(lookupUrl, { timeout: 5000 });
      const track = lookupRes.data?.results?.[0];

      if (track && track.previewUrl) {
        return res.json({ url: track.previewUrl });
      }
    } catch (lookupErr) {
      console.error('Lookup stream error:', lookupErr.message);
    }
  }

  // رابط احتياطي مباشر في حال عدم العثور على الرابط
  res.json({
    url: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
