<!-- src/pages/Games/Index.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'

const router = useRouter()

const games = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)
const searchQuery = ref('')

onMounted(async () => {
  isLoading.value = true
  const response = await marketService.getAllGames()
  
  if (response.success) {
    games.value = response.data
  } else {
    errorMessage.value = response.error
  }
  isLoading.value = false
})

const filteredGames = computed(() => {
  return games.value.filter(game => {
    const title = game.title || ''
    return title.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const goToDetail = (gameId) => {
  router.push(`/games/${gameId}`)
}
</script>

<template>
  <div class="games-catalog-page">
    <!-- Üst Başlık -->
    <div class="page-top-section">
      <div class="header-titles">
        <h2>Oyun Kataloğu</h2>
        <p>Platformumuzdaki tüm masa oyunlarını keşfet, incele veya yenisini ekle.</p>
      </div>
    </div>

    <!-- Arama Çubuğu ve Yeni Oyun Ekle Butonu -->
    <div class="top-action-bar">
      <div class="search-wrapper">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Katalogda oyun ara (örn: Catan, Scythe...)" 
          class="search-input"
        />
      </div>

      <router-link to="/games/create" class="create-game-btn">
        + Yeni Oyun Ekle
      </router-link>
    </div>

    <!-- Durum Alanları -->
    <div v-if="isLoading" class="state-box">⏳ Oyunlar yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ Hata: {{ errorMessage }}</div>

    <!-- Oyun Listesi Grid Alanı -->
    <div v-else-if="filteredGames.length > 0" class="games-grid">
      <div 
        v-for="game in filteredGames" 
        :key="game.id" 
        class="game-card clickable" 
        @click="goToDetail(game.id)"
      >
        <div class="game-thumb">
          <img :src="game.thumbnail_url || 'https://via.placeholder.com/300x200?text=Masa+Oyunu'" :alt="game.title" />
        </div>
        
        <div class="game-info">
          <h3>{{ game.title }}</h3>
          
          <!-- Detay Rozetleri (Kategori, Oyuncu, Süre) -->
          <div class="badges">
            <span v-if="game.categories" class="badge category-badge">🏷️ {{ game.categories.name }}</span>
            <span class="badge">👥 {{ game.min_players }}-{{ game.max_players }} Oyuncu</span>
            <span class="badge">⏱️ {{ game.play_time }} dk</span>
          </div>

          <!-- Dil Bağımlılığı -->
          <div class="lang-dep">
            <span class="lang-label">Dil:</span> {{ game.language_dependence || 'Bağımsız' }}
          </div>

          <!-- Açıklama Özeti -->
          <p class="game-desc" v-if="game.description">
            {{ game.description.length > 100 ? game.description.substring(0, 100) + '...' : game.description }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="state-box">
      📦 Aradığınız kriterlere uygun oyun bulunamadı. Hemen yukarıdan yeni oyun ekleyebilirsiniz!
    </div>
  </div>
</template>

<style scoped>
.games-catalog-page {
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

/* Arama Çubuğu ve Buton Alanı */
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

.create-game-btn {
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

.create-game-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.5);
}

/* Oyun Kartları Grid */
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

.game-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.category-badge {
  background: #e0f2fe;
  color: #0369a1;
}

.lang-dep {
  font-size: 0.85rem;
  color: #64748b;
}

.lang-label {
  font-weight: 600;
  color: #334155;
}

.game-desc {
  font-size: 0.9rem;
  color: #475569;
  margin: 0;
  line-height: 1.4;
  flex: 1;
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