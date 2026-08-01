<!-- src/pages/Games/Create.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'

const router = useRouter()

const categories = ref([])
const isSubmitting = ref(false)
const errorMessage = ref(null)

const form = ref({
  title: '',
  thumbnail_url: '',
  category_id: '',
  min_players: 1,
  max_players: 4,
  play_time: 60,
  language_dependence: 'Bağımsız',
  description: ''
})

onMounted(async () => {
  const res = await marketService.getCategories()
  if (res.success) {
    categories.value = res.data
    if (categories.value.length > 0) {
      form.value.category_id = categories.value[0].id // Varsayılan ilk kategori
    }
  }
})

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    alert('Lütfen oyun adını girin.')
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  const response = await marketService.createGame(form.value)

  if (response.success) {
    alert('Oyununuz başarıyla alındı! Yönetici onayından sonra katalogda yerini alacaktır. 🎉')
    router.push('/games')
  } else {
    errorMessage.value = response.error
  }

  isSubmitting.value = false
}
</script>

<template>
  <div class="page-container">
    <button class="back-btn" @click="router.back()">← Geri Dön</button>

    <div class="form-card">
      <h2>Kataloğa Yeni Oyun Ekle</h2>
      <p class="subtitle">Oyunun detaylarını ve kategorisini seçerek topluluğa katkıda bulun.</p>

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <form @submit.prevent="handleSubmit" class="styled-form">
        <div class="form-group">
          <label>Oyun Adı *</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="Örn: Brass: Birmingham" 
            class="form-input" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Kapak Görseli URL</label>
          <input 
            v-model="form.thumbnail_url" 
            type="url" 
            placeholder="https://ornek.com/gorsel.jpg" 
            class="form-input" 
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Kategori *</label>
            <select v-model="form.category_id" class="form-input" required>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Dil Bağımlılığı</label>
            <select v-model="form.language_dependence" class="form-input">
              <option value="Bağımsız">Bağımsız (Metin yok/Çok az)</option>
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta (Temel İngilizce gerektirir)</option>
              <option value="Yüksek">Yüksek (Yoğun metin/Hikaye bazlı)</option>
            </select>
          </div>
        </div>

        <div class="form-row-3">
          <div class="form-group">
            <label>Min. Oyuncu</label>
            <input v-model="form.min_players" type="number" min="1" class="form-input" />
          </div>
          <div class="form-group">
            <label>Maks. Oyuncu</label>
            <input v-model="form.max_players" type="number" min="1" class="form-input" />
          </div>
          <div class="form-group">
            <label>Süre (Dakika)</label>
            <input v-model="form.play_time" type="number" min="5" step="5" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label>Uzun Açıklama / Detaylar</label>
          <textarea 
            v-model="form.description" 
            rows="5" 
            placeholder="Oyunun teması, mekanikleri veya kutu içeriği hakkında detaylar..."
            class="form-input"
          ></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Gönderiliyor...' : 'Onaya Gönder 🚀' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 1rem 0 3rem 0; max-width: 750px; margin: 0 auto; }
.back-btn { background: none; border: none; color: #42b983; cursor: pointer; font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; padding: 0; }
.back-btn:hover { text-decoration: underline; }
.form-card { background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; padding: 2.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.form-card h2 { margin: 0 0 0.5rem 0; font-size: 2rem; color: #0f172a; font-weight: 800; }
.subtitle { color: #64748b; margin-bottom: 2rem; }
.error-banner { background: #fdf2f2; color: #e74c3c; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; font-weight: 600; border: 1px solid #f8d7da; }
.styled-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
@media (max-width: 640px) { .form-row, .form-row-3 { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.form-input { padding: 0.85rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 1rem; background: #ffffff; color: #0f172a; box-sizing: border-box; transition: all 0.2s; width: 100%; }
.form-input:focus { outline: none; border-color: #42b983; box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15); }
textarea.form-input { resize: vertical; }
.submit-btn { background-color: #42b983; color: white; border: none; padding: 1rem; border-radius: 12px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3); margin-top: 1rem; }
.submit-btn:hover { background-color: #369c6d; transform: translateY(-2px); }
.submit-btn:disabled { background-color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
</style>