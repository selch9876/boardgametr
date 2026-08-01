<!-- src/pages/Games/GameDetail.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'

const route = useRoute()
const router = useRouter()

const game = ref(null)
const listings = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)

onMounted(async () => {
  const gameId = route.params.id
  
  const [gameRes, listingsRes] = await Promise.all([
    marketService.getGameById(gameId),
    marketService.getListingsByGameId(gameId)
  ])

  if (gameRes.success) {
    game.value = gameRes.data
  } else {
    errorMessage.value = 'Oyun bilgileri bulunamadı.'
  }

  if (listingsRes.success) {
    listings.value = listingsRes.data
  }

  isLoading.value = false
})

const goToDetail = (gameId) => {
  router.push(`/games/${gameId}`)
}

const goToCategory = (catSlug) => {
  // Eğer kategori sayfasına yönlendirmek isterseniz:
  // router.push(`/games?category=${catSlug}`)
}

const goToTheListing = (listingId) => {
  router.push(`/marketplace/${listingId}`)
}

// 1. ÖZET: Eski HTML etiketlerini ve özel karakterleri temizleyip sadece ilk cümleyi alır
const oyunOzeti = computed(() => {
  if (!game.value || !game.value.description) return ''
  
  // Eski yapıdaki HTML etiketlerini (<...>) ve &nbsp; kodlarını temizle
  let temizMetin = game.value.description.replace(/<[^>]*>?/gm, '')
  temizMetin = temizMetin.replace(/&nbsp;/g, ' ').trim()
  
  // Sadece ilk cümleyi al (ilk noktaya kadar)
  let ilkCumle = temizMetin.split('.')[0]
  return ilkCumle ? ilkCumle + '.' : ''
})

// 2. TAM METİN: Eski paragraf mantığını uygular ve HTML etiketlerini korur
const formatliAciklama = computed(() => {
  if (!game.value || !game.value.description) return ''
  
  let metin = game.value.description
  
  // Gereksiz yere konmuş tekli &nbsp; boşluklarını temizle
  metin = metin.replace(/&nbsp;/g, '')

  // Eski yapıdaki \r\n\r\n (çift satır) boşluklarını yakala
  let paragraflar = metin.split(/\r?\n\s*\r?\n/)
  
  metin = paragraflar
    .filter(p => p.trim() !== '')
    .map(p => {
       // Eski metinde <h3>, <ul>, <li> gibi bir HTML bloğu varsa <p> içine sokma bozmasın
       if (p.trim().match(/^<\/?(h[1-6]|ul|li|div|p|img)/i)) {
         return p.trim()
       }
       // Düz metinse <p> paragraf etiketi içine al
       return `<p>${p.trim()}</p>`
    })
    .join('')
    
  // Kalan tekli satır atlamalarını (<br>) yap
  metin = metin.replace(/\r?\n/g, '<br>')
  
  return metin
})
</script>

