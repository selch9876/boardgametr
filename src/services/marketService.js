import { supabase } from './supabase'

export const marketService = {
  /**
   * Tüm kategorileri getirir
   */
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Kategoriler çekilirken hata:', error.message)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data, error: null }
  },

  /**
   * Sadece admin onayından geçmiş oyunları, kategorilerini ve onaylı inceleme puanlarını getirir
   */
  async getAllGames() {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        categories:category_id ( id, name, slug ),
        game_reviews ( rating, is_approved )
      `)
      .eq('is_approved', true)
      .order('title', { ascending: true })

    if (error) {
      console.error('Oyunlar çekilirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }

    // Yalnızca onaylanmış incelemelerin puanlarını filtrele
    const processedData = data.map(game => ({
      ...game,
      game_reviews: game.game_reviews?.filter(r => r.is_approved) || []
    }))

    return { success: true, data: processedData, error: null }
  },

  /**
   * ID'ye göre oyun detayını, kategorisini ve onaylı inceleme puanlarını getirir
   */
  async getGameById(gameId) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        categories:category_id ( id, name, slug ),
        game_reviews ( rating, is_approved )
      `)
      .eq('id', gameId)
      .single()

    if (error) {
      console.error('Oyun detayı çekilirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }

    // Yalnızca onaylanmış incelemelerin puanlarını filtrele
    const processedData = {
      ...data,
      game_reviews: data.game_reviews?.filter(r => r.is_approved) || []
    }

    return { success: true, data: processedData, error: null }
  },

  /**
   * Belirli bir oyuna ait aktif ikinci el ilanları getirir
   */
  async getListingsByGameId(gameId) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, price, condition, has_sleeves, description, created_at,
        profiles ( id, username, reputation_score )
      `)
      .eq('game_id', gameId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Oyun ilanları çekilirken hata:', error.message)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data, error: null }
  },

  /**
   * Pazar yerindeki tüm aktif ilanları (ve bağlı olduğu oyunların onaylı puanlarını) getirir
   */
  async getAllListings() {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        games ( 
          id, title, thumbnail_url,
          game_reviews ( rating, is_approved )
        ),
        profiles ( id, username, reputation_score )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('İlanlar çekilirken hata:', error.message)
      return { success: false, data: [], error: error.message }
    }

    const processedData = data.map(item => ({
      ...item,
      games: item.games ? {
        ...item.games,
        game_reviews: item.games.game_reviews?.filter(r => r.is_approved) || []
      } : null
    }))

    return { success: true, data: processedData, error: null }
  },

  /**
   * ID'ye göre tekil ilan detayını ve oyunun puanlarını getirir
   */
  async getListingById(listingId) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        games ( 
          id, title, thumbnail_url, min_players, max_players, play_time, language_dependence, description, 
          categories:category_id ( id, name, slug ),
          game_reviews ( rating, is_approved )
        ),
        profiles ( id, username, reputation_score )
      `)
      .eq('id', listingId)
      .single()

    if (error) {
      console.error('İlan detayı çekilirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }

    const processedData = {
      ...data,
      games: data.games ? {
        ...data.games,
        game_reviews: data.games.game_reviews?.filter(r => r.is_approved) || []
      } : null
    }

    return { success: true, data: processedData, error: null }
  },

  /**
   * Mükerrer kontrolü ile yeni oyun önerir/ekler
   */
  async createGame(gameData) {
    const trimmedTitle = gameData.title.trim()

    const { data: existingGames } = await supabase
      .from('games')
      .select('id, title, is_approved')
      .ilike('title', trimmedTitle)

    if (existingGames && existingGames.length > 0) {
      const match = existingGames[0]
      const statusText = match.is_approved ? 'zaten katalogda mevcut ve yayında!' : 'daha önce eklenmiş ve şu an onay bekliyor.'
      return { 
        success: false, 
        data: null, 
        error: `Bu oyun ("${match.title}") ${statusText}` 
      }
    }

    const payload = {
      title: trimmedTitle,
      thumbnail_url: gameData.thumbnail_url || null,
      language_dependence: gameData.language_dependence || 'Bağımsız',
      description: gameData.description || null,
      min_players: gameData.min_players ? parseInt(gameData.min_players) : 1,
      max_players: gameData.max_players ? parseInt(gameData.max_players) : 4,
      play_time: gameData.play_time ? parseInt(gameData.play_time) : 60,
      category_id: gameData.category_id || null,
      is_approved: false
    }

    const { data, error } = await supabase
      .from('games')
      .insert([payload])
      .select()

    if (error) {
      console.error('Oyun eklenirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data: data[0], error: null }
  },

  /**
   * Pazar yerine yeni bir ilan ekler
   */
  /**
   * Pazar yerine yeni bir ilan ekler ve eklenen oyun için mağaza fiyat kayıtlarını otomatik başlatır
   */
  /**
   * Pazar yerine yeni bir ilan ekler ve eklenen oyun için mağaza arama linklerini otomatik oluşturur
   */
  async createListing(listingData) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, data: null, error: 'İlan vermek için giriş yapmalısınız.' }
    }

    const payload = {
      game_id: listingData.game_id,
      price: parseFloat(listingData.price),
      condition: listingData.condition || 'like_new',
      has_sleeves: listingData.has_sleeves || false,
      description: listingData.description || null,
      status: listingData.status || 'active',
      seller_id: user.id
    }

    // 1. İlanı Kaydet
    const { data, error } = await supabase
      .from('listings')
      .insert([payload])
      .select()

    if (error) {
      console.error('İlan oluşturulurken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }

    const newListing = data[0]

    // 2. OTOMATİK MAĞAZA LİSTESİ VE ARAMA LİNKİ OLUŞTURUCU
    if (newListing.game_id) {
      try {
        // Oyunun adını games tablosundan çekelim
        const { data: gameData } = await supabase
          .from('games')
          .select('title')
          .eq('id', newListing.game_id)
          .single()

        const gameTitle = gameData ? encodeURIComponent(gameData.title) : ''

        // Aktif mağazaları arama şablonlarıyla birlikte çek
        const { data: stores, error: storesError } = await supabase
          .from('stores')
          .select('id, search_url_template')

        if (!storesError && stores && stores.length > 0) {
          for (const store of stores) {
            const { data: existingListing } = await supabase
              .from('store_listings')
              .select('id')
              .eq('game_id', newListing.game_id)
              .eq('store_id', store.id)
              .single()

            if (!existingListing) {
              // Arama şablonuna oyun adını yerleştir (örn: ?q=Azul+Mini)
              let generatedUrl = null
              if (store.search_url_template && gameTitle) {
                generatedUrl = store.search_url_template.replace('{query}', gameTitle)
              }

              await supabase
                .from('store_listings')
                .insert([{
                  game_id: newListing.game_id,
                  store_id: store.id,
                  price: 0,
                  in_stock: false,
                  product_url: generatedUrl // Otomatik oluşturulan arama linki
                }])
            }
          }
        }
      } catch (err) {
        console.error('Otomatik arama linkleri oluşturulurken hata:', err.message)
      }
    }

    return { success: true, data: newListing, error: null }
  },

  /**
   * Supabase Storage'a oyun görseli yükler ve public URL döndürür
   */
  async uploadGameThumbnail(file) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      
      const filePath = `game-images/${fileName}`

      const { data, error } = await supabase.storage
        .from('game-images')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath)

      return { success: true, url: publicUrl, error: null }
    } catch (error) {
      console.error('Görsel yüklenirken hata:', error.message)
      return { success: false, url: null, error: error.message }
    }
  },

  // --- KULLANICI KOLEKSİYONU VE İSTEK LİSTESİ SERVİSLERİ ---

  /**
   * Kullanıcının koleksiyonuna veya istek listesine oyun ekler/günceller (Toggle mantığı)
   */
  async saveUserGame(userId, gameId, status) {
    try {
      const { data: existing } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single()

      if (existing) {
        if (existing.status === status) {
          const { error } = await supabase
            .from('user_games')
            .delete()
            .eq('id', existing.id)
          if (error) throw error
          return { success: true, action: 'removed' }
        } else {
          const { error } = await supabase
            .from('user_games')
            .update({ status })
            .eq('id', existing.id)
          if (error) throw error
          return { success: true, action: 'updated' }
        }
      } else {
        const { error } = await supabase
          .from('user_games')
          .insert([{ user_id: userId, game_id: gameId, status }])
        if (error) throw error
        return { success: true, action: 'added' }
      }
    } catch (error) {
      console.error('Koleksiyon kayıt hatası:', error.message)
      return { success: false, error: error.message }
    }
  },

  /**
   * Belirli bir kullanıcının koleksiyon ve istek listesini getirir
   */
  async getUserGames(userId) {
    try {
      const { data, error } = await supabase
        .from('user_games')
        .select(`
          id,
          status,
          created_at,
          games (
            id,
            title,
            thumbnail_url,
            min_players,
            max_players,
            play_time,
            language_dependence,
            game_reviews ( rating, is_approved )
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      const processedData = data.map(item => ({
        ...item,
        games: item.games ? {
          ...item.games,
          game_reviews: item.games.game_reviews?.filter(r => r.is_approved) || []
        } : null
      }))

      return { success: true, data: processedData }
    } catch (error) {
      console.error('Kullanıcı koleksiyonu çekilemedi:', error.message)
      return { success: false, error: error.message, data: [] }
    }
  },

  /**
   * Belirli bir oyunun hangi kullanıcılarda (sahip/isteyen) olduğunu getirir
   */
  async getGameOwnersAndWishlisters(gameId) {
    try {
      const { data, error } = await supabase
        .from('user_games')
        .select(`
          status,
          profiles (
            id,
            username
          )
        `)
        .eq('game_id', gameId)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Oyun sahipleri çekilemedi:', error.message)
      return { success: false, error: error.message, data: [] }
    }
  },

  // --- OYUN PUANLAMA VE İNCELEME SERVİSLERİ ---

  /**
   * Belirli bir oyuna ait SADECE ONAYLANMIŞ incelemeleri getirir (Kullanıcı tarafı için)
   */
  async getGameReviews(gameId) {
    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          is_approved,
          profiles (
            id,
            username
          )
        `)
        .eq('game_id', gameId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('İncelemeler çekilemedi:', error.message)
      return { success: false, error: error.message, data: [] }
    }
  },

  /**
   * ADMİN: Platformdaki tüm incelemeleri (onaylı/onaysız) getirir
   */
  async getAllReviewsForAdmin() {
    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          is_approved,
          games ( id, title ),
          profiles ( id, username )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Admin incelemeleri çekilemedi:', error.message)
      return { success: false, error: error.message, data: [] }
    }
  },

  /**
   * ADMİN: İnceleme onay durumunu değiştirir
   */
  async updateReviewApproval(reviewId, isApproved) {
    try {
      const { error } = await supabase
        .from('game_reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('İnceleme onay durumu güncellenemedi:', error.message)
      return { success: false, error: error.message }
    }
  },

  /**
   * Kullanıcının bir oyun için yaptığı incelemeyi kaydeder veya günceller
   */
  async upsertGameReview(userId, gameId, rating, comment) {
    try {
      // Yorum boş, 'EMPTY' veya sadece boşluktan ibaretse veritabanına null gönderelim
      const cleanComment = comment && comment.trim() !== '' && comment !== 'EMPTY' ? comment.trim() : null

      const { data, error } = await supabase
        .from('game_reviews')
        .upsert(
          { 
            user_id: userId, 
            game_id: gameId, 
            rating, 
            comment: cleanComment, 
            is_approved: true, 
            created_at: new Date() 
          },
          { onConflict: 'user_id,game_id' }
        )
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('İnceleme kaydedilemedi:', error.message)
      return { success: false, error: error.message }
    }
  },

  /**
   * İncelemeyi siler (Admin veya Kullanıcı)
   */
  async deleteGameReview(reviewId) {
    try {
      const { error } = await supabase
        .from('game_reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('İnceleme silinemedi:', error.message)
      return { success: false, error: error.message }
    }
  },

  /**
   * Belirli bir oyuna ait yasal mağazaların sıfır fiyatlarını getirir
   */
  async getStoreListingsByGameId(gameId) {
    try {
      const { data, error } = await supabase
        .from('store_listings')
        .select(`
          id, price, product_url, in_stock, updated_at,
          stores ( id, name, logo_url, website_url )
        `)
        .eq('game_id', gameId)
        .order('price', { ascending: true }) // En ucuz fiyat en üstte çıksın

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Mağaza fiyatları çekilemedi:', error.message)
      return { success: false, error: error.message, data: [] }
    }
  },
  
}