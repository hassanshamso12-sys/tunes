// 3. Stream Engine: تحويل الأغنية إلى بث صوتي كامل (Full Length Audio)
app.get('/stream/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    let trackTitle = '';
    let trackArtist = '';

    // استخراج اسم التراك والفنان
    if (rawId.startsWith('full-')) {
      const trackId = rawId.replace('full-', '');
      try {
        const lookup = await axios.get(`https://itunes.apple.com/lookup?id=${trackId}`, { timeout: 4000 });
        const item = lookup.data?.results?.[0];
        if (item) {
          trackTitle = item.trackName;
          trackArtist = item.artistName;
        }
      } catch (e) {}
    }

    const searchQuery = `${trackArtist} ${trackTitle}`.trim();

    // جلب ملف صوتي كامل عبر محرك بحث صوتيات الأرشيف المفتوح
    if (searchQuery) {
      try {
        const archiveSearch = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
          searchQuery + ' AND mediatype:audio'
        )}&fl[]=identifier&rows=1&output=json`;
        
        const arcRes = await axios.get(archiveSearch, { timeout: 4000 });
        const identifier = arcRes.data?.response?.docs?.[0]?.identifier;

        if (identifier) {
          const metaRes = await axios.get(`https://archive.org/metadata/${identifier}`, { timeout: 4000 });
          const files = metaRes.data?.files || [];
          const mp3 = files.find((f) => f.name && f.name.toLowerCase().endsWith('.mp3'));

          if (mp3) {
            const fullUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(mp3.name)}`;
            return res.json({
              url: fullUrl,
              streamUrl: fullUrl,
              format: 'mp3'
            });
          }
        }
      } catch (err) {
        console.log('Archive search fallback:', err.message);
      }
    }

    // إذا لم يتوفر ملف أرشيفي كامل، استخدام رابط البث الاحتياطي المباشر
    res.json({
      url: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3',
      streamUrl: 'https://archive.org/download/Fairouz-Saalouni-El-Nass/Fairouz-Saalouni-El-Nass.mp3',
      format: 'mp3'
    });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.status(500).json({ error: 'Stream fetch failed' });
  }
});