<template>
  <div class="page-container">
    <button class="back-btn" @click="router.back()">← Kataloğa Geri Dön</button>

    <div v-if="isLoading" class="state-box">⏳ Oyun yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ {{ errorMessage }}</div>

    <template v-else-if="game">
      <!-- Oyun Detay Kartı (Hero Alanı) -->
      <div class="game-detail-card">
        <div class="game-image-wrapper">
          <img :src="game.thumbnail_url || 'https://via.placeholder.com/400x300?text=Masa+Oyunu'" :alt="game.title" />
        </div>

        <div class="game-content">
          <div class="category-tag" v-if="game.categories">
            🏷️ {{ game.categories.name }}
          </div>
          
          <h1>{{ game.title }}</h1>

          <!-- Özellik Grid Kutuları -->
          <div class="features-grid">
            <div class="feature-box">
              <span class="f-label">Oyuncu Sayısı</span>
              <span class="f-value">👥 {{ game.min_players }} - {{ game.max_players }} Oyuncu</span>
            </div>
            <div class="feature-box">
              <span class="f-label">Ortalama Süre</span>
              <span class="f-value">⏱️ {{ game.play_time }} Dakika</span>
            </div>
            <div class="feature-box">
              <span class="f-label">Dil Bağımlılığı</span>
              <span class="f-value">💬 {{ game.language_dependence || 'Bağımsız' }}</span>
            </div>
          </div>

          <!-- Üst Kısım: Sadece Tek Cümlelik Özet -->
          <div class="description-section" v-if="game.description">
            <h3>Oyun Hakkında</h3>
            <p>{{ oyunOzeti }}</p>
          </div>

          <!-- İlan Ver Butonu -->
          <div class="action-section">
            <router-link :to="`/marketplace/create?game_id=${game.id}`" class="create-listing-btn">
              + Bu Oyun İçin İlan Ver
            </router-link>
          </div>
        </div>
      </div>

      <!-- Alt Kısım: Tam Genişlikte Orijinal Makale ve İnceleme Alanı -->
      <div class="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 my-6" v-if="game.description">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Oyun İncelemesi ve Detaylı Açıklama</h3>
        
        <!-- v-html ile işlenmiş metni basıyoruz (whitespace-pre-line kaldırıldı) -->
        <div class="text-gray-700 leading-relaxed full-text-content" v-html="formatliAciklama"></div>
      </div>

      <!-- Bu Oyun İçin İkinci El İlanlar -->
      <div class="listings-section">
        <h3>Pazar Yeri İlanları ({{ listings.length }})</h3>

        <div v-if="listings.length > 0" class="listings-grid">
          <div 
            v-for="listing in listings" 
            :key="listing.id" 
            class="listing-card clickable"
            @click="goToTheListing(listing.id)"
          >
            <div class="listing-header">
              <span class="price">{{ listing.price }} TL</span>
              <span class="condition-badge">{{ listing.condition }}</span>
            </div>
            <div class="listing-details">
              <p><strong>Satıcı:</strong> {{ listing.profiles?.username || 'Gizli Satıcı' }}</p>
              <p><strong>Kart Kılıfı:</strong> {{ listing.has_sleeves ? 'Var (Sleeved) ✅' : 'Yok ❌' }}</p>
              <p class="listing-desc" v-if="listing.description">"{{ listing.description }}"</p>
            </div>
          </div>
        </div>

        <div v-else class="no-listings-box">
          📦 Bu oyun için henüz aktif ikinci el ilan bulunmuyor. İlk ilanı sen açabilirsin!
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-container {
  padding: 1rem 0 4rem 0;
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding: 0;
}
.back-btn:hover { text-decoration: underline; }

.game-detail-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .game-detail-card {
    grid-template-columns: 350px 1fr;
  }
}

.game-image-wrapper {
  background: #f1f5f9;
  height: 100%;
  min-height: 250px;
}

.game-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.category-tag {
  align-self: flex-start;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.game-content h1 {
  margin: 0;
  font-size: 2rem;
  color: #0f172a;
  font-weight: 800;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .features-grid { grid-template-columns: 1fr; }
}

.feature-box {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.f-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.f-value {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 700;
}

.description-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
}

.description-section p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
}

.action-section {
  margin-top: auto;
  padding-top: 1rem;
}

.create-listing-btn {
  display: inline-block;
  background-color: #42b983;
  color: white;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
  transition: all 0.2s;
}

.create-listing-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
}

.listings-section h3 {
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
}

.listing-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.listing-card.clickable {
  cursor: pointer;
}

.listing-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #42b983;
}

.condition-badge {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #334155;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
}

.listing-details {
  font-size: 0.9rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.listing-desc {
  margin-top: 0.5rem;
  font-style: italic;
  color: #64748b;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 8px;
}

.no-listings-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  text-align: center;
  border-radius: 14px;
  color: #64748b;
}

.state-box {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1.1rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
.error { color: #e74c3c; background: #fdf2f2; border-color: #f8d7da; }

/* ------------------------------------------------------------- */
/* TAM METİN (v-html) BİÇİMLENDİRMESİ (WordPress Orijinal Yapısı)*/
/* ------------------------------------------------------------- */

.full-text-content :deep(p) {
  margin-bottom: 1.25rem;
  text-align: justify;
}

.full-text-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.full-text-content :deep(strong),
.full-text-content :deep(b) {
  color: #0f172a;
  font-weight: 700;
}

.full-text-content :deep(ul) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.full-text-content :deep(li) {
  margin-bottom: 0.5rem;
}

.full-text-content :deep(a) {
  color: #42b983;
  text-decoration: none;
}

.full-text-content :deep(a:hover) {
  text-decoration: underline;
}
</style>