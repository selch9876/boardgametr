<!-- src/pages/Profile/MyCollection.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const router = useRouter()

const userGames = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)
const activeTab = ref('owned') // 'owned' veya 'wishlist'

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    alert('Koleksiyonunuzu görmek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  const response = await marketService.getUserGames(session.user.id)

  if (response.success) {
    userGames.value = response.data
  } else {
    errorMessage.value = 'Koleksiyon yüklenirken bir hata oluştu: ' + response.error
  }

  isLoading.value = false
})

// Sekmelere göre filtrelenmiş oyunlar
const filteredGames = computed(() => {
  return userGames.value.filter(item => item.status === activeTab.value)
})

const goToGameDetail = (gameId) => {
  router.push(`/games/${gameId}`)
}
</script>

<template>
  <div class="collection-page">
    <div class="page-header">
      <h2>Koleksiyonum ve İstek Listem</h2>
      <p>Sahip olduğun masa oyunlarını yönet ve keşfetmeyi bekleyen istek listeni incele.</p>
    </div>

    <!-- Sekme Butonları -->
    <div class="tabs-bar">
      <button 
        @click="activeTab = 'owned'" 
        :class="['tab-btn', { active: activeTab === 'owned' }]"
      >
        📦 Sahip Olduğum Oyunlar ({{ userGames.filter(i => i.status === 'owned').length }})
      </button>
      <button 
        @click="activeTab = 'wishlist'" 
        :class="['tab-btn', { active: activeTab === 'wishlist' }]"
      >
        ❤️ İstek Listem ({{ userGames.filter(i => i.status === 'wishlist').length }})
      </button>
    </div>

    <!-- Durum Alanları -->
    <div v-if="isLoading" class="state-box">⏳ Koleksiyon yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ {{ errorMessage }}</div>

    <!-- Oyun Listesi Grid -->
    <div v-else-if="filteredGames.length > 0" class="games-grid">
      <div 
        v-for="item in filteredGames" 
        :key="item.id" 
        class="game-card clickable"
        @click="goToGameDetail(item.games?.id)"
      >
        <div class="game-thumb">
          <div class="placeholder-container">
            <img 
              :src="item.games?.thumbnail_url" 
              :alt="item.games?.title" 
              @error="(e) => e.target.style.display = 'none'"
            />
            <div class="placeholder-overlay">
              <img src="/placeholder.jpg" class="bg-placeholder" alt="" />
              <span class="game-title-text">{{ item.games?.title }}</span>
            </div>
          </div>
        </div>

        <div class="game-info">
          <h3>{{ item.games?.title }}</h3>
          <div class="badges">
            <span class="badge">
              👥 {{ item.games?.min_players === item.games?.max_players ? `${item.games?.min_players} Oyuncu` : `${item.games?.min_players} - ${item.games?.max_players} Oyuncu` }}
            </span>
            <span class="badge">⏱️ {{ item.games?.play_time }} dk</span>
          </div>
          <div class="lang-dep">
            <span class="lang-label">Dil:</span> {{ item.games?.language_dependence || 'Bağımsız' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Boş Durum -->
    <div v-else class="state-box">
      <p v-if="activeTab === 'owned'">📦 Henüz koleksiyonunuza eklediğiniz bir oyun bulunmuyor.</p>
      <p v-else>📌 İstek listenizde henüz bir oyun bulunmuyor.</p>
    </div>
  </div>
</template>

<style scoped>
.collection-page {
  padding: 1rem 0 4rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2.2rem;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
}

.page-header p {
  color: #64748b;
  font-size: 1.05rem;
  margin: 0;
}

.tabs-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1rem;
}

.tab-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e2e8f0;
}

.tab-btn.active {
  background: #42b983;
  color: white;
  border-color: #369c6d;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
}

.games-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.game-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.game-card.clickable {
  cursor: pointer;
}

.game-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.06);
}

.game-thumb {
  height: 200px;
  background: #f1f5f9;
  overflow: hidden;
}

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

.game-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.game-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 700;
}

.badges {
  display: flex;
  flex-wrap: wrap;
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

.lang-dep {
  font-size: 0.85rem;
  color: #64748b;
}

.lang-label {
  font-weight: 600;
  color: #334155;
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