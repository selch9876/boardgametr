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
   * Sadece admin onayından geçmiş oyunları ve kategorilerini getirir
   */
  async getAllGames() {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        categories ( id, name, slug )
      `)
      .eq('is_approved', true)
      .order('title', { ascending: true })

    if (error) {
      console.error('Oyunlar çekilirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }
    return { success: true, data: data, error: null }
  },

  /**
   * ID'ye göre oyun detayını ve kategorisini getirir
   */
  async getGameById(gameId) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        categories ( id, name, slug )
      `)
      .eq('id', gameId)
      .single()

    if (error) {
      console.error('Oyun detayı çekilirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }
    return { success: true, data: data, error: null }
  },

  /**
   * Belirli bir oyuna ait aktif ikinci el ilanları getirir
   */
  async getListingsByGameId(gameId) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, price, condition, has_sleeves, description, created_at,
        profiles ( id, username )
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
   * Pazar yerindeki tüm aktif ilanları getirir
   */
  async getAllListings() {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        games ( id, title, thumbnail_url ),
        profiles ( id, username )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('İlanlar çekilirken hata:', error.message)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data, error: null }
  },

  /**
   * ID'ye göre tekil ilan detayını getirir
   */
  async getListingById(listingId) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        games ( id, title, thumbnail_url, min_players, max_players, play_time, language_dependence, description, categories ( name ) ),
        profiles ( id, username )
      `)
      .eq('id', listingId)
      .single()

    if (error) {
      console.error('İlan detayı çekilirken hata:', error.message)
      return { success: false, data: null, error: error.message }
    }
    return { success: true, data: data, error: null }
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
  }
}