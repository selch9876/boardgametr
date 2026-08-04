<!-- src/pages/Marketplace/Create.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marketService } from '../../services/marketService'

const router = useRouter()
const route = useRoute()

const games = ref([])
const isLoadingGames = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref(null)

// Arama ve Seçim İçin State'ler
const gameSearchQuery = ref('')
const isDropdownOpen = ref(false)
const isPreselected = ref(false) // Detay sayfasından hazır gelip gelmediğini kontrol eder

// Form Alanları
const form = ref({
  game_id: '',
  price: '',
  condition: 'like_new',
  has_sleeves: false,
  description: ''
})

onMounted(async () => {
  const response = await marketService.getAllGames()
  if (response.success) {
    games.value = response.data

    // URL'den game_id ve game_title parametrelerini yakala
    const urlGameId = route.query.game_id
    const urlGameTitle = route.query.game_title

    if (urlGameId) {
      // ID ile kataloğumuzda eşleşen oyunu bul
      const matchedGame = games.value.find(g => String(g.id) === String(urlGameId))
      
      if (matchedGame) {
        selectGame(matchedGame)
        isPreselected.value = true // Hazır geldiği için arama ve katalog ekleme alanını kilitle/gizle
      } else if (urlGameTitle) {
        // Eğer ID listede direkt bulunamazsa ama title geldiyse arama alanına yaz
        gameSearchQuery.value = urlGameTitle
        form.value.game_id = urlGameId
        isPreselected.value = true
      }
    }
  } else {
    errorMessage.value = 'Oyun kataloğu yüklenemedi.'
  }
  isLoadingGames.value = false
})

// Kullanıcının yazdığına göre oyunları filtreleme
const filteredGames = computed(() => {
  if (!gameSearchQuery.value) return games.value.slice(0, 10)
  return games.value.filter(game => 
    game.title.toLowerCase().includes(gameSearchQuery.value.toLowerCase())
  )
})

// Oyun seçildiğinde tetiklenen fonksiyon
const selectGame = (game) => {
  form.value.game_id = game.id
  gameSearchQuery.value = game.title
  isDropdownOpen.value = false
}

// Input odak kaybettiğinde listenin kapanması için gecikmeli kontrol
const handleBlur = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

