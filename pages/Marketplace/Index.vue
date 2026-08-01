<!-- src/pages/Marketplace/Index.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'

const router = useRouter()

const listings = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)
const searchQuery = ref('')

onMounted(async () => {
  isLoading.value = true
  const response = await marketService.getAllListings()
  
  if (response.success) {
    listings.value = response.data
  } else {
    errorMessage.value = response.error
  }
  isLoading.value = false
})

const filteredListings = computed(() => {
  return listings.value.filter(item => {
    const gameTitle = item.games?.title || ''
    const desc = item.description || ''
    const query = searchQuery.value.toLowerCase()
    return gameTitle.toLowerCase().includes(query) || desc.toLowerCase().includes(query)
  })
})

const goToDetail = (id) => {
  router.push(`/marketplace/${id}`)
}
</script>

<template>
  <div class="marketplace-page">
    <!-- Üst Başlık -->
    <div class="page-top-section">
      <div class="header-titles">
        <h2>İkinci El Pazar Yeri</h2>
        <p>Masa oyunlarını keşfet, topluluk üyelerinin ilanlarını incele veya kendi oyununu satışa çıkar.</p>
      </div>
    </div>

    <!-- Arama Çubuğu ve İlan Ver Butonu -->
    <div class="top-action-bar">
      <div class="search-wrapper">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="İlanlarda oyun veya açıklama ara..." 
          class="search-input"
        />
      </div>

      <router-link to="/marketplace/create" class="create-btn">
        + İlan Ver
      </router-link>
    </div>

    <!-- Durum Alanları -->
    <div v-if="isLoading" class="state-box">⏳ İlanlar yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ Hata: {{ errorMessage }}</div>

    <!-- İlanlar Grid Alanı -->
    <div v-else-if="filteredListings.length > 0" class="listings-grid">
      <div 
        v-for="item in filteredListings" 
        :key="item.id" 
        class="listing-card clickable"
        @click="goToDetail(item.id)"
      >
        <div class="listing-thumb">
          <img :src="item.games?.thumbnail_url || 'https://via.placeholder.com/300x200?text=Masa+Oyunu'" :alt="item.games?.title" />
        </div>

        <div class="listing-info">
          <div class="listing-header-row">
            <h3 class="game-title">{{ item.games?.title || 'Bilinmeyen Oyun' }}</h3>
            <span class="price">{{ item.price }} TL</span>
          </div>

          <div class="badges">
            <span class="badge condition">Durum: {{ item.condition }}</span>
            <span class="badge sleeves">{{ item.has_sleeves ? 'Sleeved ✅' : 'Kılıfsız ❌' }}</span>
          </div>

          <p class="seller-info">Satıcı: <strong>{{ item.profiles?.username || 'Topluluk Üyesi' }}</strong></p>

          <p class="listing-desc" v-if="item.description">
            "{{ item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description }}"
          </p>
        </div>
      </div>
    </div>

    <div v-else class="state-box">
      📦 Henüz pazar yerinde aktif bir ilan bulunmuyor. İlk ilanı sen oluşturabilirsin!
    </div>
  </div>
</template>

<style scoped>
.marketplace-page {
  padding: 1rem 0 3rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-top-section {
  margin-bottom: 1.5rem;
}

.header-titles h2 {
  font-size: 2.2rem;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
}

.header-titles p {
  color: #64748b;
  font-size: 1.05rem;
  margin: 0;
}

.top-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 280px;
}

.search-input {
  width: 100%;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  box-sizing: border-box;
  background: #ffffff;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.15);
}

.create-btn {
  background-color: #42b983;
  color: white;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.35);
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.create-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
}

.listings-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .listings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .listings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.listing-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.listing-card.clickable {
  cursor: pointer;
}

.listing-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.06);
}

.listing-thumb {
  height: 180px;
  background: #f1f5f9;
  overflow: hidden;
}

.listing-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listing-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.listing-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.game-title {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
  font-weight: 700;
}

.price {
  font-size: 1.2rem;
  font-weight: 800;
  color: #42b983;
  white-space: nowrap;
}

.badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
}

.seller-info {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.listing-desc {
  font-size: 0.9rem;
  color: #475569;
  margin: 0;
  line-height: 1.4;
  font-style: italic;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 8px;
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

.error {
  color: #e74c3c;
  background: #fdf2f2;
  border-color: #f8d7da;
}
</style>