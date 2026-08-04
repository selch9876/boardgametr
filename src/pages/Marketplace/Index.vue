<!-- src/pages/Marketplace/Index.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const router = useRouter()

const listings = ref([])
const games = ref([]) // Katalogdaki oyunları kontrol etmek için
const isLoading = ref(true)
const errorMessage = ref(null)
const searchQuery = ref('')
const isLoggedIn = ref(false)

onMounted(async () => {
  isLoading.value = true

  // 1. Oturum açmış kullanıcı kontrolü
  const { data: { session } } = await supabase.auth.getSession()
  isLoggedIn.value = !!session

  supabase.auth.onAuthStateChange((event, session) => {
    isLoggedIn.value = !!session
  })

  // 2. İlanları ve oyun kataloğunu çekme işlemi
  const response = await marketService.getAllListings()
  const gamesResponse = await marketService.getAllGames()
  
  if (response.success) {
    listings.value = response.data
  } else {
    errorMessage.value = response.error
  }

  if (gamesResponse.success) {
    games.value = gamesResponse.data
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

// Yazılan arama terimiyle tam eşleşen resmi/kayıtlı bir oyun katalogda var mı kontrolü
const hasExactMatchInCatalog = computed(() => {
  if (!searchQuery.value.trim()) return true
  return games.value.some(
    game => game.title.toLowerCase() === searchQuery.value.trim().toLowerCase()
  )
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

      <!-- Sadece giriş yapmış kullanıcılara görünür -->
      <router-link 
        v-if="isLoggedIn" 
        to="/marketplace/create" 
        class="create-btn"
      >
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
        <!-- Katalog Sayfasındaki Gibi Placeholder Destekli Görsel Alanı -->
        <div class="listing-thumb">
          <div class="placeholder-container">
            <img 
              :src="item.games?.thumbnail_url" 
              :alt="item.games?.title" 
              @error="(e) => e.target.style.display = 'none'"
            />
            <div class="placeholder-overlay">
              <img src="/placeholder.jpg" class="bg-placeholder" alt="" />
              <span class="game-title-text">{{ item.games?.title || 'Masa Oyunu' }}</span>
            </div>
          </div>
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

    <!-- İlan Bulunamadı / Arama Sonucu Yok Durumu -->
    <div v-else class="state-box not-found-box">
      <p>📦 Aradığınız kriterlere uygun ilan bulunamadı.</p>
      
      <!-- Eğer arama yapılmışsa ve katalogda da eşleşme yoksa "Kataloğa Ekle" ipucu göster -->
      <div v-if="!hasExactMatchInCatalog && searchQuery.trim()" class="not-found-hint">
        Aradığın oyun katalogda da yok mu? 
        <router-link to="/games/create" class="inline-link">Hemen Kataloğa Ekle →</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marketplace-page {
  padding: 1rem 0 3rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

/* Placeholder Stilleri (Katalog Sayfasıyla Birebir Aynı) */
.placeholder-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-container img:not(.bg-placeholder) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}

.placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.bg-placeholder {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
  filter: grayscale(20%);
}

.game-title-text {
  position: relative;
  z-index: 3;
  padding: 0 1rem;
  text-align: center;
  font-family: sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #0f172a;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.8);
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

.not-found-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.not-found-hint {
  font-size: 0.95rem;
  color: #64748b;
}

.inline-link {
  color: #42b983;
  font-weight: 700;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.error {
  color: #e74c3c;
  background: #fdf2f2;
  border-color: #f8d7da;
}
</style>