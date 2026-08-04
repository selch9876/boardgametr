import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import { parseStringPromise } from 'xml2js'

// Supabase Bağlantı Bilgilerin
const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Gecikme fonksiyonu (BGG API'yi rate-limit'e sokmamak için)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function updateGamesFromBGG() {
  console.log("🎮 Supabase'deki oyunlar çekiliyor...")
  
  const { data: games, error } = await supabase.from('games').select('id, title')
  
  if (error) {
    console.error("❌ Oyunlar çekilemedi:", error.message)
    return
  }

  console.log(`📦 Toplam ${games.length} oyun bulundu. BGG API sorgulaması başlıyor...\n`)

  for (const game of games) {
    try {
      console.log(`🔍 Aranan oyun: "${game.title}"`)

      // BGG API'nin 401 veya blok atmasını önlemek için User-Agent header ekledik
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }

      // 1. Adım: BGG'de oyunu ara ve ID'sini bul
      const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(game.title)}&type=boardgame`
      const searchRes = await axios.get(searchUrl, { headers })
      const searchParsed = await parseStringPromise(searchRes.data)

      if (!searchParsed.items?.item || searchParsed.items.item.length === 0) {
        console.log(`⚠️ BGG'de bulunamadı: ${game.title}\n`)
        continue
      }

      const bggId = searchParsed.items.item[0].$.id

      // 2. Adım: Bulunan ID ile oyunun detaylarını (min/max players, play time) çek
      const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}`
      const detailRes = await axios.get(detailUrl, { headers })
      const detailParsed = await parseStringPromise(detailRes.data)

      const item = detailParsed.items.item[0]

      const minPlayers = parseInt(item.minplayers[0].$.value) || 1
      const maxPlayers = parseInt(item.maxplayers[0].$.value) || 4
      const playTime = parseInt(item.playingtime[0].$.value) || 60

      // 3. Adım: Supabase veritabanını güncelle
      const { error: updateError } = await supabase
        .from('games')
        .update({
          min_players: minPlayers,
          max_players: maxPlayers,
          play_time: playTime
        })
        .eq('id', game.id)

      if (updateError) {
        console.error(`❌ Güncelleme hatası (${game.title}):`, updateError.message)
      } else {
        console.log(`✅ Güncellendi -> Min: ${minPlayers}, Max: ${maxPlayers}, Süre: ${playTime} dk\n`)
      }

      // BGG API aşırı yüklenmeyi önlemek için istekler arasında 2 saniye bekliyoruz
      await sleep(2000)

    } catch (err) {
      if (err.response) {
        console.error(`❌ API Yanıt Hatası (${game.title}) - Status: ${err.response.status}`, err.response.data, '\n')
      } else {
        console.error(`❌ Hata oluştu (${game.title}):`, err.message, '\n')
      }
    }
  }

  console.log("🎉 Tüm oyunlar başarıyla güncellendi!")
}

updateGamesFromBGG()