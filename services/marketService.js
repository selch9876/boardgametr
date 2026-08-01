// src/services/marketService.js
import { supabase } from './supabase'

export const marketService = {
  /**
   * Pazar yerindeki aktif ilanları getirir
   * @param {Object} filters - İsteğe bağlı filtreleme parametreleri
   */
  async getActiveListings(filters = {}) {
    // 1. Temel Sorgu: İlanları, oyun bilgilerini ve satıcı bilgilerini tek seferde çekiyoruz
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
      .eq('status', 'active') // Sadece aktif ilanları getir

    // 2. Sorguyu çalıştır ve sonucu döndür
    const { data, error } = await query

    if (error) {
      console.error('İlanları çekerken Supabase hatası:', error.message)
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data: data, error: null }
  }
}