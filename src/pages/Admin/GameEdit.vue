<!-- src/pages/Admin/GameEdit.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const route = useRoute()
const router = useRouter()

const game = ref({
  title: '',
  min_players: 1,
  max_players: 4,
  min_age: 12,
  play_time: '30 - 60',
  language_dependence: 'Dil Bağımsız',
  thumbnail_url: '',
  description: '',
  category_id: null
})

const categories = ref([]) 

const isLoading = ref(true)
const isSubmitting = ref(false)
const isUploading = ref(false)
const errorMessage = ref(null)

onMounted(async () => {
  // 1. Admin yetki kontrolü
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    alert('Bu sayfaya erişmek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  // Kategorileri çek
  const { data: catData } = await supabase.from('categories').select('*')
  if (catData) categories.value = catData

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_admin) {
    alert('Bu alana sadece yöneticiler erişebilir!')
    router.push('/games')
    return
  }

  // 2. Oyun verilerini çek
  const gameId = route.params.id
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (error) {
    errorMessage.value = 'Oyun bilgileri yüklenemedi.'
  } else {
    game.value = data
  }
  isLoading.value = false
})

// Bilgisayardan görsel seçip Supabase Storage'a yükleme fonksiyonu
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  errorMessage.value = null

  const response = await marketService.uploadGameThumbnail(file)
  isUploading.value = false

  if (response.success) {
    game.value.thumbnail_url = response.url
  } else {
    errorMessage.value = 'Görsel yüklenemedi: ' + response.error
  }
}

const handleUpdate = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  const { error } = await supabase
    .from('games')
    .update({
      title: game.value.title,
      min_players: parseInt(game.value.min_players),
      max_players: parseInt(game.value.max_players),
      min_age: parseInt(game.value.min_age),
      play_time: game.value.play_time,
      language_dependence: game.value.language_dependence,
      category_id: game.value.category_id,
      thumbnail_url: game.value.thumbnail_url,
      description: game.value.description
    })
    .eq('id', route.params.id)

  if (error) {
    errorMessage.value = 'Güncelleme hatası: ' + error.message
  } else {
    alert('Oyun başarıyla güncellendi! 🎉')
    router.push(`/games/${route.params.id}`)
  }
  isSubmitting.value = false
}
</script>

<template>
  <div class="admin-edit-page">
    <!-- Geri Butonu Doğrudan Detay Sayfasına Yönlendirildi -->
    <button class="back-btn" @click="router.push(`/games/${route.params.id}`)">← Detay Sayfasına Dön</button>
    
    <div class="form-card">
      <h2>Oyun Düzenleme (CMS)</h2>
      <p class="subtitle">Oyun bilgilerini, yaş sınırını ve süre aralıklarını buradan güncelleyebilirsin.</p>

      <div v-if="isLoading" class="state">Yükleniyor...</div>
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <form v-if="!isLoading" @submit.prevent="handleUpdate" class="cms-form">
        <div class="form-group">
          <label>Oyun Adı</label>
          <input v-model="game.title" type="text" class="form-input" required />
        </div>

        <div class="row-group">
          <div class="form-group">
            <label>Min Oyuncu</label>
            <input v-model.number="game.min_players" type="number" class="form-input" min="1" required />
          </div>
          <div class="form-group">
            <label>Max Oyuncu</label>
            <input v-model.number="game.max_players" type="number" class="form-input" min="1" required />
          </div>
          <div class="form-group">
            <label>Yaş Sınırı (Min)</label>
            <input v-model.number="game.min_age" type="number" class="form-input" min="0" placeholder="Örn: 12" required />
          </div>
        </div>

        <div class="row-group">
          <div class="form-group">
            <label>Süre Aralığı</label>
            <select v-model="game.play_time" class="form-input" required>
              <option value="15 - 30">15 - 30 dk</option>
              <option value="30 - 45">30 - 45 dk</option>
              <option value="30 - 60">30 - 60 dk</option>
              <option value="45 - 90">45 - 90 dk</option>
              <option value="60 - 90">60 - 90 dk</option>
              <option value="60 - 120">60 - 120 dk</option>
              <option value="90 - 180">90 - 180 dk</option>
              <option value="120 - 240">120 - 240 dk</option>
              <option value="180+">180+ dk</option>
            </select>
          </div>

          <div class="form-group">
            <label>Dil Bağımlılığı</label>
            <select v-model="game.language_dependence" class="form-input" required>
              <option value="Dil Bağımsız">Dil Bağımsız</option>
              <option value="Az Dil Bağımlılığı">Az Dil Bağımlılığı</option>
              <option value="Orta Dil Bağımlılığı">Orta Dil Bağımlılığı</option>
              <option value="Yüksek Dil Bağımlılığı">Yüksek Dil Bağımlılığı</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Kategori</label>
          <select v-model="game.category_id" class="form-input" required>
            <option disabled value="">Kategori Seçin</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Görsel Yükleme Alanı -->
        <div class="form-group">
          <label>Oyun Görseli (Thumbnail)</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input v-model="game.thumbnail_url" type="url" class="form-input" placeholder="https://... veya dosya yükleyin" />
            
            <label class="upload-btn" style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap;">
              <span>{{ isUploading ? 'Yükleniyor...' : '📁 Görsel Yükle' }}</span>
              <input type="file" accept="image/*" @change="handleFileUpload" style="display: none;" :disabled="isUploading" />
            </label>
          </div>
          <span v-if="isUploading" style="font-size: 0.8rem; color: #64748b;">Görsel Supabase Storage'a yükleniyor...</span>
        </div>

        <div class="form-group">
          <label>Açıklama</label>
          <textarea v-model="game.description" rows="5" class="form-input"></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting || isUploading">
          {{ isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet 💾' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-edit-page { max-width: 700px; margin: 0 auto; padding: 2rem 0; }
.back-btn { background: none; border: none; color: #42b983; font-weight: 700; cursor: pointer; margin-bottom: 1.5rem; padding: 0; }
.back-btn:hover { text-decoration: underline; }
.form-card { background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.form-card h2 { margin: 0 0 0.5rem 0; color: #0f172a; font-weight: 800; }
.subtitle { color: #64748b; margin-bottom: 2rem; }
.cms-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 0; }
.form-group label { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.form-input { padding: 0.8rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 1rem; outline: none; background: #fff; color: #0f172a; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #42b983; box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15); }
.row-group { display: flex; gap: 1rem; width: 100%; flex-wrap: wrap; }
.upload-btn { background: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; padding: 0.8rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem; transition: all 0.2s; }
.upload-btn:hover { background: #e2e8f0; border-color: #94a3b8; }
.submit-btn { background: #42b983; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; margin-top: 1rem; box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3); width: 100%; }
.submit-btn:hover { background: #369c6d; }
.submit-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
.error-banner { background: #fdf2f2; color: #e74c3c; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 600; }
.state { text-align: center; padding: 2rem; color: #64748b; }
</style>