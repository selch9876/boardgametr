<!-- src/components/marketplace/GameCard.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  listing: {
    type: Object,
    required: true
  }
})

// Fiyati TL formatına çevirme
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(props.listing.price)
})

// Kondisyon metinlerini düzenleme
const conditionText = computed(() => {
  const conditions = {
    new_in_shrink: 'Sıfır (Jelatininde)',
    punched_unplayed: 'Oynanmamış',
    like_new: 'Yeni Gibi',
    good: 'İyi',
    fair: 'Yıpranmış'
  }
  return conditions[props.listing.condition] || 'Belirtilmemiş'
})
</script>

<template>
  <div class="game-card">
    <!-- Oyun Görseli Alanı -->
    <div class="card-image-wrapper">
      <img 
        :src="listing.games?.thumbnail_url || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80'" 
        :alt="listing.games?.title" 
        class="card-img" 
      />
      <span class="price-tag">{{ formattedPrice }}</span>
    </div>

    <!-- Kart İçeriği -->
    <div class="card-body">
      <h3 class="game-title">{{ listing.games?.title || 'İsimsiz Oyun' }}</h3>
      
      <div class="card-details">
        <span class="detail-item"><strong>Kondisyon:</strong> {{ conditionText }}</span>
        <span class="detail-item"><strong>Satıcı:</strong> {{ listing.profiles?.username || 'Topluluk Üyesi' }}</span>
      </div>

      <!-- İncele Butonu -->
      <router-link :to="`/marketplace/${listing.id}`" class="action-btn">
        İlanı İncele
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.game-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px rgba(66, 185, 131, 0.12);
  border-color: #42b983;
}

.card-image-wrapper {
  position: relative;
  height: 200px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.game-card:hover .card-img {
  transform: scale(1.05);
}

.price-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  color: #51e8a2;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.game-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: #0f172a;
  font-weight: 700;
  line-height: 1.3;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.action-btn {
  display: block;
  text-align: center;
  background-color: #42b983;
  color: white;
  padding: 0.75rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
  margin-top: auto;
}

.action-box:hover, .action-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
}
</style>