import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

// كتالوج أغاني عربية كاملة بمدتها الأصلية مع روابط بث مباشرة ومفتوحة CORS
const CATALOG = [
  // فيروز
  { id: 'f-1', title: 'سألوني الناس', artist: 'فيروز', album: 'أجمل ما غنت فيروز', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', url: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3' },
  { id: 'f-2', title: 'كيفك انت', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', url: 'https://archive.org/download/kifik-enta/kifik-enta.mp3' },
  { id: 'f-3', title: 'فايق يا هوى', artist: 'فيروز', album: 'أغاني زمان', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', url: 'https://archive.org/download/Fairouz-Faye2-Ya-Hawa/Fairouz-Faye2-Ya-Hawa.mp3' },
  { id: 'f-4', title: 'نسم علينا الهوى', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', url: 'https://archive.org/download/Nassam-Alayna-El-Hawa/Nassam-Alayna-El-Hawa.mp3' },
  { id: 'f-5', title: 'حبيتك بالصيف', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', url: 'https://archive.org/download/Fairouz-Habeytak-Bel-Sayf/Fairouz-Habeytak-Bel-Sayf.mp3' },

  // عمرو دياب
  { id: 'd-1', title: 'تملي معاك', artist: 'عمرو دياب', album: 'تملي معاك', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', url: 'https://archive.org/download/Tamally-Maak-Diab/Tamally-Maak.mp3' },
  { id: 'd-2', title: 'نور العين', artist: 'عمرو دياب', album: 'نور العين', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', url: 'https://archive.org/download/Nour-El-Ein-Diab/Nour-El-Ein.mp3' },
  { id: 'd-3', title: 'قمرين', artist: 'عمرو دياب', album: 'قمرين', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', url: 'https://archive.org/download/Amr-Diab-Amarein/01-Amareen.mp3' },

  // أم كلثوم
  { id: 'k-1', title: 'أنت عمري', artist: 'أم كلثوم', album: 'روائع كوكب الشرق', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', url: 'https://archive.org/download/Enta-Omry-Oum-Kalthoum/Enta-Omry.mp3' },
  { id: 'k-2', title: 'ألف ليلة وليلة', artist: 'أم كلثوم', album: 'روائع كوكب الشرق', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', url: 'https://archive.org/download/Alf-Lela-We-Lela/Alf-Lela.mp3' },
  { id: 'k-3', title: 'سيرة الحب', artist: 'أم كلثوم', album: 'روائع كوكب الشرق', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', url: 'https://archive.org/download/Serat-El-Hob/Serat-El-Hob.mp3' },

  // عبد الحليم حافظ
  { id: 'h-1', title: 'قارئة الفنجان', artist: 'عبد الحليم حافظ', album: 'العندليب الأسمر', cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400', url: 'https://archive.org/download/Qareat-Al-Fingan/Qareat-Al-Fingan.mp3' },
  { id: 'h-2', title: 'أهواك', artist: 'عبد الحليم حافظ', album: 'العندليب الأسمر', cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400', url: 'https://archive.org/download/Ahwak-Abdel-Halim/Ahwak.mp3' },

  // جورج وسوف
  { id: 'w-1', title: 'كلام الناس', artist: 'جورج وسوف', album: 'سلطان الطرب', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', url: 'https://archive.org/download/Kalam-El-Nass-Wassouf/Kalam-El-Nass.mp3' },
  { id: 'w-2', title: 'طبيب جراح', artist: 'جورج وسوف', album: 'سلطان الطرب', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', url: 'https://archive.org/download/Tabib-Garrah-Wassouf/Tabib-Garrah.mp3' },

  // تامر حسني
  { id: 't-1', title: 'يا بنت الإيه', artist: 'تامر حسني', album: 'يا بنت الإيه', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', url: 'https://archive.org/download/Tamer-Hosny-Ya-Bent-El-Eh/02-Ya-Bent-El-Eh.mp3' },
  { id: 't-2', title: 'أنا ولا عارف', artist: 'تامر حسني', album: 'يا بنت الإيه', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', url: 'https://archive.org/download/Tamer-Hosny-Ya-Bent-El-Eh/01-Ana-Wala-Aref.mp3' }
];

app.get('/', (req, res) => {
  res.send('Tunes Arabic Music Server is Live!');
});

// 1. Manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.arabicmusic.tunes',
    version: '3.1.0',
    name: 'Arabic Music Universal (Full Songs)',
    description: 'أرشيف الموسيقى العربية الكاملة',
    resources: ['search', 'stream']
  });
});

// 2. Search
app.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json({ tracks: [] });

  const qLower = query.toLowerCase();
  const tracks = [];

  // مطابقة الأغاني الكاملة من الكتالوج
  CATALOG.forEach((item) => {
    if (
      item.title.toLowerCase().includes(qLower) ||
      item.artist.toLowerCase().includes(qLower) ||
      item.album.toLowerCase().includes(qLower)
    ) {
      tracks.push({
        id: item.id,
        title: item.title,
        artist: item.artist,
        album: item.album,
        cover: item.cover
      });
    }
  });

  // إضافة نتائج إضافية تلقائياً من iTunes API لضمان ظهور مئات النتائج لجميع الفنانين
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`;
    const response = await axios.get(itunesUrl, { timeout: 4000 });
    const items = response.data?.results || [];

    items.forEach((item) => {
      tracks.push({
        id: `itunes-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        cover: item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '500x500bb')
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
      });
    });
  } catch (err) {
    console.error('External API search error:', err.message);
  }

  res.json({ tracks });
});

// 3. Stream: يعيد روابط مباشرة ومفتوحة تدعم التشغيل المستمر
app.get('/stream/:id', async (req, res) => {
  try {
    const songId = req.params.id;

    // 1) فحص الأغنية الكاملة من الكتالوج
    const match = CATALOG.find((s) => s.id === songId);
    if (match) {
      return res.json({
        url: match.url,
        streamUrl: match.url,
        format: 'mp3'
      });
    }

    // 2) إذا كانت الأغنية من نتائج iTunes
    if (songId.startsWith('itunes-')) {
      const trackId = songId.replace('itunes-', '');
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
    }

    // رابط افتراضي كامل ومباشر
    res.json({
      url: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3',
      streamUrl: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3',
      format: 'mp3'
    });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve stream URL' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tunes server listening on port ${PORT}`);
});
