<!-- src/pages/Marketplace/ListingDetail.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'

const route = useRoute()   // Adres çubuğundaki parametrelere (ID) ulaşmak için
const router = useRouter() // Sayfalar arası programatik geçiş (Geri dön butonu) için

const listing = ref(null)
const isLoading = ref(true)
const errorMessage = ref(null)

onMounted(async () => {
  // Adres çubuğundaki /marketplace/:id kısmından ID'yi yakalıyoruz
  const listingId = route.params.id 
  
  const response = await marketService.getListingById(listingId)
  
  if (response.success) {
    listing.value = response.data
  } else {
    errorMessage.value = "İlan bulunamadı veya yayından kaldırılmış."
  }
  
  isLoading.value = false
})

const conditionInfo = computed(() => {
  const conditions = {
    new_in_shrink: 'Sıfır (Jelatininde)',
    punched_unplayed: 'Oynanmamış',
    like_new: 'Yeni Gibi',
    good: 'İyi',
    fair: 'Yıpranmış'
  }
  return conditions[listing.value?.condition] || 'Bilinmiyor'
})

const formattedPrice = computed(() => {
  if (!listing.value) return ''
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(listing.value.price)
})
</script>

<template>
  <div class="detail-page">
    <!-- Router push yerine tarayıcının bir adım geri gelmesini sağlayalım -->
      <button class="back-btn" @click="router.push({ name: 'Marketplace' })">← Pazar Yerine Dön</button>

    <div v-if="isLoading" class="state-box">⏳ İlan detayları yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>
    
    <div v-else-if="listing" class="detail-container">
      <!-- Sol Taraf: Görsel -->
      <div class="image-section">
        <img :src="listing.games?.thumbnail_url" :alt="listing.games?.title" class="main-image"/>
      </div>
      
      <!-- Sağ Taraf: Detaylar -->
      <div class="info-section">
        <h1 class="title">{{ listing.games?.title }}</h1>
        <div class="price-tag">{{ formattedPrice }}</div>
        
        <div class="specs">
          <p><strong>Kondisyon:</strong> {{ conditionInfo }}</p>
          <p><strong>Kart Koruması (Sleeve):</strong> {{ listing.has_sleeves ? 'Mevcut' : 'Yok' }}</p>
          <p><strong>Dil Bağımlılığı:</strong> {{ listing.games?.language_dependence || 'Belirtilmemiş' }}</p>
        </div>
        
        <div class="description-box">
          <h3>Satıcı Açıklaması</h3>
          <p>{{ listing.description || 'Satıcı ek bir açıklama girmemiş.' }}</p>
        </div>
        
        <div class="seller-card">
          <div class="seller-header">
            <h3>Satıcı: {{ listing.profiles?.username }}</h3>
            <span>⭐ Puan: {{ listing.profiles?.reputation_score }}/100</span>
          </div>
          <button class="contact-btn">Satıcıya Mesaj Gönder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page { padding: 2rem 0; }
.back-btn { background: none; border: none; color: #3498db; cursor: pointer; font-size: 1rem; margin-bottom: 2rem; }
.back-btn:hover { text-decoration: underline; }

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .detail-container { flex-direction: row; }
  .image-section { flex: 0 0 400px; }
}

.main-image { width: 100%; border-radius: 8px; object-fit: cover; border: 1px solid #eaeaea; }
.info-section { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
.title { font-size: 2.5rem; margin: 0; color: #2c3e50; }
.price-tag { font-size: 2rem; font-weight: bold; color: #e67e22; }

.specs p { margin: 0.5rem 0; font-size: 1.1rem; }
.description-box { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #3498db; }
.description-box h3 { margin-top: 0; margin-bottom: 0.5rem; }

.seller-card { margin-top: auto; border: 1px solid #eaeaea; padding: 1.5rem; border-radius: 8px; background: #fafbfc; }
.seller-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.seller-header h3 { margin: 0; }
.contact-btn { width: 100%; padding: 1rem; background: #42b983; color: white; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.contact-btn:hover { background: #369c6d; }

.state-box { text-align: center; padding: 3rem; font-size: 1.2rem; color: #7f8c8d; }
.error { color: #e74c3c; }
</style>