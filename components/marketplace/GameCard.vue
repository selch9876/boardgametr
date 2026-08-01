<!-- src/components/marketplace/GameCard.vue -->
<script setup>
import { computed } from 'vue'

// Sayfadan (Marketplace/Index) bu karta gönderilecek olan veri (props)
const props = defineProps({
  listing: {
    type: Object,
    required: true
  }
})

// Veritabanındaki İngilizce kondisyon kodlarını Türkçeye ve renklere çeviren yardımcı (helper) obje
const conditionInfo = computed(() => {
  const conditions = {
    new_in_shrink: { label: 'Sıfır (Jelatininde)', color: '#27ae60' }, // Yeşil
    punched_unplayed: { label: 'Oynanmamış', color: '#2980b9' },      // Mavi
    like_new: { label: 'Yeni Gibi', color: '#8e44ad' },               // Mor
    good: { label: 'İyi', color: '#f39c12' },                         // Turuncu
    fair: { label: 'Yıpranmış', color: '#e74c3c' }                    // Kırmızı
  }
  return conditions[props.listing.condition] || { label: 'Bilinmiyor', color: '#95a5a6' }
})

// Fiyatı TL formatına çeviren fonksiyon (örn: 2500 -> 2.500,00 ₺)
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY' 
  }).format(props.listing.price)
})
</script>

<template>
  <div class="game-card">
    <!-- 1. Görsel ve Etiketler Alanı -->
    <div class="card-image-wrapper">
      <img :src="listing.games?.thumbnail_url" :alt="listing.games?.title" class="game-image" />
      
      <!-- Kondisyon Rozeti -->
      <span class="badge condition-badge" :style="{ backgroundColor: conditionInfo.color }">
        {{ conditionInfo.label }}
      </span>
      
      <!-- Kart Koruyucu (Sleeve) Rozeti (Sadece varsa görünür) -->
      <span v-if="listing.has_sleeves" class="badge sleeve-badge">
        🃏 Sleeve'li
      </span>
    </div>

    <!-- 2. İçerik ve Bilgi Alanı -->
    <div class="card-content">
      <h3 class="game-title">{{ listing.games.title }}</h3>

      <div class="seller-info">
        <span class="seller-name">👤 {{ listing.profiles.username }}</span>
        <span class="seller-rep">⭐ {{ listing.profiles.reputation_score }}/100</span>
      </div>

      <p class="description">{{ listing.description }}</p>

      <!-- 3. Fiyat ve Buton Alanı -->
      <div class="card-footer">
        <span class="price">{{ formattedPrice }}</span>
        <button class="action-btn">İncele</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Kartın Genel İskeleti */
.game-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #eaeaea;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}

/* Görsel ve Rozetler */
.card-image-wrapper {
  position: relative;
  height: 200px;
  width: 100%;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.condition-badge {
  top: 10px;
  left: 10px;
}

.sleeve-badge {
  top: 10px;
  right: 10px;
  background-color: #34495e;
}

/* Metin İçerikleri */
.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.game-title {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.seller-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ecf0f1;
}

.description {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 16px;
  /* Çok uzun açıklamaları 2 satırla sınırlandırıp sonuna üç nokta koyar */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

/* Fiyat ve Buton */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #e67e22;
}

.action-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #369c6d;
}
</style>