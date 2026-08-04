import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function importFromCsv() {
  console.log('1. CSV dosyasından oyunlar okunuyor...')
  
  const results = []
  
  fs.createReadStream('boardgames_ranks.csv')
    .pipe(csv())
    .on('data', (data) => {
      // Sadece ana oyunlar (expansion olmayan) ve sıralaması olanlar
      if (data.is_expansion === '0' && parseInt(data.rank) > 0) {
        results.push({
          id: parseInt(data.id),
          title: data.name,
          rank: parseInt(data.rank),
          year: parseInt(data.yearpublished),
          average: parseFloat(data.average)
        })
      }
    })
    .on('end', async () => {
      // BGG rank'ine göre sırala (En iyi 1. oyundan başlasın)
      results.sort((a, b) => a.rank - b.rank)
      console.log(`CSV'den toplam ${results.length} geçerli ana oyun yüklendi.`)

      // 2. Mevcut oyunlarımızı Supabase'den çekelim
      console.log('2. Supabase\'deki mevcut oyunlar kontrol ediliyor...')
      const { data: existingGames, error: fetchError } = await supabase
        .from('games')
        .select('title')

      if (fetchError) {
        console.error('Mevcut oyunlar çekilemedi:', fetchError.message)
        return
      }

      const existingTitles = new Set(existingGames.map(g => g.title.toLowerCase().trim()))
      let addedCount = 0
      
      // İlk kaç popüler oyunu aktarmak istiyorsun? (Örn: En popüler ilk 500 oyun)
      const importLimit = 500 
      let processed = 0

      console.log(`3. Eksik oyunlar tespit edilip ekleniyor (Limit: ${importLimit})...`)

      for (const game of results) {
        if (processed >= importLimit) break
        processed++

        const title = game.title

        // Zaten bizde varsa atla
        if (existingTitles.has(title.toLowerCase().trim())) {
          continue
        }

        // Supabase'e ekle
        const { error: insertError } = await supabase
          .from('games')
          .insert({
            title: title,
            min_players: 2, // CSV'de oyuncu sayısı sütunu olmadığı için varsayılan değerler
            max_players: 4,
            play_time: 60,
            description: `BoardGameGeek Sıralaması: #${game.rank} (Yıl: ${game.year}, Puan: ${game.average})`,
            is_approved: true
          })

        if (insertError) {
          console.error(`Hata (${title}):`, insertError.message)
        } else {
          console.log(`[Eklendi] #${game.rank} - "${title}" veritabanına eklendi.`)
          addedCount++
        }
      }

      console.log(`\nİşlem tamamlandı! Toplam ${addedCount} yeni oyun başarıyla eklendi.`)
    })
}

importFromCsv()