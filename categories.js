require('dotenv').config()
const db = require('./database')
db.connect()
const Category = require('./models/Category')
  ; (async function () {
    const list = [
      'Aksiyon',
      'Macera',
      'Anime',
      'Yeniden Doğuş (Isekai)',
      'Tarihi',
      'Komedi',
      'Çizgi Roman',
      'Yemek',
      'Doujinshi',
      'Dram',
      'Ecchi',
      'Fantastik',
      'Cinsiyet Değişimi',
      'Harem',
      'Tarihsel',
      'Korku',
      'Josei',
      'Canlı Çekim',
      'Manga',
      'Manhua',
      'Manhwa',
      'Dövüş Sanatları',
      'Yetişkin',
      'Mecha',
      'Gizem',
      'Aşk (Romantizm)',
      'Tek Bölümlük (One-shot)',
      'Psikolojik',
      'Romantik',
      'Okul Hayatı',
      'Bilim Kurgu',
      'Seinen',
      'Shoujo',
      'Shoujo Ai',
      'Shounen',
      'Shounen Ai',
      'Hayattan Kesitler',
      'Smut',
      'Yaoi',
      'Yuri',
      'Spor',
      'Doğaüstü',
      'Dergi/Antoloji',
      'Çocuk',
      'Trajedi',
      'Dedektif',
      'Renkli',
      'Tarama (Scan)',
      'Türkçe',
      'Webtoon',
      'Zaman Yolculuğu'
    ]
    for (const item of list) {
      await Category.create({ name: item })
    }
  })()