const handleSubmit = async () => {
  if (!form.value.game_id || !form.value.price) {
    alert('Lütfen listeden geçerli bir oyun seçin ve fiyat belirtin.')
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  const listingPayload = {
    game_id: form.value.game_id,
    price: parseFloat(form.value.price),
    condition: form.value.condition,
    has_sleeves: form.value.has_sleeves,
    description: form.value.description,
    status: 'active',
  }

  const response = await marketService.createListing(listingPayload)

  if (response.success) {
    alert('İlanınız başarıyla yayınlandı! 🎉')
    router.push('/marketplace')
  } else {
    errorMessage.value = 'İlan yayınlanırken bir hata oluştu: ' + response.error
  }

  isSubmitting.value = false
}
</script>

<template>
  <div class="create-listing-page">
    <button class="back-btn" @click="router.back()">← Pazar Yerine Dön</button>

    <div class="form-card">
      <h2>İkinci El İlanı Oluştur</h2>
      <p class="subtitle">Kutunu kaldırmaktan vazgeçtiğin oyunları diğer oyuncularla buluştur.</p>

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <form @submit.prevent="handleSubmit" class="listing-form">
        <!-- Akıllı Oyun Arama ve Seçim Alanı -->
        <div class="form-group dropdown-container">
          <label>Hangi Oyunu Satıyorsun? *</label>

          <!-- Eğer oyun detayından hazır geldiyse sadece seçilen oyunun adını gösteren kilitli kutu -->
          <div v-if="isPreselected" class="preselected-game-box">
            <span>🎲 <strong>{{ gameSearchQuery }}</strong></span>
            <span class="locked-badge">Seçildi</span>
          </div>

          <!-- Eğer serbest gelindiyse arama yapılabilen input alanı -->
          <div v-else class="search-select-box">
            <input 
              type="text" 
              v-model="gameSearchQuery" 
              @focus="isDropdownOpen = true"
              @blur="handleBlur"
              placeholder="Katalogda oyun arayın (örn: Catan, Scythe...)" 
              class="form-input"
              autocomplete="off"
            />
            
            <!-- Açılır Eşleşme Listesi -->
            <ul v-if="isDropdownOpen && filteredGames.length > 0" class="dropdown-list">
              <li 
                v-for="game in filteredGames" 
                :key="game.id" 
                @click="selectGame(game)"
                class="dropdown-item"
              >
                {{ game.title }}
              </li>
            </ul>
            
            <div v-if="isDropdownOpen && filteredGames.length === 0 && !isLoadingGames" class="dropdown-list empty-notice">
              <span>Eşleşen oyun bulunamadı.</span>
            </div>
          </div>

          <!-- Kataloğa Ekle İpucu: Sadece serbest arama yapıldığında görünür -->
          <div v-if="!isPreselected" class="not-found-hint">
            Aradığın oyun listede yok mu? 
            <router-link to="/games/create" class="inline-link">Hemen Kataloğa Ekle →</router-link>
          </div>
        </div>

        <!-- Fiyat -->
        <div class="form-group">
          <label>Fiyat (TL) *</label>
          <input 
            v-model="form.price" 
            type="number" 
            placeholder="Örn: 750" 
            class="form-input" 
            required 
            min="0"
          />
        </div>

        <!-- Kondisyon Durumu -->
        <div class="form-group">
          <label>Kondisyon / Kutu Durumu *</label>
          <select v-model="form.condition" class="form-input">
            <option value="new_in_shrink">Sıfır (Jelatininde)</option>
            <option value="punched_unplayed">Oynanmamış (Punch edilmiş ama masaya oturmamış)</option>
            <option value="like_new">Yeni Gibi (Birkaç kez oynandı, kusursuz)</option>
            <option value="good">İyi (Normal kullanım izleri var, eksiksiz)</option>
            <option value="fair">Yıpranmış (Kutuda deformasyon olabilir)</option>
          </select>
        </div>

        <!-- Kart Kılıfı (Sleeves) Durumu -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input v-model="form.has_sleeves" type="checkbox" />
            <span>Kartlar kılıflı (sleeved) mi?</span>
          </label>
        </div>

        <!-- Açıklama -->
        <div class="form-group">
          <label>Açıklama / Notlar</label>
          <textarea 
            v-model="form.description" 
            rows="4" 
            placeholder="Oyunun bileşen durumu, kargo detayları veya eklemek istedikleriniz..."
            class="form-input"
          ></textarea>
        </div>

        <!-- Gönder Butonu -->
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla 🚀' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-listing-page {
  padding: 1rem 0 3rem 0;
  max-width: 700px;
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
.back-btn:hover {
  text-decoration: underline;
}

.form-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 2.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.form-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #0f172a;
  font-weight: 800;
}

.subtitle {
  color: #64748b;
  margin-bottom: 2rem;
}

.error-banner {
  background: #fdf2f2;
  color: #e74c3c;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  border: 1px solid #f8d7da;
}

.listing-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.form-group label {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  transition: all 0.2s;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15);
}

/* Önceden Seçilmiş / Kilitli Oyun Kutusu */
.preselected-game-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #1e293b;
  font-size: 1rem;
}

.locked-badge {
  font-size: 0.75rem;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 700;
}

/* Akıllı Arama Dropdown Listesi */
.search-select-box {
  position: relative;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.dropdown-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8fafc;
  color: #42b983;
  font-weight: 600;
}

.empty-notice {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.not-found-hint {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.3rem;
}

.inline-link {
  color: #42b983;
  font-weight: 700;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: #334155;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #42b983;
  cursor: pointer;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>