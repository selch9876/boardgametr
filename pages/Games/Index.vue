<!-- src/pages/Games/Index.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { marketService } from '../../services/marketService'

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

// Arama kutusuna yazılan kelimeye göre oyunları anlık filtreleme
const filteredGames = computed(() => {
  return games.value.filter(game => 
    game.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="games-page">
    <header class="page-header">
      <h2>Oyun Veritabanı ve Katalog</h2>
      <p>Sistemimizde kayıtlı tüm masa oyunlarını inceleyin, detaylarına ve ikinci el ilanlarına göz atın.</p>
    </header>

    <!-- Arama Çubuğu -->
    <div class="search-bar-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Katalogda oyun ara (örn: Scythe, Catan...)" 
        class="search-input"
      />
    </div>

    <!-- Durum Yönetimi -->
    <div v-if="isLoading" class="state-box">⏳ Oyun kataloğu yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ Hata: {{ errorMessage }}</div>

    <!-- Oyun Kartları Grid Listesi -->
    <div v-else-if="filteredGames.length > 0" class="games-grid">
      <div v-for="game in filteredGames" :key="game.id" class="game-item-card">
        <div class="image-wrapper">
          <img :src="game.thumbnail_url" :alt="game.title" class="game-thumb" />
        </div>
        <div class="game-info">
          <h3 class="game-name">{{ game.title }}</h3>
          <span class="lang-badge">Dil Bağımlılığı: {{ game.language_dependence || 'Belirtilmemiş' }}</span>
          
          <div class="card-actions">
            <router-link :to="`/games/${game.id}`" class="detail-link">Oyunu İncele</router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="state-box">
      🔍 Aradığınız kriterlere uygun oyun bulunamadı.
    </div>
  </div>
</template>

<style scoped>
.games-page { padding: 1rem 0; }
.page-header { margin-bottom: 2rem; }
.page-header h2 { font-size: 2rem; color: #2c3e50; margin-bottom: 0.5rem; }
.page-header p { color: #7f8c8d; }

.search-bar-container { margin-bottom: 2rem; }
.search-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  box-sizing: border-box;
}

.games-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .games-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .games-grid { grid-template-columns: repeat(3, 1fr); }
}

.game-item-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}
.game-item-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.05); }

.image-wrapper { height: 180px; background: #f8f9fa; border-bottom: 1px solid #eaeaea; }
.game-thumb { width: 100%; height: 100%; object-fit: cover; }

.game-info { padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1; }
.game-name { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #2c3e50; }
.lang-badge { font-size: 0.85rem; color: #7f8c8d; margin-bottom: 1rem; }

.card-actions { margin-top: auto; }
.detail-link {
  display: block;
  text-align: center;
  background-color: #3498db;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.2s;
}
.detail-link:hover { background-color: #2980b9; }

.state-box { text-align: center; padding: 3rem; color: #7f8c8d; font-size: 1.1rem; background: #f8f9fa; border-radius: 8px; }
.error { color: #e74c3c; background: #fdf0ed; }
</style>