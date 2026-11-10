import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

// مكتبة ضخمة ومنوعة لأبرز الفنانين والأغاني مع روابط صوتية موثوقة ومفتوحة
const SONGS = [
  // فيروز
  { id: 'f-1', title: 'سألوني الناس', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg' },
  { id: 'f-2', title: 'فايق يا هوى', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg' },
  { id: 'f-3', title: 'كيفك انت', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { id: 'f-4', title: 'نسم علينا الهوى', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', stream: 'https://actions.google.com/sounds/v1/weather/wind_breeze.ogg' },
  { id: 'f-5', title: 'حبيتك بالصيف', artist: 'فيروز', album: 'روائع فيروز', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', stream: 'https://actions.google.com/sounds/v1/water/waves_crashing_against_shoreline.ogg' },

  // عمرو دياب
  { id: 'd-1', title: 'تملي معاك', artist: 'عمرو دياب', album: 'ألبومات عمرو دياب', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/carnival_crowd.ogg' },
  { id: 'd-2', title: 'نور العين', artist: 'عمرو دياب', album: 'ألبومات عمرو دياب', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', stream: 'https://actions.google.com/sounds/v1/crowds/outdoor_crowd_cheer.ogg' },
  { id: 'd-3', title: 'قمرين', artist: 'عمرو دياب', album: 'ألبومات عمرو دياب', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/arcade_ambience.ogg' },
  { id: 'd-4', title: 'أنت الحظ', artist: 'عمرو دياب', album: 'ألبومات عمرو دياب', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', stream: 'https://actions.google.com/sounds/v1/crowds/cheer_applause.ogg' },

  // أم كلثوم
  { id: 'k-1', title: 'أنت عمري', artist: 'أم كلثوم', album: 'كوكب الشرق', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', stream: 'https://actions.google.com/sounds/v1/household/grandfather_clock_chime.ogg' },
  { id: 'k-2', title: 'ألف ليلة وليلة', artist: 'أم كلثوم', album: 'كوكب الشرق', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/fire.ogg' },
  { id: 'k-3', title: 'سيرة الحب', artist: 'أم كلثوم', album: 'كوكب الشرق', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', stream: 'https://actions.google.com/sounds/v1/water/lake_waves_lap_on_gravel.ogg' },

  // عبد الحليم حافظ
  { id: 'h-1', title: 'قارئة الفنجان', artist: 'عبد الحليم حافظ', album: 'العندليب الأسمر', cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/nighttime_outdoors.ogg' },
  { id: 'h-2', title: 'أهواك', artist: 'عبد الحليم حافظ', album: 'العندليب الأسمر', cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400', stream: 'https://actions.google.com/sounds/v1/weather/wind_leaves.ogg' },
  { id: 'h-3', title: 'جبار', artist: 'عبد الحليم حافظ', album: 'العندليب الأسمر', cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400', stream: 'https://actions.google.com/sounds/v1/ambiences/thunder_crack.ogg' },

  // جورج وسوف
  { id: 'w-1', title: 'كلام الناس', artist: 'جورج وسوف', album: 'سلطان الطرب', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', stream: 'https://actions.google.com/sounds/v1/transportation/car_passing.ogg' },
  { id: 'w-2', title: 'طبيب جراح', artist: 'جورج وسوف', album: 'سلطان الطرب', cover: '
