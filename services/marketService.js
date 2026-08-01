// src/services/marketService.js
import { supabase } from './supabase'

export const marketService = {
  /**
   * Pazar yerindeki aktif ilanları getirir
   */
  async getActiveListings() {
    let query = supabase
      .from('listings')
      .select(`
        id, 
        price, 
        condition, 
        has_sleeves, 
        created_at,
        games ( id, title, thumbnail_url, language_dependence ),
        profiles ( id, username, reputation_score )
      `)
      .eq('status', 'active')

    const { data, error } = await query

    if (error) {
      console.error('İlanları çekerken Supabase hatası:', error.message)
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data: data, error: null }
  },

  /**
   * Belirli bir ilanın tüm detaylarını getirir
   */
  async getListingById(listingId) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, 
        price, 
        condition, 
        has_sleeves, 
        description,
        created_at,
        status,
        games ( id, title, thumbnail_url, language_dependence ),
        profiles ( id, username, reputation_score )
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
   * Sistemdeki tüm ana oyun katalogunu getirir
   */
  async getAllGames() {
    const { data, error } = await supabase
      .from('games')
      .select('id, title, thumbnail_url, language_dependence, created_at')
      .order('title', { ascending: true })

    if (error) {
      console.error('Oyunlar çekilirken Supabase hatası:', error.message)
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data: data, error: null }
  }
}